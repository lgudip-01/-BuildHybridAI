import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AI } from 'firebase/ai';
import type { AiBridge, ApprovedBatch, MaskResult } from '@clause-guard/core/types';
import { mask } from '@clause-guard/privacy-engine/mask';
import { unmask } from '@clause-guard/privacy-engine/unmask';
import * as engine from '@clause-guard/privacy-engine/approval';

type SuccessfulMask = Extract<MaskResult, { ok: true }> & { docId: string };
const sdk = vi.hoisted(() => ({ generate: vi.fn(), factory: vi.fn() }));
vi.mock('firebase/ai', async original => ({
  ...await original<typeof import('firebase/ai')>(), getGenerativeModel: sdk.factory,
}));
vi.mock('./analysisConfig', async original => {
  const config = await original<typeof import('./analysisConfig')>();
  return { ...config, loadAnalysisConfig: async () => config.DEFAULT_ANALYSIS_CONFIG };
});
import { WebBridge } from './webBridge';

const localOnly: AiBridge = {
  onDeviceStatus: async () => 'unavailable',
  onDevice: async () => { throw new Error('Unexpected model call in pattern-only test'); },
  analyze: async () => { throw new Error('Unexpected analysis in masking'); },
};
const clauses = [{ id: 'c1', index: 0, text: 'Email notices to synthetic.person@example.test by January 1, 2026.' }];
const bridge = new WebBridge({} as AI);
function response(prompt: string) {
  const clause = JSON.parse(prompt) as { id: string; text: string };
  return { response: { inferenceSource: 'in_cloud', text: () => JSON.stringify({
    clauseId: clause.id, risk: 'medium', explanation: `Review this notice requirement: ${clause.text}`,
    redline: '', questions: [],
  }) } };
}
async function masked(docId: string = crypto.randomUUID()): Promise<SuccessfulMask> {
  const result = await mask(docId, clauses, localOnly);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error('Synthetic fixture failed masking');
  expect(result).toHaveProperty('docId', docId);
  return result as SuccessfulMask;
}
beforeEach(() => {
  vi.clearAllMocks(); sdk.generate.mockReset();
  sdk.factory.mockImplementation(() => ({ generateContent: sdk.generate }));
  sdk.generate.mockImplementation(async (prompt: string) => response(prompt));
});

describe('real privacy engine -> WebBridge integration (cloud SDK mocked)', () => {
  it('uses genuine mask/approve/analyze/unmask, keeping raw fixture values out of requests', async () => {
    const result = await masked();
    expect(result.needsReview).toBe(true);
    const batch = engine!.approve(result, { reviewed: true });
    const answer = await bridge.analyze(batch);
    engine!.assertApproved(batch);
    const shown = await unmask(answer.docId, answer.results);
    expect(answer.docId).toBe(result.docId);
    expect(shown[0]!.explanation).toContain('synthetic.person@example.test');
    expect(shown[0]!.explanation).toContain('January 1, 2026');
    const sent = sdk.generate.mock.calls.map(call => call[0]).join(' ');
    expect(sent).not.toContain('synthetic.person@example.test');
    expect(sent).not.toContain('January 1, 2026');
    expect(sent).not.toContain(result.docId);
  });
  it('rejects required review before any model call', async () => {
    const result = await masked();
    expect(() => engine!.approve(result)).toThrow(expect.objectContaining({ code: 'review_required' }));
    expect(sdk.factory).not.toHaveBeenCalled();
  });
  it('rejects fabricated and copied batches before any model call', async () => {
    const batch = engine!.approve(await masked(), { reviewed: true });
    for (const fake of [{ docId: batch.docId, clauses: batch.clauses }, structuredClone(batch)]) {
      await expect(bridge.analyze(fake)).rejects.toMatchObject({ code: 'not_approved' });
    }
    expect(sdk.factory).not.toHaveBeenCalled();
  });
  it('rejects a copied mask result', async () => {
    const result = await masked();
    expect(() => engine!.approve(structuredClone(result), { reviewed: true }))
      .toThrow(expect.objectContaining({ code: 'not_approved' }));
  });
  it('cannot send text inserted after the leak check', async () => {
    const result = await masked();
    // Frozen results may reject the mutation. Otherwise approve must reject it
    // or use its immutable internal snapshot, never this caller's mutated text.
    try { result.clauses[0]!.text = 'UNMASKED_MUTATION_SENTINEL' as typeof result.clauses[0]['text']; } catch { /* frozen is safe */ }
    let batch: ApprovedBatch;
    try { batch = engine!.approve(result, { reviewed: true }); }
    catch { expect(sdk.generate).not.toHaveBeenCalled(); return; }
    expect(Object.isFrozen(batch)).toBe(true);
    expect(Object.isFrozen(batch.clauses)).toBe(true);
    expect(Object.isFrozen(batch.clauses[0])).toBe(true);
    await bridge.analyze(batch);
    expect(sdk.generate.mock.calls.map(c => c[0]).join(' ')).not.toContain('UNMASKED_MUTATION_SENTINEL');
  });
  it('cannot bypass required review by changing needsReview', async () => {
    const result = await masked();
    try { result.needsReview = false; } catch { /* frozen is safe */ }
    expect(() => engine!.approve(result)).toThrow();
    expect(sdk.factory).not.toHaveBeenCalled();
  });
  it('invalidates an old batch after remasking the same document', async () => {
    const result = await masked();
    const batch = engine!.approve(result, { reviewed: true });
    await masked(result.docId);
    await expect(bridge.analyze(batch)).rejects.toMatchObject({ code: 'stale' });
    expect(sdk.factory).not.toHaveBeenCalled();
  });
  it('invalidates before the new mask run reaches its first async result', async () => {
    const result = await masked();
    const batch = engine!.approve(result, { reviewed: true });
    let release!: (status: 'unavailable') => void;
    const status = new Promise<'unavailable'>(resolve => { release = resolve; });
    const pending = mask(result.docId, clauses, { ...localOnly, onDeviceStatus: () => status });
    try {
      await expect(bridge.analyze(batch)).rejects.toMatchObject({ code: 'stale' });
      expect(sdk.factory).not.toHaveBeenCalled();
    } finally { release('unavailable'); await pending; }
  });
  it('rejects a cloud answer when the document was remasked during the request', async () => {
    const result = await masked();
    const batch = engine!.approve(result, { reviewed: true });
    let started!: () => void;
    let release!: () => void;
    const ready = new Promise<void>(resolve => { started = resolve; });
    const gate = new Promise<void>(resolve => { release = resolve; });
    sdk.generate.mockImplementationOnce(async (prompt: string) => { started(); await gate; return response(prompt); });
    const pending = bridge.analyze(batch);
    // Attach the rejection handler before triggering invalidation.
    const rejection = expect(pending).rejects.toMatchObject({ code: 'stale' });
    await ready;
    try { await masked(result.docId); } finally { release(); }
    await rejection;
    expect(sdk.generate).toHaveBeenCalledTimes(1);
  });
});
