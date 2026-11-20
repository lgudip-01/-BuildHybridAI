# Web Hosting release gate

## Binding zero-cost gate — supersedes the activation plan below

As of November 19, 2026, the user prohibits paid services, billing accounts,
payment information, all trials, upgrades and billable overages. Do not enable
reCAPTCHA Enterprise or any other service until a no-payment/no-billing-account
path with no automatic charges is verified. Free usage quotas or budget alerts
alone do not satisfy this requirement. Accepting Google Cloud terms is not proof
of zero cost. The user has since personally accepted the terms after no-cost path verification.

## Verified no-billing path (November 19, 2026)

Read-only verification found a documented path meeting the zero-cost constraint.
The Firebase Console was rechecked and displays Spark / No-cost ($0/month).
The initial pricing verification made no external changes. Later setup enabled
the API and created a restricted key after user acceptance of the terms. Billing
was directly verified as unlinked; provider registration and deployment later succeeded.

| Component | Required configuration | Behavior at no-cost limit |
| --- | --- | --- |
| Firebase Hosting | Spark, no Cloud Billing account | 10 GB storage blocks new deployments; 10 GB/month transfer disables sites after a short grace period until monthly reset. No billed overages on Spark. |
| reCAPTCHA Enterprise / Fraud Defense | Essentials, no billing enabled | Essentials is automatically used for new keys in projects without billing. 10,000 assessments per calendar month aggregated across the organization/accounts/sites; further CreateAssessment requests return 429/RESOURCE_EXHAUSTED rather than billed overages. |
| Firebase AI Logic | Gemini Developer API free tier on Spark; free model/features only | No payment method or billing account required. Current gemini-3.5-flash-lite standard text input/output are listed free of charge in the free tier. Provider quota/rate exhaustion is an unavailable outcome, never an upgrade. |

Official sources checked:

- https://docs.cloud.google.com/recaptcha/docs/billing-information
- https://docs.cloud.google.com/recaptcha/quotas
- https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider
- https://firebase.google.com/docs/hosting/usage-quotas-pricing
- https://firebase.google.com/docs/projects/billing/firebase-pricing-plans
- https://firebase.google.com/docs/ai-logic/pricing
- https://ai.google.dev/gemini-api/docs/pricing (redirects to AI Studio pricing)

The Enterprise product name/API enable page also advertises paid tiers; those are
not the selected path. Never attach billing: this changes reCAPTCHA to Premium
and Firebase to Blaze, and all Gemini Developer API usage becomes pay-as-you-go.
Do not use trials, credits, paid-only models, grounding/tools or paid backend
services. Reconfirm the plan/tier before each external activation/deployment.
If any onboarding step requires payment details, billing linkage, a subscription
or a trial, stop. Do not treat the earlier generic paid-tier warning as proof
Essentials requires payment, or this record as permission to select a paid option.

The user personally accepted the first-use Google Cloud agreement. Acceptance
is separate from cost verification; Cloud Billing was directly checked afterward
and shows no billing account linked. Provider registration has since completed.

Firebase project inspected in the signed-in Console: `clause-guard-hackathon`.
Billing remains Spark. AI Logic App Check is **Basic – Enforced**. The registered
web app now shows **Registered** under attestation providers. Do not
disable enforcement or enable production debug mode to deploy.

Hosting initially showed the Get started wizard. The CLI subsequently verified
the existing default site, and Hosting deployment succeeded. The confirmed domains are
`clause-guard-hackathon.web.app` and `clause-guard-hackathon.firebaseapp.com`, but
verify actual provisioning before deploying. The prepared key is restricted to
these two intended domains; other domains are not authorized.

The reCAPTCHA Enterprise API is now enabled under the verified no-billing path.
Created `Clause Guard hosted web`, a score-based key with domain verification on,
limited to the two intended default domains above. No test key, AMP or WAF setup.
The user approved provider registration and CLI OAuth access. Console Save did
not persist, so the same registration was applied with official Firebase CLI
15.37.0's appcheckadmin command surface. It succeeded and Console shows Registered.
TTL is 3600 seconds and minimum score 0.5. AI Logic remains ENFORCED. CLI login is
complete; no tokens are stored in the repository. Cloud Billing was rechecked
and explicitly shows no linked billing account.
The site inventory confirms projects/clause-guard-hackathon/sites/clause-guard-hackathon
as DEFAULT_SITE, URL https://clause-guard-hackathon.web.app. Build configuration
matches the existing Clause Guard Web app without replacing `.env.local`.
No trial, payment information or billing linkage occurred. Hosting is now deployed.

## Prepared locally

- Root `firebase.json`: `apps/web/dist`, predeploy web build, SPA rewrite,
  immutable hashed-asset caching, index revalidation, nosniff and referrer headers.
- Build: `npm run build --workspace @clause-guard/web` (includes TypeScript).
- No Firebase CLI project alias/default was created; deployment must specify the
  actual project explicitly. Verify the site before executing a deployment.
- `appcheck.html` is a localhost-only development diagnostic, not a Vite production
  entry. It invokes existing token verification, sends no inference prompt and
  does not display credentials. It must be absent from `apps/web/dist`.
- Use `http://localhost:5173/` for local demos. The existing browser's attestation
  works there. `127.0.0.1` has separate browser storage and returned an App Check
  403 with device fallback; do not assume both local origins share registration.

