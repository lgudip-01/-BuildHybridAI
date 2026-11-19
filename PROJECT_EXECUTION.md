# Clause Guard execution checklist

Checkpoint: November 19, 2026 (America/New_York).

The user has requested implementation of the full project across web, iOS and
Android, following the existing roadmap. Before each step, publish its checklist
and uncertainties. Do not advance until every required check passes. Record
failures and blockers honestly; do not mark a blocked check complete. Scope
changes require the user's agreement. Preserve existing work and local settings.

## Binding zero-cost constraint (November 19, 2026)

The user prohibits all paid services, payment information, billing accounts,
plan upgrades, trials, auto-renewal, pay-as-you-go and billable overages. Only
verified no-cost/no-payment-method/no-billing-account paths are allowed. Quota
exhaustion must stop features rather than create charges. Budget alerts are not
hard caps. Verify pricing and actual account/project state before further cloud
activation, inference, deployment or plugin use. If uncertain, stop dependent
actions and pursue a no-cost alternative. This supersedes earlier activation and
deployment proposals. See active AGENTS.md and global ~/.codex/AGENTS.md.

November 19 verified state: the user personally accepted Google Cloud first-use
terms. Cloud Billing explicitly shows this project has no billing account;
Firebase remains Spark. The documented no-cost path is Spark Hosting,
reCAPTCHA Essentials and Gemini Developer API free tier. The reCAPTCHA Enterprise
API is enabled and a domain-restricted score-based key was created for only
`clause-guard-hackathon.web.app` and `clause-guard-hackathon.firebaseapp.com`.
No trial, payment details or billing linkage occurred. Hosting was subsequently deployed.

The user approved official CLI access and the exact App Check registration.
CLI sign-in succeeded. Console Save did not persist; official CLI provider setup
succeeded and Console now shows Registered. One-hour TTL and score 0.5 preserved.
AI Logic enforcement remains ENFORCED. The default Hosting site was verified
as clause-guard-hackathon with the expected web.app domain.
See apps/web/HOSTING_RELEASE.md for exact limits and evidence.

## Verified starting point

- Primary checkout: `/Users/dhruvvyas/Desktop/ClauseGuard-cloud-check`.
- Branch `test/exhibit-fix`, HEAD `faa549e5d56135b0a104aaafff89014faa424703`.
- Initially clean, including no untracked source files.
- Tracked tree equals GitHub `cloud/approved-analysis` at
  `fd9f7c7e9c2587b4cd1d38f5fb26d0ec9993a789`; remote checked this session.
- GitHub main remains `9719099c920f404221798e4f9107ecb92ea8474e`.
- The six extra local merge commits add no tree differences. Preserve them.
- The older ZIP folder has no unique source files; its local Firebase environment
  file equals the configured checkout's file. Neither needs copying or deleting.
- No active AGENTS.md found in either project or parent locations checked.
  Downloads/AGENTS.proposed.md is a proposal, not adopted policy.
- GitHub supplies teammate updates. Open PRs #6, #10 and #24 overlap; inspect
  current discussions before integration. Do not merge them independently.
- Web typecheck passed on this Mac during this checkpoint.

Official rules checked directly:
https://firebasehybridaihackathon.devpost.com/rules

Deadline: November 30, 2026, 5 PM Eastern / 2 PM Pacific. Target an earlier demo.
At least one platform is required by the competition; the user's target is all
three. Claimed platforms must install and run consistently, use Firebase AI Logic
at runtime, and demonstrate the relevant local model. App Check is required;
debug tokens are accepted by the competition. Public licensed source, a public
English demo of at most three minutes, and a submission description are required.
Submission and video ownership will be decided after the functional demo.

## Step 1 — requirements and access (active)

User update: proceed with web testing/demo preparation even if GitHub posting
remains unavailable; the user will ask Likhil about Android in person. Native
hardware/Xcode and Firebase production access are deferred requirements for their
dependent phases, not blockers for local web work. They are not marked passed.

- [x] Confirm ownership across all implementation areas.
- [x] Confirm web, iOS and Android targets.
- [x] Inspect both folders without losing work.
- [x] Verify current official rules and remote main/cloud heads.
- [x] Inspect open GitHub issues and PRs for current deliverables.
- [x] Check local web toolchain: Node v24.21.0, npm 11.19.0; typecheck passes.
- [x] Inspect native implementation and local build prerequisites.
- [x] Discover official Firebase plugin and suggest installation/connection.
- [x] Verify Firebase access through signed-in Console and official CLI (plugin not required).
- [ ] Confirm iPhone model/iOS and Android tablet model/OS for local AI support.
- [ ] Resolve full Xcode availability for iOS builds.

