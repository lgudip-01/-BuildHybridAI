import 'fake-indexeddb/auto';
import { beforeEach, expect, it, vi } from 'vitest';
import type { AI } from 'firebase/ai';
import type { AiBridge, ApprovedBatch } from '@clause-guard/core/types';
import { approve, assertApproved } from '@clause-guard/privacy-engine/approval';
import { mask } from '@clause-guard/privacy-engine/mask';

const sdk = vi.hoisted(() => ({ generate: vi.fn(), factory: vi.fn() }));
vi.mock('firebase/ai', async original => ({ ...await original<typeof import('firebase/ai')>(), getGenerativeModel: sdk.factory }));
vi.mock('./analysisConfig', async original => {
  const config = await original<typeof import('./analysisConfig')>();
  return { ...config, loadAnalysisConfig: async () => config.DEFAULT_ANALYSIS_CONFIG };
});
import { WebBridge } from './webBridge';
import { ReviewSession, reviewBusy } from './reviewFlow';

const contract = 'Email notices to synthetic.person@example.test.\n\nPayment is $100.';
const bridge = new WebBridge({} as AI);
const response = (prompt: string) => {
  const clause = JSON.parse(prompt);
  return { response: { inferenceSource: 'in_cloud', text: () => JSON.stringify({
    clauseId: clause.id, risk: 'medium', explanation: `Review: ${clause.text}`, redline: '', questions: [],
  }) } };
};
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(done => { resolve = done; });
  return { promise, resolve };
}
beforeEach(() => {
  vi.clearAllMocks(); sdk.generate.mockReset();
  sdk.factory.mockImplementation(() => ({ generateContent: sdk.generate }));
  sdk.generate.mockImplementation(async (prompt: string) => response(prompt));
});

it('reports clause reads in order, including a failed read, and waits for approval', async () => {
  const first = deferred();
  const second = deferred();
  const started = deferred();
  const advanced = deferred();
  const analyze = vi.fn();
  const onDevice = vi.fn()
    .mockImplementationOnce(async () => { started.resolve(); await first.promise; throw new Error(); })
    .mockImplementationOnce(async () => {
      advanced.resolve();
      await second.promise;
      return JSON.stringify({ type: 'other', entities: [] });
    });
  const session = new ReviewSession({ onDeviceStatus: async () => 'available', onDevice, analyze }, contract);
  const counts: number[] = [];
  session.subscribe(() => {
    const { finishedClauseReads } = session.getSnapshot();
    if (finishedClauseReads !== undefined) counts.push(finishedClauseReads);
  });
  const pending = session.mask();
  await started.promise;
  expect(session.getSnapshot()).toMatchObject({ phase: 'masking', finishedClauseReads: 0 });
  first.resolve();
  await advanced.promise;
  expect(session.getSnapshot()).toMatchObject({ phase: 'masking', finishedClauseReads: 1 });
  await session.analyzeReviewed();
  second.resolve();
  await pending;
  expect(counts).toEqual([0, 1, 2]);
  expect(session.getSnapshot()).toMatchObject({ phase: 'review', masked: { ok: true, needsReview: true } });
  expect(session.getSnapshot().finishedClauseReads).toBeUndefined();
  expect(analyze).not.toHaveBeenCalled();
});

it('omits model-read progress when masking with patterns alone', async () => {
  const session = new ReviewSession(bridge, contract);
  const counts = new Set<number | undefined>();
  session.subscribe(() => counts.add(session.getSnapshot().finishedClauseReads));
  await session.mask();
  expect(counts).toEqual(new Set([undefined]));
  expect(session.getSnapshot().phase).toBe('review');
});

it('does not analyze until real masking is complete and the user explicitly approves', async () => {
  const session = new ReviewSession(bridge, contract);
  await session.analyzeReviewed();
  expect(sdk.generate).not.toHaveBeenCalled();
  await session.mask();
  expect(session.getSnapshot().phase).toBe('review');
  expect(session.getSnapshot().masked?.ok).toBe(true);
  expect(sdk.generate).not.toHaveBeenCalled();
  await session.analyzeReviewed();
  const state = session.getSnapshot();
  expect(state.phase).toBe('results');
  expect(state.outcome?.restored).toHaveLength(2);
  expect(state.outcome?.restored[0]?.explanation).toContain('synthetic.person@example.test');
  expect(state.outcome?.ranOn).toBe('cloud');
  const sent = sdk.generate.mock.calls.map(call => call[0]).join(' ');
  expect(sent).not.toContain('synthetic.person@example.test');
  expect(sent).not.toContain('$100');
  expect(sent).not.toContain(session.docId);
});

