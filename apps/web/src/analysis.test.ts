import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AI } from 'firebase/ai';
import type { ApprovedBatch, CleanText, MaskedClause } from '@clause-guard/core/types';
import { allowedPlaceholders, validateAnalysis, validateBatch, CLOUD_ANALYSIS_PROMPT, DEVICE_ANALYSIS_PROMPT } from '@clause-guard/core/analysis';

const mocks = vi.hoisted(() => ({
  approved: new WeakSet<object>(),
  generate: vi.fn(), factory: vi.fn(), checks: vi.fn(),
}));
vi.mock('./approvalGuard', () => ({ assertApproved(batch: object) {
  mocks.checks();
  if (!mocks.approved.has(batch)) throw Object.assign(new Error('not approved/current'), { code: 'not_approved' });
} }));
vi.mock('firebase/ai', async importOriginal => ({
  ...await importOriginal<typeof import('firebase/ai')>(),
  getGenerativeModel: mocks.factory,
}));
vi.mock('./analysisConfig', async original => {
  const config = await original<typeof import('./analysisConfig')>();
  return { ...config, loadAnalysisConfig: vi.fn(async () => config.DEFAULT_ANALYSIS_CONFIG) };
});
import { WebBridge } from './webBridge';
import { AnalysisUnavailableError } from './cloudAnalyzer';
import { loadAnalysisConfig, DEFAULT_ANALYSIS_CONFIG } from './analysisConfig';

const ai = {} as AI;
function batch(count = 2): ApprovedBatch {
  const value = { docId: 'local-only-doc', clauses: Array.from({ length: count }, (_, i) => Object.freeze({
    id: `c${i + 1}`, type: 'indemnity' as const,
    text: (`[PARTY_A] indemnifies [PARTY_B]. ${i ? '[AMOUNT_1]' : ''}`) as CleanText,
  })) };
  Object.freeze(value.clauses); Object.freeze(value); mocks.approved.add(value); return value;
}
function answer(id = 'c1') {
  return { clauseId: id, risk: 'high', explanation: '[PARTY_A] bears broad risk.', redline: '[PARTY_A] covers its own negligence only.', questions: ["Can [PARTY_B] limit this duty?"] };
}
function output(id = 'c1', source = 'in_cloud', data: unknown = answer(id)) {
  return { response: { inferenceSource: source, text: () => JSON.stringify(data) } };
}
beforeEach(() => {
  vi.clearAllMocks(); mocks.approved = new WeakSet();
  vi.mocked(loadAnalysisConfig).mockResolvedValue(DEFAULT_ANALYSIS_CONFIG);
  mocks.generate.mockReset(); mocks.factory.mockImplementation(() => ({ generateContent: mocks.generate }));
});

