import { beforeEach, expect, it, vi } from 'vitest';
import type { RemoteConfig } from 'firebase/remote-config';
const sdk = vi.hoisted(() => ({ value: vi.fn(), supported: vi.fn(), load: vi.fn(), init: vi.fn() }));
vi.mock('firebase/remote-config', () => ({ getValue: sdk.value, getRemoteConfig: () => rc, isSupported: sdk.supported }));
vi.mock('./firebase', () => ({ initFirebase: sdk.init }));
vi.mock('./analysisConfig', async importOriginal => ({ ...await importOriginal<typeof import('./analysisConfig')>(), loadAnalysisConfig: sdk.load }));
import { DEFAULT_PAYLOAD } from './analysisConfig';
import { inspectRemoteConfig, runRemoteConfigSmokeTest } from './remoteConfigSmokeTest';
const rc = { lastFetchStatus: 'success', fetchTimeMillis: 1000 } as RemoteConfig;
let source: string; let payload: string; let flag: string;
beforeEach(() => {
  vi.clearAllMocks(); source = 'remote'; payload = JSON.stringify(DEFAULT_PAYLOAD); flag = 'true';
  sdk.value.mockImplementation((_rc, key) => ({ getSource: () => source, asString: () => key === 'cg_analysis_config' ? payload : flag }));
  sdk.supported.mockResolvedValue(true); sdk.init.mockReturnValue({ app: {} }); sdk.load.mockResolvedValue(undefined);
});
it('reports only metadata for remotely activated settings, including cached values', () => {
  const result = inspectRemoteConfig(rc);
  expect(result.status).toBe('REMOTE_CONFIG_VALUES_VERIFIED');
  expect(result.lastSuccessfulFetchAt).toBe('1970-01-01T00:00:01.000Z');
  expect(JSON.stringify(result)).not.toContain(DEFAULT_PAYLOAD.cloudPrompt);
  expect(result).not.toHaveProperty('apiKey');
});
it('rejects local SDK defaults even when their contents are valid', () => {
  source = 'default'; expect(() => inspectRemoteConfig(rc)).toThrow('local/static default');
});
it('rejects invalid remote JSON instead of reporting fallback settings as a pass', () => {
  payload = '{}'; expect(() => inspectRemoteConfig(rc)).toThrow('JSON did not pass validation');
});
it('rejects malformed flags and accurately reports explicit disabled flags', () => {
  flag = 'TRUE'; expect(() => inspectRemoteConfig(rc)).toThrow('true or false');
  flag = 'false'; expect(inspectRemoteConfig(rc)).toMatchObject({analysisEnabled:false,deviceFallbackEnabled:false});
});
it('does not initialize Firebase on unsupported browsers', async () => {
  sdk.supported.mockResolvedValue(false);
  await expect(runRemoteConfigSmokeTest()).rejects.toThrow('not supported'); expect(sdk.init).not.toHaveBeenCalled();
});