it('keeps partial failures separate from restored results', async () => {
  const session = new ReviewSession(bridge, contract);
  await session.mask();
  sdk.generate.mockImplementationOnce(async (prompt: string) => response(prompt))
    .mockResolvedValueOnce({ response: { inferenceSource: 'in_cloud', text: () => JSON.stringify({ clauseId: 'c2', risk: 'low', explanation: 'Ask [PARTY_Z].', redline: '', questions: [] }) } });
  await session.analyzeReviewed();
  expect(session.getSnapshot().outcome?.restored.map(result => result.clauseId)).toEqual(['c1']);
  expect(session.getSnapshot().outcome?.failed).toMatchObject([{ clauseId: 'c2', reason: 'unknown_placeholder' }]);
});

it('clears old outputs on edit and retains a stable document id across remasking', async () => {
  const session = new ReviewSession(bridge, contract);
  const docId = session.docId;
  await session.mask();
  const previous = session.getSnapshot().masked!;
  if (!previous.ok) throw new Error('Fixture failed masking');
  const previousBatch = approve(previous, { reviewed: true });
  await session.analyzeReviewed();
  expect(session.edit('New notices go to new.person@example.test.')).toBe(true);
  expect(session.getSnapshot()).toEqual({ contract: 'New notices go to new.person@example.test.', phase: 'editing' });
  const calls = sdk.generate.mock.calls.length;
  await session.analyzeReviewed();
  expect(sdk.generate).toHaveBeenCalledTimes(calls);
  await session.mask();
  expect(session.docId).toBe(docId);
  expect(() => assertApproved(previousBatch)).toThrow(expect.objectContaining({ code: 'stale' }));
});

it('locks editing, duplicate analysis and masking during an active request', async () => {
  const session = new ReviewSession(bridge, contract);
  await session.mask();
  const started = deferred(); const gate = deferred();
  sdk.generate.mockImplementationOnce(async (prompt: string) => { started.resolve(); await gate.promise; return response(prompt); });
  const pending = session.analyzeReviewed();
  await started.promise;
  expect(reviewBusy(session.getSnapshot())).toBe(true);
  expect(session.edit('A different contract')).toBe(false);
  await session.analyzeReviewed(); await session.mask();
  expect(session.getSnapshot().contract).toBe(contract);
  expect(sdk.generate).toHaveBeenCalledTimes(1);
  gate.resolve(); await pending;
  expect(sdk.generate).toHaveBeenCalledTimes(2);
  expect(session.getSnapshot().phase).toBe('results');
});

it('discards a reply if an external remask invalidates approval during the request', async () => {
  const session = new ReviewSession(bridge, contract);
  await session.mask();
  const started = deferred(); const gate = deferred();
  sdk.generate.mockImplementationOnce(async (prompt: string) => { started.resolve(); await gate.promise; return response(prompt); });
  const pending = session.analyzeReviewed(); await started.promise;
  await mask(session.docId, [{ id: 'new', index: 0, text: 'Replacement contract.' }], bridge);
  gate.resolve(); await pending;
  expect(session.getSnapshot().phase).toBe('error');
  expect(session.getSnapshot().error).toContain('out of date');
  expect(session.getSnapshot().outcome).toBeUndefined();
  expect(sdk.generate).toHaveBeenCalledTimes(1);
});

it.each(['wrong_doc', 'duplicate', 'missing', 'unknown_source'])('rejects inconsistent bridge results before publishing them: %s', async fault => {
  const inconsistent: AiBridge = {
    onDeviceStatus: async () => 'unavailable', onDevice: async () => { throw new Error('Unexpected local model call'); },
    analyze: async (batch: ApprovedBatch) => {
      assertApproved(batch);
      const results = batch.clauses.map(clause => ({ clauseId: clause.id, risk: 'low' as const, explanation: 'Review wording.', redline: '', questions: [] }));
      return { docId: fault === 'wrong_doc' ? 'another-document' : batch.docId,
        results: fault === 'duplicate' ? [results[0]!, results[0]!] : fault === 'missing' ? [] : results,
        failed: [], ranOn: fault === 'unknown_source' ? 'unconfirmed' as 'cloud' : 'cloud' };
    },
  };
  const session = new ReviewSession(inconsistent, contract);
  await session.mask(); await session.analyzeReviewed();
  expect(session.getSnapshot().phase).toBe('error');
  expect(session.getSnapshot().outcome).toBeUndefined();
});

it('shows all clauses as unavailable without inventing a source when all requests fail', async () => {
  const session = new ReviewSession(bridge, contract);
  await session.mask();
  sdk.generate.mockRejectedValue(new Error('INTERNAL_ERROR_SENTINEL'));
  await session.analyzeReviewed();
  const state = session.getSnapshot();
  expect(state.phase).toBe('error');
  expect(state.outcome?.restored).toEqual([]);
  expect(state.outcome?.failed.map(failure => failure.clauseId)).toEqual(['c1', 'c2']);
  expect(state.outcome?.ranOn).toBeUndefined();
  expect(JSON.stringify(state)).not.toContain('INTERNAL_ERROR_SENTINEL');
  expect(sdk.generate).toHaveBeenCalledTimes(2);
});
