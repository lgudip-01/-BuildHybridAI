# Firebase web setup

This setup supports tonight's browser integration. The web app still calls
`initAI()`; that function now initializes App Check before Firebase AI Logic.
Native Android/iOS setup remains in the native plugins. The extension document
can reuse this initializer, but extension App Check has not been tested yet.

## 1. Configure your local copy

Use Node 24 LTS. From the repository root:

```sh
npm ci
cp apps/web/.env.example apps/web/.env.local
```

If `.env.local` already exists, keep it; do not overwrite your existing values.
Fill in the three Firebase fields from Firebase Console → Project settings →
Your apps → the registered web app. These are Firebase web configuration values,
not a Gemini Developer API key. Never put a service-account key or Gemini key
in a `VITE_*` variable: those variables are bundled into browser code.

```sh
npm run dev
```

Keep that terminal running and open the localhost URL it prints. Run other
commands in a second terminal. Restart Vite after changing `.env.local`.

## 2. Register this browser's debug token

Development builds on localhost, loopback addresses, or a Chrome extension
origin select the App Check debug provider. The Firebase SDK creates a debug
secret for the browser and prints it in DevTools Console.

In Firebase Console → App Check → Apps → your web app → Manage debug tokens,
register that secret under a recognizable development label. Reload the app.
Each teammate/browser profile uses its own token. Keep debug secrets out of
source, issues, screenshots, and shared logs. Revoke any exposed secret and
register the replacement. Keep Firebase AI Logic App Check enforcement enabled.

In the browser's DevTools Console, paste the whole block:

```js
var firebaseSetup = await import('/src/firebase.ts');
await firebaseSetup.verifyAppCheck();
console.log('App Check verified');
```

This verifies acquisition of an App Check token without returning it. It does
not send contract text or by itself prove server-side enforcement.

## 3. Optional synthetic cloud checks

These functions are manual, development-only diagnostics. They are not imported
by the app entry point and are not the production `analyze()` implementation.
Neither reads the contract input, vault, or placeholder map. A cloud request
consumes quota; do not repeatedly retry it in a loop.

Positive check, in DevTools Console:

```js
var cloudCheck = await import('/src/cloudSmokeTest.ts');
console.log(await cloudCheck.runCloudSmokeTest());
```

Expected: `CLOUD_TEST_PASSED`, `appCheck: 'verified'`, and `ranOn: 'cloud'`.
The fixture already uses `[PARTY_A]` and `[PARTY_B]`. The test uses
`ONLY_IN_CLOUD`, verifies the SDK's actual inference source, and validates the
JSON and placeholder allowlist. Its 30-second request timeout prevents an
unbounded generation wait. It uses `gemini-3.5-flash-lite`, which passed the
manual connectivity test; this is not a decision about the final analysis model.

Negative check:

```js
var rejectionCheck = await import('/src/appCheckNegativeTest.ts');
console.log(await rejectionCheck.runAppCheckRejectionTest());
```

Expected: `APP_CHECK_REJECTION_PASSED`. A red Network/Console error for the
deliberately invalid request is expected. Success requires HTTP 401 or 403
and an error identifying App Check; a generic authorization error is inconclusive.
This test does not change Firebase settings or revoke a real token.

The positive check and an App Check-specific 401 negative check passed manually
on Dhruv's development browser before integration. Repeat them on your own
browser after registering its token. Automated checks use isolated SDK mocks;
they do not replace these live checks.

## 4. Automated checks

From the repository root:

```sh
npm run test:firebase --workspace @clause-guard/web
npm run typecheck --workspace @clause-guard/web
npm run build --workspace @clause-guard/web
```

The Firebase test checks initialization order, repeated calls/hot reload,
configuration mismatch, debug selection, production provider requirements,
and sanitized verification errors. No credentials or network are required.

## 5. Hosted web builds

Set `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` to the website key for the registered
Enterprise provider and configure its allowed hosting domains. Hosted builds
require this key and reject a pre-set App Check debug flag. Production App Check
and hosting still require a real deployment test; a successful build alone does
not verify attestation. Do not deploy a development server or share debug tokens
with end users.

## Privacy boundary

`firebase/ai` provides both local and cloud inference. The masking bridge must
keep `ONLY_ON_DEVICE` for raw contract text. These synthetic cloud diagnostics
are separate from masking. App Check exchanges, model downloads, and other
setup traffic may contact servers; they are not cloud contract analysis.
An outgoing-request audit of the complete app is still pending. Do not claim
that a successful masking UI or App Check test proves no contract data left
the browser.
