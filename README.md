# Clause Guard

Built for **#BuildHybridAI 2026** with Firebase AI Logic.

Clause Guard helps freelancers and small businesses review contracts. It flags
risks, explains clauses and suggests questions. Detected identifiers are replaced
on your device, then you inspect the masked preview before approving a cloud
request. Masking can miss sensitive text; check and manually mask anything missed.
Results are preliminary assistance and require human review.

## Try the web demo

Open [Clause Guard](https://clause-guard-hackathon.web.app) in desktop Chrome.
The hosted app has its own Firebase setup; visitors do not need Console access,
project configuration or a debug token. Local-model availability depends on the
browser/device, and cloud requests depend on the project's no-cost quota.

1. Select **Try it** and use the included fictional contract, or import one of
   the public [PDF/DOCX fixtures](samples/documents/). Use fictional text for demos.
2. If the app offers **Download**, select it to download the local model. If the
   model is unavailable, pattern masking can still prepare a preview; inspect
   the warning and every clause carefully.
3. Select **Mask contract**, inspect the exact outgoing text, and use the manual
   controls to mask missed details. Local reveal does not change outgoing text;
   undoing a manual mask does change it and requires new approval.
4. Explicitly approve the inspected document for analysis or chat. Each chat
   question has its own masking, preview and approval step before sending.
5. Inspect restored results and source links. A device result is labeled a
   preliminary scan. Failed or unverified results remain unavailable/needs review.
   Suggested replacement wording can be withheld for review.

Editing, remasking, manual revisions or document deletion invalidate prior chat
approval. **Delete this document** asks for confirmation and clears that
application document's local saved values and review/chat state. It does not
remove an original file from your computer or erase provider-side records.
If quota is exhausted, stop; never upgrade or add billing to continue a demo.
See [known limitations and release evidence](apps/web/DEMO_READINESS.md).

## Release status — November 24, 2026

The live web app uses the tested #49 stack. [PR #50](https://github.com/lgudip-01/-BuildHybridAI/pull/50)
consolidates that source for owner review against main; main remains `65152ce`.
The live deployment is ahead of main. Do not describe historical branch checks
as the pending six-sample acceptance run on actual merged main.

| Surface | Verified state | Remaining gate |
| --- | --- | --- |
| Web, desktop Chrome | Hosted document flow and masked cloud chat exercised; imports, manual controls, edit invalidation and source links verified on fictional cases | Coordinated main adoption and exact-main six-sample cloud/content acceptance |
| Android | Separate native candidate has SDK build/emulator release-stop evidence for c9acf60 | Combined #48 SDK rerun, real device, Play Integrity and cloud acceptance |
| iOS | Separate native candidate has SDK build/simulator release-stop evidence for c9acf60 | Combined #48 SDK rerun, real device, App Attest and cloud acceptance |
| Chrome extension | Planned side panel; no initial Manifest V3 scaffold in refreshed main | Scaffold, origin/App Check and integrated runtime acceptance |

The shared UI targets phone layouts; responsive browser checks do not establish
native phone acceptance. Native chat remains disabled. See the
[release adoption checklist](RELEASE_CANDIDATE_20261124.md) and
[project execution record](PROJECT_EXECUTION.md).

## How Firebase AI Logic is used

| Job | Request mode / behavior |
| --- | --- |
| Raw contract and question entity extraction | `ONLY_ON_DEVICE`; pattern matching remains local |
| Approved masked clause analysis | `PREFER_IN_CLOUD` when fallback is enabled, then pin the confirmed source for the batch; strict result validation |
| Approved masked web chat | `ONLY_IN_CLOUD`, bounded masked history, one-use engine approval and source/citation checks |

Cloud analysis uses `gemini-3.5-flash-lite` in the verified release. Web Remote
Config is implemented with validated fixed model/output policy, safe defaults
and independent kill switches. It is not an arbitrary model selector. Each
request consumes the available no-cost quota; no automatic model switch or
application-level retry is enabled.

Firebase App Check is initialized before AI Logic. Production web uses the
registered reCAPTCHA Enterprise provider; local development uses a separately
registered debug token. Native App Attest/Play Integrity runtime acceptance and
extension-origin checks remain separate. App Check reduces unauthorized use;
it does not guarantee that every caller or submitted text is safe.

The restoration map is encrypted in local storage and excluded from the cloud
request. Request paths project approved masked text rather than raw UI values.
A leak check blocks detected surviving values; it cannot prove perfect masking.
App Check exchanges, downloads and other setup traffic may contact servers.
Existing payload observations cover specified fictional tests, not every network
endpoint or all possible documents. Offline analysis requires an available local
model and is preliminary; offline chat and offline cold loading are not claimed.

## Tech stack

React/Vite and TypeScript share the web interface and privacy engine. Firebase
AI Logic, App Check, Remote Config and Hosting provide the web AI boundary and
deployment. IndexedDB/Web Crypto store the local restoration map; pdf.js and
mammoth read PDF/DOCX locally. Separate Capacitor Swift/Kotlin bridges target
Apple Foundation Models and Gemini Nano through Firebase AI Logic; their release
gates are listed above.

## Team roles

Role overviews are in [`roles/`](roles/). Reviewer and backup assignments remain TBD.

| Role | Name | Reviewer and backup | Owns |
| --- | --- | --- | --- |
| [**Privacy engine**](roles/privacy-engine.md) | Likhil Gudipati | TBD | Pattern and on-device masking, placeholder map, leak check, unmasking |
| [**Cloud AI and Firebase**](roles/cloud-ai-firebase.md) | Dhruv Vyas | TBD | Firebase project, AI Logic and App Check on all platforms, cloud prompt and schema, Hosting |
| [**Web app and extension**](roles/web-and-extension.md) | Sai Nagadheeraj Kamsani | TBD | Shared React UI, Chrome extension, first-run and offline screens |
| [**Mobile (Android and iOS)**](roles/mobile.md) | Aarush Goel | TBD | Capacitor apps, native AI bridges in Kotlin and Swift, testing on real phones |
| [**Documents, testing, and demo**](roles/documents-testing-demo.md) | Varun Akella | TBD | PDF/DOCX extraction, clause splitting, sample contracts, demo video, submission |

---

## Run locally

Use Node 24 LTS and desktop Chrome. Start from the branch being verified; see
[PR #50](https://github.com/lgudip-01/-BuildHybridAI/pull/50) for the combined
candidate instead of assuming the default main branch matches Hosting.

```sh
npm ci --ignore-scripts --no-audit --no-fund
```

Follow [Firebase web setup](apps/web/FIREBASE_SETUP.md) for the existing no-billing
project, private local configuration and App Check debug registration. Keep any
existing environment files. Never put a Gemini/service-account key or App Check
debug secret into source or a `VITE_*` variable.

```sh
npm run dev --workspace @clause-guard/web
```

Open the localhost URL Vite prints, and leave that terminal running. Fresh tests
need no live Firebase project:

```sh
npm exec --workspace @clause-guard/web -- vitest run
npm test --workspace @clause-guard/privacy-engine
npm run typecheck --workspaces --if-present
npm run test:firebase --workspace @clause-guard/web
```

## Zero-cost operation

This project must use verified no-cost options requiring no payment method or
billing account. Never link billing, start a trial, enable paid overages, request
a billable quota account or upgrade when a limit is reached. Verify current
pricing and the actual project billing state before deployment or cloud calls;
stop if uncertain. Setup instructions do not authorize payment or acceptance of
legal agreements on another person's behalf.

## Submission and license

The official [hackathon rules](https://firebasehybridaihackathon.devpost.com/rules)
list the submission deadline as **November 30, 2026, 2 PM Pacific / 5 PM Eastern**
(deadline rechecked November 24). [HACKATHON.md](HACKATHON.md) separates current
implementation evidence from outstanding video, submission and platform checks.

[MIT](LICENSE). Clause Guard is not legal advice and does not replace a lawyer.
