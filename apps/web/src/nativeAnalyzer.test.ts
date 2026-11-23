import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Analysis, ApprovedBatch, CleanText } from '@clause-guard/core/types';

const mocks = vi.hoisted(() => ({ approved: new WeakSet<object>(), checks: vi.fn() }));
vi.mock('./approvalGuard', () => ({
  assertApproved(batch: object) {
    mocks.checks();
    if (!mocks.approved.has(batch)) throw Object.assign(new Error('not approved/current'), { code: 'not_approved' });
  },
}));
import { analyzeApprovedNative, type AnalysisPlugin, type ClauseRequest } from './nativeAnalyzer';
import { AnalysisUnavailableError } from './cloudAnalyzer';

function batch(count = 2): ApprovedBatch {
  const value = {
    docId: 'local-only-doc',
    clauses: Array.from({ length: count }, (_, i) => Object.freeze({
      id: `c${i + 1}`, type: 'indemnity' as const,
      text: `[PARTY_A] indemnifies [PARTY_B]. ${i ? '[AMOUNT_1]' : ''}` as CleanText,
    })),
  };
  Object.freeze(value.clauses); Object.freeze(value); mocks.approved.add(value); return value;
}
const answer = (id: string, extra: Partial<Analysis> = {}): Analysis => ({
  clauseId: id, risk: 'high', explanation: '[PARTY_A] bears broad risk.', redline: '', questions: ['Can [PARTY_B] limit this duty?'], ...extra,
});
const reply = (id: string, source: 'cloud' | 'device' = 'cloud', data: unknown = answer(id)) => ({ text: JSON.stringify(data), source });

function plugin(...replies: Array<ReturnType<typeof reply> | Error>) {
  const analyzeClause = vi.fn<AnalysisPlugin['analyzeClause']>(async () => {
    const next = replies.shift();
    if (next instanceof Error) throw next;
    if (!next) throw new Error('no reply queued');
    return next;
  });
  return { analyzeClause } satisfies AnalysisPlugin;
}

beforeEach(() => { mocks.approved = new WeakSet(); vi.clearAllMocks(); });

