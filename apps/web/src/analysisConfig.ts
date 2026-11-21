import type { FirebaseApp } from 'firebase/app';
import { ensureInitialized, fetchAndActivate, getRemoteConfig, getString, isSupported } from 'firebase/remote-config';
import { ANALYSIS_MODEL, ANALYSIS_VERSION, ANALYSIS_OUTPUT_RULES, CLOUD_ANALYSIS_PROMPT, DEVICE_ANALYSIS_PROMPT } from '@clause-guard/core/analysis';

export const CONFIG_KEYS = {
  settings: 'cg_analysis_config', enabled: 'cg_analysis_enabled', fallback: 'cg_device_fallback_enabled',
} as const;
export const DEFAULT_PAYLOAD = Object.freeze({
  version: ANALYSIS_VERSION, model: ANALYSIS_MODEL,
  cloudPrompt: CLOUD_ANALYSIS_PROMPT, devicePrompt: DEVICE_ANALYSIS_PROMPT,
});
export type AnalysisConfig = {
  version: string; model: string; cloudPrompt: string; devicePrompt: string;
  enabled: boolean; deviceFallbackEnabled: boolean; source: 'defaults' | 'remote';
};
export const DEFAULT_ANALYSIS_CONFIG: Readonly<AnalysisConfig> = Object.freeze({
  ...DEFAULT_PAYLOAD, enabled: true, deviceFallbackEnabled: true, source: 'defaults',
});

/** Remote configuration cannot choose inference modes for raw text or alter validation. */
export function parseAnalysisConfig(payload: string, enabled = 'true', fallback = 'true'): Readonly<AnalysisConfig> {
  const flags = { enabled: enabled !== 'false', deviceFallbackEnabled: fallback !== 'false' };
  const defaults = () => Object.freeze({ ...DEFAULT_ANALYSIS_CONFIG, ...flags });
  let candidate: unknown;
  try { candidate = JSON.parse(payload); } catch { return defaults(); }
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return defaults();
  const c = candidate as Record<string, unknown>;
  // Retire the v1 checklist rather than append contradictory instructions to it.
  // Old/invalid payloads use current app defaults; independent remote kill switches
  // still apply. A v2 payload is required before remote prompts are used again.
  if (Object.keys(c).length !== 4 || c.version !== ANALYSIS_VERSION ||
      // Only this model's free tier has been verified for this no-billing project.
      // Expanding the model choice requires a new pricing/account-state review.
      c.model !== ANALYSIS_MODEL ||
      !['cloudPrompt', 'devicePrompt'].every(k => typeof c[k] === 'string' && (c[k] as string).trim().length >= 20 && (c[k] as string).length <= 12000)) return defaults();
  // The output contract remains application-owned even when instructions are tuned remotely.
  const protect = (prompt: string, original: string) => prompt === original ? original : `${prompt}\n${ANALYSIS_OUTPUT_RULES}`;
  return Object.freeze({ version: ANALYSIS_VERSION, model: c.model,
    cloudPrompt: protect(c.cloudPrompt as string, CLOUD_ANALYSIS_PROMPT),
    devicePrompt: protect(c.devicePrompt as string, DEVICE_ANALYSIS_PROMPT),
    ...flags, source: 'remote' as const });
}

const sessions = new WeakMap<FirebaseApp, Promise<Readonly<AnalysisConfig>>>();
/** One bounded load per app/page. Snapshot once per analysis batch, not per clause. */
export function loadAnalysisConfig(app: FirebaseApp): Promise<Readonly<AnalysisConfig>> {
  let pending = sessions.get(app);
  if (pending) return pending;
  pending = readConfig(app);
  sessions.set(app, pending);
  return pending;
}

async function readConfig(app: FirebaseApp): Promise<Readonly<AnalysisConfig>> {
  let cached = DEFAULT_ANALYSIS_CONFIG;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const read = async () => {
    try {
      if (!(await isSupported())) return cached;
      const rc = getRemoteConfig(app);
      rc.defaultConfig = {
        [CONFIG_KEYS.settings]: JSON.stringify(DEFAULT_PAYLOAD),
        [CONFIG_KEYS.enabled]: true, [CONFIG_KEYS.fallback]: true,
      };
      rc.settings.minimumFetchIntervalMillis = 3600000;
      rc.settings.fetchTimeoutMillis = 1500;
      const snapshot = () => parseAnalysisConfig(getString(rc, CONFIG_KEYS.settings),
        getString(rc, CONFIG_KEYS.enabled), getString(rc, CONFIG_KEYS.fallback));
      await ensureInitialized(rc);
      cached = snapshot();
      try { await fetchAndActivate(rc); } catch { return cached; }
      return snapshot();
    } catch { return cached; }
  };
  try {
    return await Promise.race([read(), new Promise<Readonly<AnalysisConfig>>(resolve => {
      timer = setTimeout(() => resolve(cached), 2500);
    })]);
  } finally { if (timer) clearTimeout(timer); }
}
