import { getAI, GoogleAIBackend, type AI } from 'firebase/ai';
import {
  CustomProvider,
  getToken,
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  type AppCheck,
} from 'firebase/app-check';
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';

export interface FirebaseServices {
  readonly app: FirebaseApp;
  readonly appCheck: AppCheck;
  readonly ai: AI;
}

type FirebaseCache = { services?: FirebaseServices };
type DebugGlobal = typeof globalThis & {
  FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
};

// Preserve the singleton during Vite hot reloads as well as repeated calls.
const cache: FirebaseCache = import.meta.hot
  ? (import.meta.hot.data.clauseGuardFirebase ??= {})
  : {};

/**
 * One Firebase setup for the web app and extension document.
 * Development on localhost/unpacked extensions uses a browser-generated
 * debug token. Hosted builds require a reCAPTCHA Enterprise site key.
 * No contract text or placeholder maps are accepted by this module.
 */
export function initFirebase(): FirebaseServices {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
    appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
  };
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase config: ${missing.join(', ')}. Fill in apps/web/.env.local and restart the dev server.`,
    );
  }

  if (cache.services) {
    assertSameConfig(cache.services.app, config);
    return cache.services;
  }

  const debugGlobal = globalThis as DebugGlobal;
  const localOrigin =
    ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) ||
    location.protocol === 'chrome-extension:';
  const useDebug = import.meta.env.DEV && localOrigin;
  const siteKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY?.trim();

  if (!useDebug && debugGlobal.FIREBASE_APPCHECK_DEBUG_TOKEN) {
    throw new Error(
      'App Check debug mode is not allowed for this build/origin. Remove the debug flag and reload.',
    );
  }
  if (!useDebug && !siteKey) {
    throw new Error(
      'Missing VITE_RECAPTCHA_ENTERPRISE_SITE_KEY. Configure the hosted web App Check provider before using a production build.',
    );
  }

  if (useDebug) {
    // The SDK generates a per-browser debug secret and prints it in DevTools.
    // Register it under App Check > Apps > Manage debug tokens.
    // Never paste the secret into source code or commit it.
    debugGlobal.FIREBASE_APPCHECK_DEBUG_TOKEN ??= true;
  }

  // Debug mode exchanges the SDK's debug secret instead of calling this
  // provider. If it ever reaches this callback, fail rather than mint a token.
  const provider = useDebug
    ? new CustomProvider({
        getToken: async () => {
          throw new Error('App Check debug mode did not initialize. Reload the page.');
        },
      })
    : new ReCaptchaEnterpriseProvider(siteKey!);

  const app =
    getApps().find((candidate) => candidate.name === '[DEFAULT]') ??
    initializeApp(config);
  assertSameConfig(app, config);

  // App Check MUST be initialized before getAI().
  const appCheck = initializeAppCheck(app, {
    provider,
    isTokenAutoRefreshEnabled: true,
  });
  const ai = getAI(app, { backend: new GoogleAIBackend() });

  cache.services = { app, appCheck, ai };
  return cache.services;
}

/** Existing call sites can continue to use initAI(). */
export function initAI(): AI {
  return initFirebase().ai;
}

/** Verifies token acquisition without returning any token or secret to the caller. */
export async function verifyAppCheck(): Promise<void> {
  try {
    const result = await getToken(initFirebase().appCheck, false);
    if (!result.token) throw new Error('No App Check token returned.');
  } catch {
    throw new Error(
      'App Check verification failed. Check the registered debug token, network connection, and Firebase configuration.',
    );
  }
}

function assertSameConfig(
  app: FirebaseApp,
  config: { apiKey?: string; projectId?: string; appId?: string },
): void {
  if (
    app.options.apiKey !== config.apiKey ||
    app.options.projectId !== config.projectId ||
    app.options.appId !== config.appId
  ) {
    throw new Error(
      'Firebase is already initialized with different configuration. Restart the dev server and reload the page.',
    );
  }
}