describe('native approved-batch analysis', () => {
  it('rejects an unapproved batch before any native request', async () => {
    const p = plugin();
    const forged = { docId: 'x', clauses: [{ id: 'c1', text: '[PARTY_A] pays.' as CleanText }] };
    await expect(analyzeApprovedNative(p, forged)).rejects.toMatchObject({ code: 'not_approved' });
    expect(p.analyzeClause).not.toHaveBeenCalled();
  });

  it('returns validated results, echoes the docId and reports the actual source', async () => {
    const p = plugin(reply('c1'), reply('c2'));
    const result = await analyzeApprovedNative(p, batch(2));
    expect(result.docId).toBe('local-only-doc');
    expect(result.ranOn).toBe('cloud');
    expect(result.results.map(r => r.clauseId)).toEqual(['c1', 'c2']);
    expect(result.failed).toEqual([]);
  });

  it('sends only the masked clause: never the docId, ledger or extra fields', async () => {
    const p = plugin(reply('c1'));
    await analyzeApprovedNative(p, batch(1));
    const request = p.analyzeClause.mock.calls[0]![0] as ClauseRequest;
    expect(JSON.parse(request.input)).toEqual({ id: 'c1', type: 'indemnity', text: '[PARTY_A] indemnifies [PARTY_B]. ' });
    expect(JSON.stringify(request)).not.toContain('local-only-doc');
    expect(Object.keys(request).sort()).toEqual(
      ['allowDeviceFallback', 'cloudSystem', 'deviceSystem', 'input', 'model', 'pin', 'schema', 'timeoutMs']);
  });

  it('limits each request to the placeholders in that clause', async () => {
    const p = plugin(reply('c1'), reply('c2'));
    await analyzeApprovedNative(p, batch(2));
    const [first, second] = p.analyzeClause.mock.calls.map(c => c[0] as ClauseRequest);
    expect(first!.cloudSystem).toContain('["[PARTY_A]","[PARTY_B]"]');
    expect(second!.cloudSystem).toContain('"[AMOUNT_1]"');
  });

  it('pins the rest of the batch to the first source that answered', async () => {
    const p = plugin(reply('c1', 'device'), reply('c2', 'device'));
    const result = await analyzeApprovedNative(p, batch(2));
    expect(result.ranOn).toBe('device');
    const pins = p.analyzeClause.mock.calls.map(c => (c[0] as ClauseRequest).pin);
    expect(pins).toEqual([null, 'device']);
  });

  it('fails a clause answered by a different source than the one the batch is pinned to', async () => {
    const p = plugin(reply('c1', 'cloud'), reply('c2', 'device'));
    const result = await analyzeApprovedNative(p, batch(2));
    expect(result.ranOn).toBe('cloud');
    expect(result.results.map(r => r.clauseId)).toEqual(['c1']);
    expect(result.failed).toEqual([{ clauseId: 'c2', reason: 'invalid_response', detail: expect.any(String) }]);
  });

  it('fails a clause that invents a placeholder, without leaking the model text', async () => {
    const bad = answer('c2', { explanation: '[PARTY_C] is liable.' });
    const p = plugin(reply('c1'), reply('c2', 'cloud', bad));
    const result = await analyzeApprovedNative(p, batch(2));
    expect(result.results.map(r => r.clauseId)).toEqual(['c1']);
    expect(result.failed[0]).toMatchObject({ clauseId: 'c2', reason: 'unknown_placeholder' });
    expect(JSON.stringify(result.failed)).not.toContain('PARTY_C');
  });

  it('fails a clause answered with a different clause id or invalid JSON', async () => {
    const p = plugin(reply('c1', 'cloud', answer('c9')), { text: 'not json', source: 'cloud' });
    const result = await analyzeApprovedNative(p, batch(2));
    expect(result.results).toEqual([]);
    expect(result.failed.map(f => [f.clauseId, f.reason])).toEqual([['c1', 'invalid_response'], ['c2', 'invalid_response']]);
  });

  it('turns a native error into a sanitized per-clause failure', async () => {
    const p = plugin(new Error('secret contract text in a native error'), reply('c2'));
    const result = await analyzeApprovedNative(p, batch(2));
    expect(result.results.map(r => r.clauseId)).toEqual(['c2']);
    expect(result.failed).toEqual([{ clauseId: 'c1', reason: 'model_error', detail: 'The model request could not be completed.' }]);
    expect(JSON.stringify(result)).not.toContain('secret contract text');
  });

  it('throws when no model execution could be confirmed', async () => {
    const p = plugin(new Error('offline'), new Error('offline'));
    await expect(analyzeApprovedNative(p, batch(2))).rejects.toBeInstanceOf(AnalysisUnavailableError);
  });

  it('aborts the whole batch when approval goes stale during a native call', async () => {
    const b = batch(2);
    const p = {
      analyzeClause: vi.fn(async () => { mocks.approved.delete(b); return reply('c1'); }),
    } satisfies AnalysisPlugin;
    await expect(analyzeApprovedNative(p, b)).rejects.toMatchObject({ code: 'not_approved' });
    expect(p.analyzeClause).toHaveBeenCalledTimes(1);
  });

  it('aborts when approval goes stale even if the native call rejected', async () => {
    const b = batch(2);
    const p = {
      analyzeClause: vi.fn(async () => { mocks.approved.delete(b); throw new Error('boom'); }),
    } satisfies AnalysisPlugin;
    await expect(analyzeApprovedNative(p, b)).rejects.toMatchObject({ code: 'not_approved' });
    expect(p.analyzeClause).toHaveBeenCalledTimes(1);
  });

  it('rejects an oversized or malformed batch before any native request', async () => {
    const p = plugin();
    const empty = { docId: 'd', clauses: [] };
    mocks.approved.add(empty);
    await expect(analyzeApprovedNative(p, empty)).rejects.toThrow('Invalid analysis batch');
    expect(p.analyzeClause).not.toHaveBeenCalled();
  });
});