Uncertainties and observed limitations:

- GitHub connector reads work. Posting the requested tablet inventory comment to
  issue #17 returned HTTP 403, `Resource not accessible by integration`. The
  fallback in-app browser is signed out; the comment has NOT been published.
- Firebase plugin is available but not yet confirmed installed or connected.
- After the user's access approvals, desktop Chrome control works and its GitHub
  session is signed in. The GitHub connector comment retry still returned 403.
  The issue page's content was unavailable to native UI inspection after
  navigation/refresh, so no comment was submitted. The plugin catalog still
  reports Firebase `installed: false`; no Firebase tools are exposed. Full
  Xcode remains absent. OS access approval did not complete these integrations.
- Only Command Line Tools are selected; full Xcode is absent from /Applications.
- Java 17 exists; Android SDK and adb were not found in checked locations.
  Android SDK installation/version selection belongs to native build preparation.
- User reports an iPhone 16 Pro Max running iOS 27.2.1. Physical hardware is
  identified; actual model availability and native runtime remain unverified.
  Likhil (@lgudip-01) has the Android tablet. Its model/Android version and local
  AI support remain unknown. User requested asking Likhil on GitHub.
- NativeBridge.analyze deliberately rejects. Android inference is stubbed; iOS
  currently uses FoundationModels directly and lacks Firebase initialization.
  These are incomplete native implementations, not working platform releases.

Pending GitHub comment for issue #17 (not posted):

> @lgudip-01 Dhruv confirmed that you have the Android tablet we can use for
> Clause Guard device testing. Could you reply with its manufacturer and exact
> model/model number, Android version, and whether Gemini Nano/on-device AI is
> already available on it? If you have not checked on-device support, just send
> the model and Android version—we will verify compatibility. Please also confirm
> whether the tablet can be used for a short install and local/cloud/offline
> smoke check when the Android build is ready. This is a hardware inventory
> request only; no code changes, benchmark runs, credentials, or debug tokens
> are needed.

## Step 2 — consolidate evidence

- [x] Reconcile stale docs against current source and the downloaded handoff.
- [x] Record historical automated, mocked and real-runtime evidence separately.
- [x] Preserve offline and masked-payload observations with their limited scope.
- [x] Establish acceptance matrix with pass/fail/not-tested and evidence method.
- [x] Review the documentation diff for unsupported claims and secret exposure.

Evidence: `apps/web/DEMO_READINESS.md`. Historical docs are retained. Current
matrix supersedes their stale pending statements without rewriting history.

## Step 3 — resolve masking blockers separately

- [x] Recheck #22/#23 and associated branches before editing.
- [x] Correct observed coordinated-person mapping; preserve recognized organizations.
- [x] Verify exact focused local roundtrip/regressions for #22.
- [x] Correct pronoun acceptance without hiding genuine names; regress #23.
- [x] Run affected tests and typecheck for #23 (65 affected tests and web build).
- [x] Verify one focused lease preview/restoration and one offer preview in Chrome.
- [x] Inspect masked preview before analysis; user explicitly delegated the review action.
- [x] Record remaining semantic limitations; do not close issues prematurely.
- [x] Diagnose device fallback: 127.0.0.1 App Check 403; localhost attestation passes.
- [x] Verify one bounded real cloud check: 3/3 lease excerpt, correct restored identities.
- [x] Correct observed joint-and-several draft triage; 126 web tests pass without inference retries.

Substep #23: local correction, 65 affected tests, web build and one actual Nano
preview passed. The four-clause preview took 15,142 ms, masked name/date/salary,
kept all three `Your` phrases and stopped before cloud approval. This closes the
focused #23 implementation/preview gate; the full offer sample and cloud review
are not claimed. GitHub issue was subsequently closed by merged PR #26; local/live acceptance is recorded separately.
Substep #22: 83 engine tests and 24 affected web tests pass; both typechecks and
web build pass. Real Nano lease preview used stable individual tokens and the
same landlord token for Ms. O'Connell. One approved result returned 3/3 on device,
with correct local restoration. A subsequent localhost check confirmed cloud
execution after no-inference attestation verification. Exact organization/person
name collisions are now blocked; the 85-test engine suite passes. See web evidence.

