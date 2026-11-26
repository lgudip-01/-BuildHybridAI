import 'fake-indexeddb/auto';
import { beforeEach, expect, it, vi } from 'vitest';
import { REDLINE_REVIEW_NOTICE } from '@clause-guard/core/analysis';

const sdk = vi.hoisted(() => ({ ai: { app: {} }, generate: vi.fn(), factory: vi.fn() }));
vi.mock('./firebase', () => ({ initAI: () => sdk.ai }));
vi.mock('firebase/ai', async original => ({
  ...await original<typeof import('firebase/ai')>(), getGenerativeModel: sdk.factory,
}));
vi.mock('./analysisConfig', async original => {
  const config = await original<typeof import('./analysisConfig')>();
  return { ...config, loadAnalysisConfig: async () => config.DEFAULT_ANALYSIS_CONFIG };
});
import { prepareSample, runSample } from './sampleRoundtrip';

beforeEach(() => {
  vi.clearAllMocks();
  sdk.factory.mockImplementation(() => ({ generateContent: sdk.generate }));
  sdk.generate.mockImplementation(async (prompt: string) => {
    const clause = JSON.parse(prompt);
    return { response: { inferenceSource: 'in_cloud', text: () => JSON.stringify({
      clauseId: clause.id, risk: 'medium', explanation: 'Clarify the commercial terms.',
      redline: clause.text + ' Customer may terminate for convenience.', questions: ['What changes are intended?'],
    }) } };
  });
});

it('selects before real masking/approval and only analyzes the three reviewed clauses', async () => {
  const preview = await prepareSample('saas', ['c5', 'c7', 'c8']);
  expect(preview.result.clauses.map(c => c.id)).toEqual(['c5', 'c7', 'c8']);
  expect(sdk.generate).not.toHaveBeenCalled();
  const result = await runSample(preview, { reviewed: true });
  expect(result.totalClauses).toBe(3);
  expect(result.succeeded).toBe(3);
  expect(result.failed).toEqual([]);
  expect(result.restored.every(c => c.redline === '' && c.explanation.includes(REDLINE_REVIEW_NOTICE))).toBe(true);
  expect(sdk.generate.mock.calls.map(call => JSON.parse(call[0]).id)).toEqual(['c5', 'c7', 'c8']);
  expect(result.promptCheck).toMatchObject({ cloudReviewRulesPresent: true, deviceReviewRulesPresent: true, redlinePolicy: 'commercial-review-v4' });
});

it.each([{ ids: [] }, { ids: ['c5', 'c5'] }, { ids: ['missing'] }])('rejects an invalid selection before any model request: $ids', async ({ ids }) => {
  await expect(prepareSample('saas', ids)).rejects.toThrow('unique clause IDs');
  expect(sdk.generate).not.toHaveBeenCalled();
});

it('still rejects an old preview after preparing a new selection', async () => {
  const old = await prepareSample('saas', ['c5']);
  await prepareSample('saas', ['c7']);
  await expect(runSample(old, { reviewed: true })).rejects.toMatchObject({ code: 'stale' });
  expect(sdk.generate).not.toHaveBeenCalled();
});

it('prepares the held lease selection before any analysis call', async () => {
  const preview = await prepareSample('lease', ['c2', 'c4', 'c7']);
  expect(preview.result.clauses.map(clause => clause.id)).toEqual(['c2', 'c4', 'c7']);
  expect(sdk.generate).not.toHaveBeenCalled();
});