describe('approved web analysis', () => {
  it('blocks an array or forged batch before any SDK/model request', async () => {
    const bridge = new WebBridge(ai);
    for (const value of [[], { docId: 'fake', clauses: [] }]) {
      await expect(bridge.analyze(value as ApprovedBatch)).rejects.toMatchObject({ code: 'not_approved' });
    }
    expect(mocks.factory).not.toHaveBeenCalled(); expect(mocks.generate).not.toHaveBeenCalled();
  });
  it('echoes docId, projects approved fields only, and pins cloud after hybrid execution', async () => {
    const b = batch(); mocks.generate.mockResolvedValueOnce(output('c1')).mockResolvedValueOnce(output('c2'));
    const result = await new WebBridge(ai).analyze(b);
    expect(result).toEqual({ docId: b.docId, results: [answer('c1'), answer('c2')], failed: [], ranOn: 'cloud' });
    expect(JSON.parse(mocks.generate.mock.calls[0]![0])).toEqual({ id: 'c1', type: 'indemnity', text: b.clauses[0]!.text });
    expect(mocks.generate.mock.calls.flat().join(' ')).not.toContain(b.docId);
    expect(mocks.factory.mock.calls.map(c => c[1].mode)).toEqual(['prefer_in_cloud', 'only_in_cloud']);
    const cloudPrompt = mocks.factory.mock.calls[0]![1].inCloudParams.systemInstruction;
    const devicePrompt = mocks.factory.mock.calls[0]![1].onDeviceParams.createOptions.initialPrompts[0].content[0].value;
    expect(cloudPrompt).toContain(CLOUD_ANALYSIS_PROMPT);
    expect(devicePrompt).toContain(DEVICE_ANALYSIS_PROMPT);
    for (const prompt of [cloudPrompt, devicePrompt]) {
      expect(prompt).toContain(JSON.stringify(['[AMOUNT_1]', '[PARTY_A]', '[PARTY_B]']));
      expect(prompt).toContain('set redline to the empty string');
      expect(prompt).not.toContain(b.docId);
    }
  });
  it('reports SDK device fallback and keeps the rest of that batch local', async () => {
    mocks.generate.mockResolvedValueOnce(output('c1', 'on_device')).mockResolvedValueOnce(output('c2', 'on_device'));
    expect((await new WebBridge(ai).analyze(batch())).ranOn).toBe('device');
    expect(mocks.factory.mock.calls.map(c => c[1].mode)).toEqual(['prefer_in_cloud', 'only_on_device']);
  });
  it('rejects unknown placeholders per clause while keeping other results', async () => {
    mocks.generate.mockResolvedValueOnce(output('c1', 'in_cloud', { ...answer(), questions: ['Ask [PARTY_C].'] })).mockResolvedValueOnce(output('c2'));
    const result = await new WebBridge(ai).analyze(batch());
    expect(result.results.map(r => r.clauseId)).toEqual(['c2']);
    expect(result.failed).toEqual([{ clauseId: 'c1', reason: 'unknown_placeholder', detail: expect.any(String) }]);
  });
  it('uses the complete batch allowlist including a token from another clause', async () => {
    mocks.generate.mockResolvedValueOnce(output('c1', 'in_cloud', { ...answer(), explanation: 'Clarify [AMOUNT_1].' })).mockResolvedValueOnce(output('c2'));
    expect((await new WebBridge(ai).analyze(batch())).failed).toEqual([]);
  });
  it.each(['[NUM]', '[years/months]', '[EMAIL_2]', '[ADDRESS_2]'])('rejects observed NDA drafting blank %s', async token => {
    mocks.generate.mockResolvedValueOnce(output('c1', 'in_cloud', { ...answer(), redline: `Supply ${token}.` }));
    const result = await new WebBridge(ai).analyze(batch(1));
    expect(result.results).toEqual([]);
    expect(result.failed).toMatchObject([{ clauseId: 'c1', reason: 'unknown_placeholder' }]);
  });
  it('accepts an empty redline with a question about missing notice details', async () => {
    const data = { ...answer(), redline: '', questions: ['What email address should be used for [PARTY_B]?'] };
    mocks.generate.mockResolvedValueOnce(output('c1', 'in_cloud', data));
    const result = await new WebBridge(ai).analyze(batch(1));
    expect(result.results).toEqual([data]); expect(result.failed).toEqual([]);
  });
  it('isolates malformed JSON/IDs and sanitizes model errors without automatic retries', async () => {
    mocks.generate.mockResolvedValueOnce(output('wrong')).mockRejectedValueOnce(new Error('secret internal detail')).mockResolvedValueOnce(output('c3'));
    const result = await new WebBridge(ai).analyze(batch(3));
    expect(result.failed.map(f => f.reason)).toEqual(['invalid_response', 'model_error']);
    expect(JSON.stringify(result)).not.toContain('secret internal detail');
    expect(mocks.generate).toHaveBeenCalledTimes(3);
  });
  it('does not claim a cloud badge if no source was confirmed', async () => {
    mocks.generate.mockRejectedValue(new Error('network error'));
    await expect(new WebBridge(ai).analyze(batch())).rejects.toBeInstanceOf(AnalysisUnavailableError);
    try { await new WebBridge(ai).analyze(batch(1)); } catch (e) {
      expect(e).toMatchObject({ code: 'analysis_unavailable', failed: [{ clauseId: 'c1', reason: 'model_error', detail: expect.any(String) }] });
    }
  });
  it('rejects an unconfirmed source rather than trusting the configured mode', async () => {
    mocks.generate.mockResolvedValue(output('c1', 'unknown'));
    await expect(new WebBridge(ai).analyze(batch(1))).rejects.toMatchObject({ code: 'analysis_unavailable', failed: [{ clauseId: 'c1', reason: 'invalid_response', detail: expect.any(String) }] });
  });
  it('rejects a mixed source instead of showing one badge for both', async () => {
    mocks.generate.mockResolvedValueOnce(output('c1')).mockResolvedValueOnce(output('c2', 'on_device'));
    const result = await new WebBridge(ai).analyze(batch());
    expect(result.ranOn).toBe('cloud'); expect(result.results).toHaveLength(1);
    expect(result.failed[0]!.reason).toBe('invalid_response');
  });
  it('throws stale approval after an awaited call and blocks all later sends', async () => {
    const b = batch();
    mocks.generate.mockImplementationOnce(async () => { mocks.approved.delete(b); return output(); });
    await expect(new WebBridge(ai).analyze(b)).rejects.toMatchObject({ code: 'not_approved' });
    expect(mocks.generate).toHaveBeenCalledTimes(1);
  });
  it('propagates approval invalidation even when the model call rejects', async () => {
    const b = batch();
    mocks.generate.mockImplementationOnce(async () => { mocks.approved.delete(b); throw new Error('network'); });
    await expect(new WebBridge(ai).analyze(b)).rejects.toMatchObject({ code: 'not_approved' });
    expect(mocks.generate).toHaveBeenCalledTimes(1);
  });
  it('keeps raw onDevice calls in ONLY_ON_DEVICE', async () => {
    mocks.generate.mockResolvedValue({ response: { text: () => 'local result' } });
    await new WebBridge(ai).onDevice('synthetic raw local text');
    expect(mocks.factory.mock.calls[0]![1].mode).toBe('only_on_device');
    expect(mocks.factory.mock.calls[0]![1].inCloudParams).toBeUndefined();
  });
});

