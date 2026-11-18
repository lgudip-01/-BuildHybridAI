import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AI } from 'firebase/ai';
import type { Analysis, ApprovedBatch, CleanText, MaskedClause } from '@clause-guard/core/types';
import { allowedPlaceholders, validateAnalysis, validateBatch, CLOUD_ANALYSIS_PROMPT, DEVICE_ANALYSIS_PROMPT, ANALYSIS_REVIEW_RULES, applyCommercialRedlineGuard, REDLINE_REVIEW_NOTICE, EXPLANATION_GROUNDING_RULES, validateExplanationGrounding } from '@clause-guard/core/analysis';

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
import { loadAnalysisConfig, DEFAULT_ANALYSIS_CONFIG, DEFAULT_PAYLOAD, parseAnalysisConfig } from './analysisConfig';

const ai = {} as AI;
function batch(count = 2, source?: string): ApprovedBatch {
  const value = { docId: 'local-only-doc', clauses: Array.from({ length: count }, (_, i) => Object.freeze({
    id: `c${i + 1}`, type: 'indemnity' as const,
    text: (source ?? `[PARTY_A] indemnifies [PARTY_B]. ${i ? '[AMOUNT_1]' : ''}`) as CleanText,
  })) };
  Object.freeze(value.clauses); Object.freeze(value); mocks.approved.add(value); return value;
}
function answer(id = 'c1'): Analysis {
  return { clauseId: id, risk: 'high', explanation: '[PARTY_A] bears broad risk.', redline: '', questions: ["Can [PARTY_B] limit this duty?"] };
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
  it('sends current review constraints to both providers even with older remote prompts', async () => {
    const remote = parseAnalysisConfig(JSON.stringify({ ...DEFAULT_PAYLOAD,
      cloudPrompt: 'Previously published cloud review instructions. Return JSON and preserve placeholders.',
      devicePrompt: 'Previously published preliminary offline scan instructions.',
    }));
    vi.mocked(loadAnalysisConfig).mockResolvedValue(remote);
    mocks.generate.mockResolvedValueOnce(output());
    await new WebBridge(ai).analyze(batch(1));
    const params = mocks.factory.mock.calls[0]![1];
    expect(params.inCloudParams.systemInstruction).toContain(ANALYSIS_REVIEW_RULES);
    expect(params.onDeviceParams.createOptions.initialPrompts[0].content[0].value).toContain(ANALYSIS_REVIEW_RULES);
    expect(params.inCloudParams.systemInstruction).toContain(EXPLANATION_GROUNDING_RULES);
    expect(params.onDeviceParams.createOptions.initialPrompts[0].content[0].value).toContain(EXPLANATION_GROUNDING_RULES);
    expect(mocks.generate).toHaveBeenCalledTimes(1);
  });
  it('blocks an array or forged batch before any SDK/model request', async () => {
    const bridge = new WebBridge(ai);
    for (const value of [[], { docId: 'fake', clauses: [] }]) {
      await expect(bridge.analyze(value as ApprovedBatch)).rejects.toMatchObject({ code: 'not_approved' });
    }
    expect(mocks.factory).not.toHaveBeenCalled(); expect(mocks.generate).not.toHaveBeenCalled();
  });
  it.each(['in_cloud', 'on_device'])('rejects the observed unsupported guarantee explanation from %s without retrying', async source => {
    const b = batch(2, "[PARTY_A] guarantees all of [PARTY_B]'s obligations under this Note.");
    const bad = { ...answer(), explanation: '[PARTY_A] unconditionally guarantees all obligations. Liability is absolute, uncapped and extends to all future obligations.' };
    mocks.generate.mockResolvedValueOnce(output('c1', source, bad)).mockResolvedValueOnce(output('c2', source));
    const result = await new WebBridge(ai).analyze(b);
    expect(result.results).toEqual([answer('c2')]);
    expect(result.failed).toEqual([{ clauseId: 'c1', reason: 'invalid_response', detail: 'The explanation used guarantee terms not established by this clause. Review the source wording before retrying.' }]);
    expect(JSON.stringify(result)).not.toContain('all future obligations');
    expect(mocks.generate).toHaveBeenCalledTimes(2);
  });
  it('checks unknown tokens before grounding, even when the explanation would also fail', async () => {
    const b = batch(1, "[PARTY_A] guarantees Borrower's obligations.");
    mocks.generate.mockResolvedValueOnce(output('c1', 'in_cloud', { ...answer(), explanation: '[PARTY_A] gives an absolute guarantee.', questions: ['Ask [PARTY_Z].'] }));
    expect((await new WebBridge(ai).analyze(b)).failed[0]!.reason).toBe('unknown_placeholder');
    expect(mocks.generate).toHaveBeenCalledTimes(1);
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
  it.each(['in_cloud', 'on_device'])('withholds a commercial rewrite from %s without another model call', async source => {
    const data = { ...answer(), redline: '[PARTY_A] shall unconditionally indemnify [PARTY_B].' };
    mocks.generate.mockResolvedValueOnce(output('c1', source, data));
    const result = await new WebBridge(ai).analyze(batch(1));
    expect(result.results[0]).toMatchObject({ redline: '', risk: data.risk, questions: data.questions });
    expect(result.results[0]!.explanation).toContain(REDLINE_REVIEW_NOTICE);
    expect(result.failed).toEqual([]);
    expect(mocks.generate).toHaveBeenCalledTimes(1);
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

describe('commercial rewrite review gate', () => {
  it.each([
    ['Provider will make the platform available 99.9% of each calendar month. Customer receives a service credit of 5% of the monthly fee.',
      'Provider will make the platform available 99.9%, excluding scheduled maintenance. The credit is Customer’s sole and exclusive remedy.'],
    ['Each party’s liability is capped at fees paid in the 12 months before the claim.',
      'Each party’s liability is capped at fees paid or payable in the 12 months before the claim.'],
    ['The initial Term is 36 months and renews for 12-month periods unless either party gives 90 days’ notice.',
      'Either party may terminate for convenience on 90 days’ notice.'],
    ['[PARTY_A] guarantees all Borrower obligations.',
      '[PARTY_A] unconditionally guarantees prompt payment and performance.'],
    ['This credit is not Customer’s sole and exclusive remedy.',
      'This credit is Customer’s sole and exclusive remedy.'],
    ['Lender may declare the balance due immediately after 10 days.',
      'Lender may terminate the loan immediately.'],
  ])('withholds an unapproved commercial edit %#', (source, redline) => {
    const original = { ...answer(), redline };
    const guarded = applyCommercialRedlineGuard(original, source as CleanText);
    expect(guarded.redline).toBe('');
    expect(guarded.explanation).toContain(REDLINE_REVIEW_NOTICE);
    expect(guarded.explanation).toContain(original.explanation);
    expect(guarded.questions).toEqual(original.questions);
    expect(original.redline).toBe(redline);
  });
  it('keeps empty drafts, exact commercial wording and whitespace-only copies', () => {
    const source = 'Each party’s liability is capped at fees paid.' as CleanText;
    for (const redline of ['', source, '  Each party’s liability\nis capped at fees paid.  ']) {
      const original = { ...answer(), redline };
      expect(applyCommercialRedlineGuard(original, source)).toBe(original);
    }
  });
  it('does not claim to verify unrelated drafts or repair reasoning errors', () => {
    const original = { ...answer(), explanation: 'A role assumption may still be wrong.', redline: 'Send notices in writing.' };
    expect(applyCommercialRedlineGuard(original, 'Send notices.' as CleanText)).toBe(original);
  });
  it('keeps the output valid when a maximum-length explanation ends near a token', () => {
    const original = { ...answer(), explanation: 'x'.repeat(3790) + '[PARTY_A]' + 'y'.repeat(201), redline: '[PARTY_A] shall unconditionally indemnify [PARTY_B].' };
    const guarded = applyCommercialRedlineGuard(original, '[PARTY_A] indemnifies [PARTY_B].' as CleanText);
    expect(guarded.explanation.length).toBeLessThanOrEqual(4000);
    expect(() => validateAnalysis(JSON.stringify(guarded), 'c1', new Set(['[PARTY_A]', '[PARTY_B]']))).not.toThrow();
  });
});

describe('guarantee explanation grounding', () => {
  const source = "[PARTY_A] guarantees all of Borrower's obligations under this Note." as CleanText;
  it.each([
    '[PARTY_A] unconditionally guarantees all obligations.',
    'The guaranty creates absolute liability.',
    'This guarantee is uncapped.',
    'The guarantee creates unlimited liability.',
    'The guaranty extends to all present and future obligations.',
    'This guarantee applies without limitation.',
    'The guaranty may be unconditional.',
  ])('rejects an unsupported label in the explanation: %s', explanation => {
    expect(() => validateExplanationGrounding({ ...answer(), explanation }, source))
      .toThrow(expect.objectContaining({ reason: 'invalid_response' }));
  });
  it('allows source-scoped observations and neutral questions without inferring terms', () => {
    const analysis = { ...answer(), explanation: 'This clause guarantees the Borrower’s obligations under the Note. No cap is stated in this excerpt; review other terms for limits and conditions.',
      questions: ['Is the guarantee intended to be unconditional?', 'Are future obligations covered?'] };
    expect(() => validateExplanationGrounding(analysis, source)).not.toThrow();
    expect(analysis.questions).toHaveLength(2);
  });
  it('allows the same explicit affirmative labels when actually supplied', () => {
    const explicit = '[PARTY_A] unconditionally guarantees all present and future obligations with absolute and unlimited liability, uncapped and without limitation.' as CleanText;
    expect(() => validateExplanationGrounding({ ...answer(), explanation: explicit }, explicit)).not.toThrow();
  });
  it.each([
    ['[PARTY_A] does not give an unconditional guarantee.', 'The guarantee is unconditional.'],
    ['[PARTY_A] guarantees payment subject to conditions; it is not absolute.', 'The guarantee is absolute.'],
    ['[PARTY_A] guarantees all future obligations except later amendments.', 'The guarantee covers all future obligations.'],
  ])('does not treat a label in qualified source wording as affirmative proof: %s', (text, explanation) => {
    expect(() => validateExplanationGrounding({ ...answer(), explanation }, text as CleanText)).toThrow();
  });
  it('does not purport to validate unrelated clause reasoning', () => {
    expect(() => validateExplanationGrounding({ ...answer(), explanation: 'Liability is uncapped.' }, 'A confidentiality breach is excluded from the cap.' as CleanText)).not.toThrow();
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
