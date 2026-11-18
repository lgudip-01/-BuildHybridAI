import { beforeEach, expect, it, vi } from 'vitest';
import type { FirebaseApp } from 'firebase/app';
import { ANALYSIS_OUTPUT_RULES } from '@clause-guard/core/analysis';
const sdk = vi.hoisted(() => ({ supported: vi.fn(), init: vi.fn(), fetch: vi.fn(), get: vi.fn(), rc: { defaultConfig: {}, settings: {} } }));
vi.mock('firebase/remote-config', () => ({ isSupported: sdk.supported, ensureInitialized: sdk.init,
  fetchAndActivate: sdk.fetch, getRemoteConfig: () => sdk.rc, getString: sdk.get }));
import { CONFIG_KEYS, DEFAULT_PAYLOAD, DEFAULT_ANALYSIS_CONFIG, parseAnalysisConfig, loadAnalysisConfig } from './analysisConfig';
beforeEach(() => {
  vi.clearAllMocks(); sdk.supported.mockResolvedValue(true); sdk.init.mockResolvedValue(undefined);
  sdk.fetch.mockResolvedValue(true);
  sdk.get.mockImplementation((_rc, key) => key === CONFIG_KEYS.settings ? JSON.stringify(DEFAULT_PAYLOAD) : 'true');
});
it('accepts a complete versioned payload and freezes its snapshot', () => {
  const c = parseAnalysisConfig(JSON.stringify(DEFAULT_PAYLOAD)); expect(c.model).toBe(DEFAULT_PAYLOAD.model); expect(Object.isFrozen(c)).toBe(true);
});
it.each(['bad json', '{}', 'null', '[]', JSON.stringify({...DEFAULT_PAYLOAD,version:'future'}),
  JSON.stringify({...DEFAULT_PAYLOAD,model:'https://untrusted.test'}), JSON.stringify({...DEFAULT_PAYLOAD,cloudPrompt:'short'}),
  JSON.stringify({...DEFAULT_PAYLOAD,extra:'mode=cloud'})])('rejects invalid remote settings %#', value => {
  expect(parseAnalysisConfig(value)).toEqual(DEFAULT_ANALYSIS_CONFIG);
});
it('preserves an explicit kill switch even if the payload is invalid', () => {
  expect(parseAnalysisConfig('{}','false','false')).toMatchObject({enabled:false,deviceFallbackEnabled:false,source:'defaults'});
});
it('retains application output rules when prompts change', () => {
  const c = parseAnalysisConfig(JSON.stringify({...DEFAULT_PAYLOAD,cloudPrompt:'A sufficiently long alternate analysis instruction.'}));
  expect(c.cloudPrompt).toContain(ANALYSIS_OUTPUT_RULES);
});
it('appends current drafting rules to previously published remote prompts', () => {
  const previous = { ...DEFAULT_PAYLOAD, cloudPrompt: 'Previously published cloud review instructions. Return JSON and preserve placeholders.',
    devicePrompt: 'Previously published preliminary offline scan instructions.' };
  const config = parseAnalysisConfig(JSON.stringify(previous));
  expect(config.cloudPrompt).toContain(previous.cloudPrompt);
  expect(config.cloudPrompt).toContain(ANALYSIS_OUTPUT_RULES);
  expect(config.devicePrompt).toContain(ANALYSIS_OUTPUT_RULES);
  expect(config.cloudPrompt).toContain('leave redline empty');
});
it('loads once per app and reuses the same batch snapshot', async () => {
  const app = {} as FirebaseApp; const [a,b] = await Promise.all([loadAnalysisConfig(app),loadAnalysisConfig(app)]);
  expect(a).toBe(b); expect(sdk.fetch).toHaveBeenCalledTimes(1);
});
it('uses defaults on unsupported browsers without fetching', async () => {
  sdk.supported.mockResolvedValue(false); expect(await loadAnalysisConfig({} as FirebaseApp)).toEqual(DEFAULT_ANALYSIS_CONFIG); expect(sdk.fetch).not.toHaveBeenCalled();
});
it('keeps activated cached settings when a fetch fails offline', async () => {
  sdk.get.mockImplementation((_rc,key) => key === CONFIG_KEYS.settings ? JSON.stringify({...DEFAULT_PAYLOAD,model:'gemini-test-model'}) : 'true');
  sdk.fetch.mockRejectedValue(new Error('offline')); expect((await loadAnalysisConfig({} as FirebaseApp)).model).toBe('gemini-test-model');
});
it('bounds a hanging initialization and returns defaults', async () => {
  vi.useFakeTimers(); sdk.init.mockImplementation(() => new Promise(() => {}));
  try { const result = loadAnalysisConfig({} as FirebaseApp); await vi.advanceTimersByTimeAsync(2501); expect(await result).toEqual(DEFAULT_ANALYSIS_CONFIG); }
  finally { vi.useRealTimers(); }
});
