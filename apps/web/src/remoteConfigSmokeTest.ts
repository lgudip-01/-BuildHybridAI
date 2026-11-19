import { getRemoteConfig, getValue, isSupported, type RemoteConfig } from 'firebase/remote-config';
import { CONFIG_KEYS, loadAnalysisConfig, parseAnalysisConfig } from './analysisConfig';
import { initFirebase } from './firebase';

/** Inspect only the three application settings; never return prompts or credentials. */
export function inspectRemoteConfig(rc: RemoteConfig) {
  const values = {
    settings: getValue(rc, CONFIG_KEYS.settings),
    enabled: getValue(rc, CONFIG_KEYS.enabled),
    fallback: getValue(rc, CONFIG_KEYS.fallback),
  };
  const parameterSources = {
    [CONFIG_KEYS.settings]: values.settings.getSource(),
    [CONFIG_KEYS.enabled]: values.enabled.getSource(),
    [CONFIG_KEYS.fallback]: values.fallback.getSource(),
  };
  if (Object.values(parameterSources).some(source => source !== 'remote')) {
    throw new Error('Remote Config check failed: at least one parameter is using a local/static default. Check the three published parameter names and reload.');
  }
  const enabled = values.enabled.asString();
  const fallback = values.fallback.asString();
  if (![enabled, fallback].every(value => value === 'true' || value === 'false')) {
    throw new Error('Remote Config check failed: feature flags must contain true or false.');
  }
  const config = parseAnalysisConfig(values.settings.asString(), enabled, fallback);
  if (config.source !== 'remote') {
    throw new Error('Remote Config check failed: the published analysis JSON did not pass validation.');
  }
  return Object.freeze({
    status: 'REMOTE_CONFIG_VALUES_VERIFIED' as const,
    version: config.version, model: config.model,
    analysisEnabled: config.enabled, deviceFallbackEnabled: config.deviceFallbackEnabled,
    parameterSources, lastFetchStatus: rc.lastFetchStatus,
    // Remote values can come from a previous activation; this does not claim a fresh network fetch.
    lastSuccessfulFetchAt: rc.fetchTimeMillis > 0 ? new Date(rc.fetchTimeMillis).toISOString() : null,
  });
}

/** Development-only configuration check. No model inference or contract access. */
export async function runRemoteConfigSmokeTest() {
  if (!import.meta.env.DEV) throw new Error('The Remote Config check is only available in development.');
  if (!(await isSupported())) throw new Error('Remote Config is not supported in this browser.');
  const { app } = initFirebase();
  await loadAnalysisConfig(app);
  return inspectRemoteConfig(getRemoteConfig(app));
}