describe('response validation', () => {
  const allowed = new Set(['[PARTY_A]', '[PARTY_B]', '[PARTY_AA]']);
  it.each([
    { ...answer(), risk: 'critical' }, { ...answer(), clauseId: 'other' },
    { ...answer(), questions: ['Party A should agree?'] }, { ...answer(), extra: 'unwanted' },
    { ...answer(), explanation: '' }, { ...answer(), redline: 4 },
    { ...answer(), questions: [null] }, { ...answer(), questions: Array(6).fill('Question?') },
  ])('rejects malformed or rewritten response %#', obj => {
    expect(() => validateAnalysis(JSON.stringify(obj), 'c1', allowed)).toThrow();
  });
  it.each(['explanation', 'redline', 'questions'] as const)('rejects unknown placeholders in %s', key => {
    const obj = { ...answer(), [key]: key === 'questions' ? ['[PARTY_C]'] : '[PARTY_C]' };
    expect(() => validateAnalysis(JSON.stringify(obj), 'c1', allowed)).toThrow(expect.objectContaining({ reason: 'unknown_placeholder' }));
  });
  it('accepts alphabetic party suffixes and preserves bracketed references', () => {
    expect(validateAnalysis(JSON.stringify({ ...answer(), explanation: 'Ask [PARTY_AA].' }), 'c1', allowed).explanation).toBe('Ask [PARTY_AA].');
  });
  it('rejects non-JSON and oversized output', () => {
    for (const value of ['```json\n{}\n```', 'null', '[]', 'a'.repeat(20001)]) expect(() => validateAnalysis(value, 'c1', allowed)).toThrow();
  });
  it('extracts the batch-wide allowlist and rejects duplicate/empty/oversized batches', () => {
    const b = batch(); expect(allowedPlaceholders(b)).toEqual(new Set(['[PARTY_A]', '[PARTY_B]', '[AMOUNT_1]']));
    for (const clauses of [[], Array(41).fill(b.clauses[0]), [b.clauses[0], b.clauses[0]], [{id:'',text:'x'}], [{id:'x',text:'a'.repeat(6001)}]]) {
      expect(() => validateBatch({ docId: 'test', clauses: clauses as MaskedClause[] })).toThrow();
    }
  });
});

it('blocks generation when Remote Config disables analysis', async () => {
  vi.mocked(loadAnalysisConfig).mockResolvedValue({...DEFAULT_ANALYSIS_CONFIG,enabled:false});
  await expect(new WebBridge(ai).analyze(batch(1))).rejects.toThrow('disabled');
  expect(mocks.factory).not.toHaveBeenCalled();
});
it('can disable masked-analysis device fallback without changing masking mode', async () => {
  vi.mocked(loadAnalysisConfig).mockResolvedValue({...DEFAULT_ANALYSIS_CONFIG,deviceFallbackEnabled:false});
  mocks.generate.mockResolvedValue(output());
  await new WebBridge(ai).analyze(batch(1));
  expect(mocks.factory.mock.calls[0]![1].mode).toBe('only_in_cloud');
});
it('rechecks approval after waiting for configuration', async () => {
  const b=batch(1);
  vi.mocked(loadAnalysisConfig).mockImplementationOnce(async () => { mocks.approved.delete(b); return DEFAULT_ANALYSIS_CONFIG; });
  await expect(new WebBridge(ai).analyze(b)).rejects.toMatchObject({code:'not_approved'});
  expect(mocks.factory).not.toHaveBeenCalled();
});