## Step 4 — core release acceptance

- [x] Blocked sends and pattern-only review are clear (actual browser checks).
- [x] Forged/stale approval is rejected (real-engine automated tests).
- [x] Input locks, duplicate operations, edit clearing and fresh approval (live + tests).
- [x] Partial failures retain source without invented reviews/risk (automated + SSR).
- [x] Unconfirmed inference receives no execution badge (automated + SSR).
- [x] Inspect unsupported/download/offline handling (source review, actual browser, prior evidence; limits recorded).
- [x] Inspect production application call paths for raw inference/logging (bounded static review).
- [x] Run meaningful focused tests; typecheck/build relevant changes.
- [x] Record actual browser checks separately from mocks and prior observations.

This gate covers the documented local acceptance methods, not all-endpoint
privacy certification or every real-device state. Production acceptance remains
separate. Narrow layout and basic keyboard access also passed in Chrome.

## Step 5 — Hosting preparation

- [x] Prepare minimal Firebase Hosting SPA/build configuration.
- [x] Verify exact project/site, registered web app and production provider domains.
- [x] Verify production App Check rejects debug bypass (nine setup checks).
- [x] Inspect production entry graph; development diagnostic excluded from build.
- [x] Record build and Console prerequisites without credentials.

Step 5 closed: CLI authentication, restricted provider registration, web app/config
match and exact default Hosting site verified. Cloud Billing again explicitly
shows no linked billing account; Console remains Spark. Build and nine Firebase
setup checks pass. Local config and source changes remain uncommitted.

## Step 6 — deploy and smoke check

- [x] Establish concrete authorized deployment target and ready configuration.
- [x] Deploy intended revision and record URL/revision.
- [x] Exercise fictional sample through deployed mask/review/cloud/restore (partial: 1/3 cloud).
- [ ] Obtain a complete hosted cloud review when provider capacity permits.
- [x] Check masked inference body, confirmed source and App Check enforcement.
- [x] Verify provider-rejection fallback and edit clearing; deliberate network-off not repeated.

Active Step 6 gate: hosted cloud run was partial (1/3), and a single diagnostic
returned provider HTTP 500 / high demand. Fallback source reporting was honest.
Observed fallback waiver-as-indemnity wording is now rejected by a bounded guard;
cloud/device regressions and 118 affected tests pass, with core/web typecheck/build.
No further live inference retry was performed. See apps/web/DEMO_READINESS.md.

## Step 7 — finish required platforms and inputs, then polish

Split this step into small checklists before implementation; each must close
before proceeding to the next. No uncompiled native code counts as delivery.

- [ ] Shared PDF/DOCX import, stable clauses and fixture verification.
- [ ] Product UI, accessible error/review flow and responsive mobile layout.
- [ ] Android approved transport, Firebase local/cloud AI, App Check and config.
- [ ] Android SDK/build setup and actual supported-device verification.
- [ ] iOS approved transport, Firebase local/cloud AI, App Check and config.
- [ ] Xcode signing/build setup and actual supported-iPhone verification.
- [ ] Extension capture and side-panel lifecycle, if retained as a deliverable.
- [ ] Native/schema/placeholder/source/approval tests and actual build evidence.
- [ ] Chat only after real question-masking, approval, one-use and stale lifecycle.
- [ ] Chat bounded history/citations with masked-only transport and tests.
- [ ] Motion/visual finishing touches preserve accessibility and native scrolling.

## Step 8 — submission readiness

- [ ] Update README/setup and platform claims to demonstrated behavior.
- [ ] Verify public source/license and disclose relevant pre-existing work.
- [ ] Agree video/submission owner and prepare accurate demo script.
- [ ] Record public English video of at most three minutes.
- [ ] Confirm team eligibility/membership and required Devpost fields with humans.
- [ ] Verify final build/revision/links before the deadline.
- [ ] Human representative confirms submission; record completion evidence.

## Invariants

Raw contract text is local-only. Cloud inference requires the exact current
engine-approved batch and sends projected masked fields only. Preserve runtime
approval and stale checks, schema/placeholder/coverage validation, actual inference
source reporting, commercial drafting and guarantee safeguards. Never weaken
validation to obtain a successful demo. Do not print secrets or contract values.
No automatic model retries or broad sample reruns solely to obtain green results.

