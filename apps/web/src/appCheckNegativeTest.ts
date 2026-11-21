import { initFirebase } from './firebase';

/**
 * One fixed synthetic request with a deliberately invalid App Check header.
 * Does not revoke the real debug token or change Firebase settings.
 * A generic 403 is insufficient: the error must identify App Check.
 */
export async function runAppCheckRejectionTest() {
  if (!import.meta.env.DEV) {
    throw new Error('This security smoke test is development-only.');
  }

  const { projectId, apiKey, appId } = initFirebase().app.options;
  if (!projectId || !apiKey || !appId) {
    throw new Error('Missing Firebase web configuration.');
  }

  const response = await fetch(
    'https://firebasevertexai.googleapis.com/v1beta/projects/' +
      encodeURIComponent(projectId) +
      '/models/gemini-3.5-flash-lite:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
        'X-Firebase-Appid': appId,
        'X-Firebase-AppCheck': 'clause-guard-intentionally-invalid-test-token',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: 'Synthetic authentication test. Reply OK.' }],
        }],
      }),
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (response.ok) {
    throw new Error(
      'SECURITY CHECK FAILED: the endpoint accepted the invalid App Check token.',
    );
  }

  const body: unknown = await response.json();
  const error = body && typeof body === 'object'
    ? (body as { error?: { message?: unknown } }).error
    : undefined;
  const message = typeof error?.message === 'string' ? error.message : '';
  const identifiesAppCheck = /app[\s_-]*check|appcheck|attestation/i.test(message);

  if (![401, 403].includes(response.status) || !identifiesAppCheck) {
    throw new Error(
      'Security check inconclusive: HTTP ' + response.status +
      '. The response did not confirm an App Check rejection.',
    );
  }

  return {
    status: 'APP_CHECK_REJECTION_PASSED' as const,
    httpStatus: response.status,
    reason: 'Invalid App Check token rejected' as const,
  };
}