## Required before deployment

- [x] Inspect/confirm the Hosting site and intended public domains in this project.
- [x] Verify a documented no-payment/no-billing-account/no-charge provider path.
- [x] Reconfirm Essentials/no billing during actual API/key setup; stop at any payment requirement.
- [x] Only if that path is established, resolve necessary legal/API prerequisites.
- [x] Create or select the intended web reCAPTCHA Enterprise key for those domains.
- [x] Register its attestation provider on the existing Firebase web app.
- [x] Provide `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` to the production build through
  the ignored `.env.production.local`. Existing `.env.local` is preserved.
- [x] Confirm the three existing Firebase web configuration values match that app,
  without printing them. VITE values are browser-visible configuration.
- [x] Confirm Firebase CLI authentication and intended project/site.
- [x] Verify final tests/build, diagnostic-page exclusion and production debug
  rejection; review the intended deployment target/revision.
- [x] Deploy Hosting only to the confirmed target, then verify the actual URL.
- [x] Run fictional mask → inspect → approve → confirmed cloud → restore (partial 1/3).
- [ ] Confirm a complete hosted cloud review after provider capacity recovers.
- [x] Check payload projection, actual badge and edit clearing on the hosted build.

Conditional deployment command once all prerequisites are met:

```sh
firebase deploy --only hosting --project clause-guard-hackathon
```

This command targets the confirmed default Hosting site. Deployment has now succeeded.

The competition accepts debug tokens for submissions, but the current application
deliberately requires real hosted attestation. This release plan preserves that
behavior. Production provider/domain registration is a separate access-sensitive
Console action; obtain action-time confirmation before creating that access.

November 19 build checkpoint: production typecheck/build passes with the public
site key present. `.env.*.local` is ignored. Development diagnostics are excluded
from the output. This verifies local build readiness, not hosted attestation.

Production model constraint: Remote Config previously accepted any syntactically
valid Gemini model name. The parser now accepts only the currently verified
`gemini-3.5-flash-lite`; expanding that choice requires renewed pricing/account
review. Kill switches remain effective for rejected settings, and cached prompt
loading remains covered. Two regressions failed before the correction; 100 tests
across analysis/config/Remote Config now pass. This restriction is deployed.

Hosted smoke evidence and provider HTTP 500 diagnosis are recorded in
DEMO_READINESS.md. The unsupported waiver-as-indemnity fallback explanation is
now rejected by both analysis paths (118 affected tests pass). No additional
live inference was run after that guard. The live deployment is from the dirty
working tree; source changes remain uncommitted and unpushed, based on HEAD
`faa549e5d56135b0a104aaafff89014faa424703`.

Final November 19 release: `projects/clause-guard-hackathon/sites/clause-guard-hackathon/versions/3a504024414714fa`; released `2026-11-19T16:44:00.444Z`.
Production entry `index-Df8SUMTd.js`, SHA-256 `19c84d7298d1760961bd853e0a5bb572dfb09577c726d71d94afdc0a9031a91c`.
The development diagnostic is excluded. No hosted model call was repeated after
the indemnity guard; the earlier hosted observations apply to the prior bundle.

Repository-reconciliation deployment: `projects/clause-guard-hackathon/sites/clause-guard-hackathon/versions/4e84e3275adb01c8`, released
`2026-11-19T17:04:06.180Z`. Entry `index-C1aSSzYT.js`, SHA-256
`bd563204a650369e4809921a69687d4673e5793aeeb03d543e5e79bf9595756e`.


### November 19 explanation policy v2 release

Verified Cloud Billing still has no linked billing account immediately before
this deployment. Official Spark Hosting quota behavior was rechecked; no plan,
API, provider or billing setting changed. Nine Firebase checks and 149 web tests
pass, and the CLI predeploy typecheck/build passed. The official CLI deployed
only Hosting successfully.

Hosted page loads `/assets/index-DuUYRCob.js`, matching the local production entry.
SHA-256: `38bec44fcc459e5e8d56687fe25739d9105b8fe77a59e483ec1b57f6c50b0603`.
The public demo loads with Nano-ready status. Both development-only diagnostic
pages are excluded from the production build. No hosted inference was run during
this smoke check; bounded local cloud acceptance and its limits are recorded in
DEMO_READINESS.md. This checkpoint supersedes earlier uncommitted-source statements:
source is published through draft PR #28; main remains unchanged.


### November 20 clause reference and rent/deposit guard release

Current Cloud Billing again showed no linked billing account before deployment;
Spark Hosting stop-at-quota behavior was rechecked in official documentation.
No payment/billing/provider/API configuration changed. Official CLI Hosting-only
deployment succeeded with its typecheck/build predeploy check.

Entry: `/assets/index-BBgqxcwS.js`.
SHA-256: `8f97c9ded40826db97b6c642b810c859ec21444b06459b0fe76123121c629bdb`.
Hosted DOM loads that exact entry and the Mask contract control. No hosted model
call was performed in this smoke check. Core typecheck, 156 web tests and nine
Firebase setup checks pass; development diagnostics are excluded from production.

This release restricts each isolated clause response to its own supplied tokens
and applies commercial-review-v3 to changed rent/deposit drafts. Local acceptance
found and recorded the underlying failures; this is a safeguard release, not full
six-sample or hosted-content acceptance. main remains unchanged; PR #28 is draft.