No reset, clean, deletion, force push, silent environment replacement, billing
change, access change or unrelated merge is authorized by this checklist. Account
actions and real-device evidence must use the user's actual access and hardware.

Production model constraint: Remote Config previously accepted any syntactically
valid Gemini model name. The parser now accepts only the currently verified
`gemini-3.5-flash-lite`; expanding that choice requires renewed pricing/account
review. Kill switches remain effective for rejected settings, and cached prompt
loading remains covered. Two regressions failed before the correction; 100 tests
across analysis/config/Remote Config now pass. This restriction is deployed.

Final November 19 release: `projects/clause-guard-hackathon/sites/clause-guard-hackathon/versions/3a504024414714fa`; released `2026-11-19T16:44:00.444Z`.
Production entry `index-Df8SUMTd.js`, SHA-256 `19c84d7298d1760961bd853e0a5bb572dfb09577c726d71d94afdc0a9031a91c`.
The development diagnostic is excluded. No hosted model call was repeated after
the indemnity guard; the earlier hosted observations apply to the prior bundle.

Final hosted DOM verification loaded `/assets/index-Df8SUMTd.js`, matching the
deployed build. The demo tab remains open in Chrome at the public URL, reset
to the fictional sample with no analysis automatically submitted.


## Repository refresh — November 19, 2026 (after Likhil's comments)

Checklist for this increment:
- [x] Read all 16 issue threads and relevant PR discussions/metadata.
- [x] Verify remote main/cloud heads without touching local history.
- [x] Identify Likhil's direct requests, completed work and remaining ownership.
- [x] Reconcile merged #26/#27 behavior with the local implementation and preserve safeguards.
- [x] Re-run relevant engine/approval/analyzer checks after reconciliation.
- [x] Record actual network-off fallback separately from the earlier provider-500 fallback (0/1 validated; content acceptance remains open).
- [x] Update staged roadmap and acceptance matrix with repo links and honest blockers.

Verified remote main is `ea30d63117cdc0c79a01b0dbc7c0ee936f67d1e5`.
PR #26 (`bdcdfbc`, pronouns) and PR #27 (`ea30d63`, coordinated tenants) are
merged and issues #23/#22 are closed. The cloud branch remains `fd9f7c7`.
Local HEAD/dirty work are preserved; no merge/reset/stash/checkout performed.

Likhil's #22 comment is directed to Dhruv: the live lease retest belongs to us.
His #23 comment explains completed engine work, not a new request to rewrite it.
Our focused lease retests already cover stable identities and restored names,
but the exact merged engine behavior still needs reconciliation. His pronoun
list covers first/third-person forms missing from our narrower local correction.
Our local ambiguous organization/person collision block and explicit review for
uncorroborated groups must be retained when reconciling the overlapping fix.
Canonical full-name restoration of a uniquely linked titled surname is accepted
for analysis output; original source wording remains locally accessible.

No issue has a high-priority label in the returned metadata. Priority here follows
#1/#7/#8's explicit web-v1 dependency, rather than assuming a label exists.
#7/#8/#4 remain open: full six-sample cloud acceptance is incomplete. Minimal
#19 UI lifecycle works locally/deployed but final product integration is unfinished.
PR #6 and #24 are open and currently non-mergeable; #10 is an overlapping stacked
draft. These need one reconciled integration path, not independent blind merges.
#12 engine delivery is completed; #5's remaining confirmation is Sai's, not Dhruv's.
#13 confirms the engine chat design with six required changes, still unimplemented;
chat must wait until the core analyzer acceptance gate closes.

### Ordered remaining roadmap

A. Core web-v1 acceptance (active, before new product scope)
1. Reconcile #26/#27 and preserve our privacy/commercial/cost guards; regression checks.
2. Actual offline fallback, edit invalidation and masked payload/source evidence.
3. Bounded exact lease/offer/freelance acceptance, then six fixed sample cloud checks
   (#7/#8). Stop on provider availability/quota failures; do not retry to manufacture
   passes or weaken validation. Current high-demand HTTP 500 is an external blocker.
4. Resolve #10's remaining ordinary-language bare-token false-positive concern with
   tests while continuing to reject rewritten identities and invented drafting blanks.
5. Publish one reviewable integration of current source/evidence against current main;
   resolve overlapping #6/#10/#24 safely and retain teammate ownership. Passing mock
   tests or a closed masking issue does not itself close analyzer acceptance.

B. Document import (#18, Varun): local PDF/DOCX extraction, stable clause splitting,
   twelve sample-file comparisons, no upload/content logging.
C. Native delivery (#11/#17, Aarush): approved protocol, actual Firebase local/cloud
   adapters and attestation, toolchains, iPhone/Android inventory, real six-sample and
   offline checks. Scaffold/simulator-only pattern masking is not native AI delivery.
D. Product/extension (#19, Sai): adopt existing lifecycle/results, accessible mobile
   screens, file handling and extension capture/side-panel verification.
E. Chat (#9/#13): engine context/variants/ambiguity handling, atomic one-use consume,
   per-question preview/approval, immutable revisions, in-memory question map; then
   one-turn cloud-only transport, bounded masked history, citations, restoration.
F. Motion polish (#25, Sai/Aarush): reduced-motion support, one scroll controller per
   surface, native textarea scrolling and lifecycle cleanup; after core functionality.
G. Submission: accurate README/license/platform claims, <=3-minute English demo,
   team eligibility and final human submission, by November 30, 5 PM Eastern.

Before each later increment, expand its checklist and clear its uncertainties.
No messages/comments, issue closures, merges, paid service or billing changes are
part of this repository review. The user asked to inspect and adjust the work plan.


### Reconciliation evidence and current increment

- PR #26: https://github.com/lgudip-01/-BuildHybridAI/pull/26
- PR #27: https://github.com/lgudip-01/-BuildHybridAI/pull/27
- Direct live-retest handoff: https://github.com/lgudip-01/-BuildHybridAI/issues/22#issuecomment-7014167148
- Pronoun fix explanation: https://github.com/lgudip-01/-BuildHybridAI/issues/23#issuecomment-7014163709
- Analyzer review: https://github.com/lgudip-01/-BuildHybridAI/pull/10#issuecomment-6967022888

Merged behavior reconciliation is implemented in the working tree without Git
merging or replacing files wholesale. Two regressions failed before the fix:
first/third-person pronouns and pattern-only titled surname linking. All 88 engine
tests, engine typecheck and 9 real-engine integration tests now pass. Original
collision/review safeguards remain, with their regressions passing. Exact merged
#27 preamble/maintenance/signature fixture passes both pattern and mocked-model paths.

The earlier #10 ordinary-language false-positive concern was reproduced in all
three response fields. Lowercase prose no longer counts as a dropped-bracket
identity merely because it says “party a court finds” or “date 1 year after”.
Token-style underscores/hyphens remain rejected in any case; uppercase/title-case
spaced labels remain rejected. All unknown bracketed text/drafting blanks still
fail. This is a lexical heuristic, not semantic proof about every paraphrase.
144 web tests (all eight test files), core typecheck and production build pass.

Actual local Chrome network-off check used a single fictional payment clause.
DevTools Offline was visibly selected. The cloud fetch failed with
ERR_INTERNET_DISCONNECTED and zero transferred bytes. The app confirmed device
execution but rejected the answer (0/1 validated), showing no invented risk or
rewrite. This closes source/fail-closed fallback evidence, not offline content
acceptance. No throttling was restored and editing cleared preview/results.
No successful offline restoration is claimed for this fixture.

Exact full lease local Nano preview took 11,141 ms. All 14 fixture-sensitive
expectations were absent and all five keep terms remained; 12 unique ledger
tokens were issued. c2 keeps distinct co-tenants and “Tenants”; c7 reuses the
landlord token; c10 reuses the same three identities. Billing was rechecked with
no linked account before approval. One reviewed ten-clause lease analysis completed with 4/10 validated in cloud;
details and the next bounded investigation are below.


### Exact lease outcome and next acceptance increment

- [x] Actual exact lease preview matches stable tenant/landlord identities.
- [x] Actual cloud c2 restores each tenant once, with no duplicated co-tenant.
- [x] All ten input clauses have a validated result or an honest failure card.
- [x] Separate validation failures from recorded transport failures.
- [ ] Inspect already-recorded c3/c7 response bodies and reproduce their exact
  invalid-response reason; do not resubmit the full batch to obtain another answer.
- [ ] Correct an application defect only if the captured answer demonstrates one;
  preserve rejection of malformed/invented/unsupported output.
- [ ] Complete bounded remaining sample acceptance when provider capacity permits.
- [ ] Verify successful offline content/restoration separately from source fallback.
- [ ] Prepare source promotion against current main and reconcile overlapping PRs.

The exact lease run returned **4/10 validated in cloud** (c1,c2,c4,c9).
Network recording showed one HTTP 500 (c5), three 30.00-second cancelled requests
(c6,c8,c10), and HTTP 200 responses rejected by validation for c3/c7. No new cloud
batch was started after this partial result. The first two accepted answers include
the title and correct preamble; c2 names Margaret O'Connell, Wei Zhang and Lucia
Fernandez once each, with no duplicate tenant. The original source remains local.
This closes the reported #22 identity bug's actual preamble retest; it does not
close #7/#8's full analyzer quality acceptance. The c9 free-form answer refers to
only two of the parties in its context question; no universal role/semantic pass
is claimed from schema acceptance.

### Sample evidence ledger (avoid redundant broad reruns)

| Sample | Verified evidence | Remaining focused gap |
| --- | --- | --- |
| NDA | Handoff reports one 10/10 cloud pass; earlier invented blanks rejected. | Not a reliability benchmark; preserve validation and review material changes. |
| Freelance | Exhibit-reference engine fix merged; handoff latest 9/10. | Inspect/resolve prior c9 invented title blank; bounded affected-clause acceptance. |
| Lease | Exact current preview passes; actual current 4/10 cloud, c2 identity correct. | Two invalid responses and recorded provider 500/timeouts; full acceptance open. |
| Offer | Pronoun fix merged/reconciled; prior actual Your preview passed. | Bounded relevant cloud check, then complete sample acceptance if warranted. |
| Promissory note | Handoff source-quoted guarantee c8 1/1 and commercial withholding checks. | Not an unrestricted full-note semantic pass. |
| SaaS | Handoff focused c5/c7/c8 3/3 with empty drafts after earlier bad drafts/errors. | Neutrality/context and remaining unresolved clause cases. |

Original handoff is evidence context, not fresh execution or permission. Do not
start another automatic six-sample loop merely because older evidence is partial.
Advance the specifically unresolved cases one at a time, record failures, and
leave acceptance open where the service or answer does not satisfy it.

Repository-reconciliation deployment: `projects/clause-guard-hackathon/sites/clause-guard-hackathon/versions/4e84e3275adb01c8`, released
`2026-11-19T17:04:06.180Z`. Entry `index-C1aSSzYT.js`, SHA-256
`bd563204a650369e4809921a69687d4673e5793aeeb03d543e5e79bf9595756e`.

The reconciliation fixes are deployed and the hosted page loaded
`/assets/index-C1aSSzYT.js`, matching the build. No new hosted inference was
performed. Changes remain uncommitted/unpushed locally; no Git merge, issue
mutation or teammate message occurred. The next increment starts with captured
c3/c7 invalid-response investigation, not chat/polish or a blind sample rerun.


## Authorized roadmap execution and source publication — November 19

The user explicitly requested following each roadmap step, pushing changes to
GitHub and tagging teammates for concrete missing inputs. This supersedes the
previous review-only restriction on repository messages/publication. No billing
or payment authorization changes.

Publication increment:
- [x] Preserve all 17 modified/new working files plus tracked diff in a local backup.
- [x] Commit them on isolated `codex/web-release-readiness` (0edf8e7).
- [x] Fetch/inspect main ea30d63 and reconcile its merged #26/#27 changes.
- [x] Preserve Likhil's original tests and the stricter organization/review guards.
- [x] Run merged-tree checks: 92 engine tests, 144 web tests, nine Firebase checks,
  core/engine typechecks and web production build pass.
- [x] Verify only `.env.example` is tracked; real local environments stay ignored.
- [ ] Push the isolated integration branch and verify its remote SHA.
- [ ] Open/update one reviewable draft integration PR; preserve main and other PRs.
- [ ] Tag teammates with specific hardware/current-work requests.

The merge conflict in merge.ts was reconciled using the already tested explicit
organization evidence/normalization path rather than applying a second generic
list-dropping pass. Both Likhil's original #27 fixtures and our stricter collision
cases pass. Duplicate pronoun vocabulary was consolidated without losing forms.
No reset, force push, environment replacement or teammate-test deletion occurred.
The earlier commit/deployment entries remain historical checkpoints.

Roadmap gate A remains active: inspect recorded invalid c3/c7 replies, separate
provider 500/timeouts from answer failures, and verify bounded remaining sample
and offline-content acceptance. Do not mark A complete or move into chat/polish
merely because source publication succeeds. Later B–G gates remain incomplete.
