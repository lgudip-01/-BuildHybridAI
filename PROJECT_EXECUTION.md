> Current combined checkpoint: see `apps/mobile/COMBINED_CANDIDATE_20261124.md` and
> the final section below. Older entries are historical evidence, not current gates.

# Clause Guard execution checklist

Current checkpoint: November 23, 2026 (America/New_York).
Historical increments follow; the latest increment controls the active gate.
Current gate: A, branch acceptance complete within documented scope; maintainer
review/merge and the issue #30 main verification remain open.

User authorized independent cloud-chat adapter implementation on November 22
while the teammate-dependent gates remain open. See the latest increment below;
this does not authorize enabling chat or bypassing the engine approval boundary.

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
- [x] Publish the isolated integration branch and verify its remote source tree.
- [x] Open draft integration PR #28; preserve main and other PRs.
- [x] Tag teammates with specific hardware/current-work requests in #17, #18 and #19.

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


## Core diagnostic increment — November 19

Checklist and uncertainties:
- [x] Preserve local history and use the existing draft integration branch.
- [x] Add fixed validation reasons without returning rejected model output.
- [x] Reject mixed-delimiter token rewrites; preserve ordinary lowercase prose.
- [x] Add a local-only manual diagnostic for fixed public fixtures, requiring a
  fresh masked preview and explicit approval for each attempt.
- [x] Verify 149 web tests, core typecheck and production build; both diagnostic
  HTML pages and the sample diagnostic module are absent from production output.
- [x] Recheck actual Cloud Billing: no linked billing account. Recheck official
  Firebase AI Logic and Gemini pricing for standard gemini-3.5-flash-lite text.
- [x] Run one bounded lease c3/c7 check; record failure instead of weakening checks.
- [x] Align shared prompt instructions with the existing indemnity rejection guard.
- [x] Record the single post-change c3/c7 acceptance result: 2/2 cloud validated.
- [x] Publish this increment and verify the remote source tree (41985b0).
- [ ] Complete remaining core sample and successful offline-content acceptance.

Draft source review: https://github.com/lgudip-01/-BuildHybridAI/pull/28
The initial 49-file integration was published through signed-in GitHub UI because
native Git lacks credentials and connector writes return 403. The fetched remote
source tree matched local exactly: 694fe27ceebfdc80fd7db765e463d11dd59082a4.
Remote history was merged locally without resetting the preserved branch.
Concrete teammate requests were posted in #17 (Likhil hardware, Aarush native
work), #19 (Sai UI/extension work), and #18 (Varun handle/import work). No guessed
handle or assignment was used.

The earlier c3/c7 response bodies were lost with their ephemeral browser tab and
cannot be inspected retrospectively. A new bounded two-clause run confirmed cloud
execution and rejected both explanations for indemnity wording absent from the
source. This is new evidence, not recovery of the older replies. Fixed failure
messages expose the validator category without logging or showing rejected text.
No risk, draft or restored result was presented for these rejected answers.
The source guard remains conservative, including speculative/negative references;
we have not established the exact wording of either rejected answer.

The prompt omitted this exact validator constraint. Explanation policy v2 now
explicitly omits indemnity commentary unless the clause itself uses the wording,
including speculative/negative commentary; missing provisions belong in questions.
This changes instructions only and preserves the rejection guard. One fresh,
reviewed post-change check is authorized as validation of this concrete change;
there is no automatic retry loop or broad six-sample rerun.

Pricing references checked for this increment:
https://firebase.google.com/docs/ai-logic/pricing
https://aistudio.google.com/docs/pricing#gemini-3.5-flash-lite

Gate A remains active. Source publication does not complete cloud quality,
offline content acceptance, native release, or later roadmap gates.

Post-change result: c3 and c7 both validated in cloud (2/2), no failures,
with local restoration and empty redlines. c3 described the premises and asked
about term/rent missing from the excerpt. c7 described repair reporting and asked
about maintenance allocation and a physical contact address. This is a bounded
single-run observation; c7 identity restored the titled surname from its selected
source, not proof of full-document alias consistency. Remote Config remained the
source, with app-owned explanation-grounding-v2 instructions present. No model
or Remote Config server value changed; no production deployment occurred.


### Focused offer/freelance follow-up

- [x] Inspect offer c3/c4/c8 masked preview: four approved tokens, no review block;
  all Your forms and 15% remain unchanged.
- [x] Run one explicitly approved three-clause cloud batch: 3/3 validated,
  correct salary restoration, empty drafts; mutual at-will wording recognized.
- [x] Add only freelance c9 to the fixed local diagnostic selection.
- [x] Inspect freelance c9 masking and run one approved check: 1/1 cloud; no invented blank.
- [x] Record/publish result without generalizing it to all sample clauses (3a2722e).

The preceding source increment was fetched and matched local tree exactly:
150031f992e23a8be21065ab6a06c86f1926e107. Browser-published history was merged
locally without a source change or reset. PR #28 comment 7029342105 records it.
Offer results are one bounded cloud observation, not full eleven-clause acceptance.

Freelance c9: one cloud result validated, both public fixture identities restored,
empty redline, question about signing authority/capacity. The earlier invented
signature-title blank did not recur in this run. This is not full-sample acceptance.

### Demo deployment checkpoint

- [x] Recheck Cloud Billing immediately before deployment: no billing account.
- [x] Verify Spark Hosting pricing: storage deployments stop at 10 GB and sites
  stop after the no-cost transfer limit/grace period; no Blaze/upgrade authorized.
- [x] Verify nine Firebase setup checks and 149 web tests; build passes.
- [x] Deploy only existing Hosting target clause-guard-hackathon.
- [x] Verify hosted page loads /assets/index-DuUYRCob.js, matching local build.
- [x] Publish final evidence and verify fetched source equality (3a2722e).

The demo is https://clause-guard-hackathon.web.app . No new hosted inference was
performed in this deployment smoke check. The local bounded lease/offer/freelance
cloud evidence does not replace full hosted or successful offline acceptance.
The development diagnostics are excluded. No environment file, payment, billing,
model change or App Check weakening was involved.


## Offline content acceptance increment — November 19

Checklist:
- [x] Inspect current source, clean working tree and published integration branch.
- [x] Fetch main/integration; main remains ea30d63 and remote source matches local.
- [x] Prepare only fixed public promissory-note c8 through real local masking.
- [x] Inspect exact masked preview: name/address replaced; two approved tokens;
  needsReview false; no original fixture name/address in the preview.
- [x] Set this tab's DevTools Network throttling to Offline and verify selection.
- [x] Explicitly approve one analysis attempt; no automatic/manual rerun.
- [x] Verify cloud fetch ERR_INTERNET_DISCONNECTED and 0 bytes transferred.
- [x] Verify SDK-confirmed device result, 1/1 validated and local restoration.
- [x] Inspect returned content and preserve the existing strict validation rules.
- [x] Restore No throttling and close DevTools after recording evidence.
- [x] Publish acceptance evidence and verify fetched source equality at 22c9e53
  (tree 8c1b7b35a4d67dbab57490e88656b184d4989c49).

Result: SAMPLE_ROUNDTRIP_COMPLETED, ranOn device, totalClauses 1, succeeded 1,
failed empty. The source-quoted guarantee explanation restored Isabel Mendoza and
509 Juniper Court, Sacramento, CA 95818 correctly from the local replacement map.
Risk was medium, explicitly described as a preliminary review priority rather
than a legal conclusion; redline empty. Four application-approved neutral questions
covered obligations, limits/conditions, amendments and represented party.

The explanation was the existing application-authored source-quoted guarantee
format, enforced by the model response schema and equality validator. This proves
one successful offline model/schema/local-restoration roundtrip. It is not evidence
of unconstrained local-model legal reasoning or general offline content quality.
Remote Config source was remote (loaded before Offline); explanation-grounding-v2
and source-quoted-guarantee-v1 were present. The app was loaded/model available
before Offline: cold-start installation/download and an offline page reload were
not tested. Previous free-form offline 0/1 remains an observed limitation.

Native Chrome required a brief human pause to stabilize focus; no analysis ran
until Offline was visibly selected on the correct diagnostic tab. Network was
restored to No throttling and DevTools closed. The successful diagnostic result
was left open for review. No source correction, validator weakening, cloud retry,
billing linkage, API activation or deployment was needed.

Next task: complete remaining fixed-sample cloud acceptance, then a complete
hosted review. Gate A stays active; import/native/chat/polish do not advance yet.


## Full-sample acceptance / clause reference isolation — November 20

Checklist and uncertainties:
- [x] Inspect clean local source and latest main/integration refs; no new source
  changes or review instructions in #7/#8/#28 affect this increment.
- [x] Recheck no linked Cloud Billing account and official model free-tier pricing.
- [x] Expose fixed full samples in the development-only diagnostic; no automatic loop.
- [x] Inspect complete lease masking: ten clauses, twelve tokens, distinct tenants,
  stable landlord alias; all required sensitive expectations absent.
- [x] Approve one full lease batch after focused explanation-policy checks passed.
- [x] Record all ten fetches HTTP 200; distinguish content rejection from outages.
- [x] Pause other sample sends after identifying an accepted cross-clause reference.
- [x] Reproduce unsafe acceptance with regressions before changing validation.
- [x] Restrict prompt/validation references to each supplied clause; preserve real
  batch approval, source pinning, per-clause failures and no retries.
- [x] Pass 154 web tests, core typecheck and web production build.
- [x] Run one reviewed c5/c6 cloud verification: 2/2 validated; correct five-day
  grace period and local amounts; no cross-clause reference.
- [x] Publish application source/evidence and verify those paths match fetched
  5a79f1b (excluding this tracker update).
- [ ] Complete the broader sample acceptance gate; do not advance into later scope.

The full lease returned 7/10 structurally validated in cloud. c2/c4/c7 were
withheld for unsupported indemnity wording; no 500/timeout/quota failure occurred.
This is NOT a lease quality pass: accepted c5 used the security-deposit token
[AMOUNT_3] as a rent grace period, restoring the deposit amount as a day count.
Accepted c9 also referenced two party tokens absent from its governing-law source.
Prompt instructions forbade these inferences, but validation allowed every token
in the complete batch even though each request sent only its own clause.

Correction: derive the prompt allowlist and response allowlist from the current
approved clause. Never copy/filter a batch to manufacture approval; the original
batch, stale checks and sequential transport remain. The shared batch-token helper
is preserved for callers that actually handle a complete batch. A separate typed
clause-token helper is used for isolated clause analysis. Tokens still require
exact brackets/case and all grounding/commercial checks remain active.

Six new cloud/device regressions cover cross-clause tokens in all output fields;
all failed before the fix, then passed. The existing allowlist regression was
updated to require clause-local prompt tokens; existing projection/source tests
remain. This prevents the observed cross-clause substitution, not arbitrary
semantic misuse of a token that does occur in the same clause. Earlier 7/10 is
pre-correction evidence and must not be presented as seven accurate reviews.
No further full batch was sent merely to obtain a cleaner answer.

Pricing checked: https://firebase.google.com/docs/ai-logic/pricing and
https://aistudio.google.com/docs/pricing#gemini-3.5-flash-lite . No billing/model/
provider setting changed. Full samples are manual options only; later samples
remain unrun in this increment pending the current defect/acceptance gate.


Post-correction bounded c5/c6 check: 2/2 cloud validated, no failures. The rent
explanation correctly stated five days and restored rent/late fee independently;
the deposit explanation restored only its own amount and 21-day return period.
This is one observation, not a fresh full lease pass. It exposed another narrow
guard gap: a changed deposit draft added an itemized-statement duty, but the
commercial keyword triage did not cover rent/deposit terms. Two replay regressions
for deposit/rent changes failed before the fix and passed afterward. Commercial
review v3 now withholds changed rent/deposit drafts; unchanged wording still passes.
No further model call was used to test deterministic post-processing.

All 156 web tests, core typecheck and web production build pass. The developer
sample selections remain excluded from production output. Integration instructions
now specify clause-local reference constraints for each isolated analysis request.
Remaining lease quality holds (c2/c4/c7 indemnity wording) are not resolved by this
reference correction; other full samples are not advanced past that acceptance gap.


Correction release checklist:
- [x] Preserve source and approval/source/grounding guards.
- [x] Recheck actual no-billing state and Hosting stop-at-quota behavior.
- [x] Verify core typecheck, 156 web tests and nine Firebase setup checks.
- [x] Deploy only existing Hosting target; predeploy build passes.
- [x] Verify live page loads /assets/index-BBgqxcwS.js and Mask contract control.
- [x] Publish application source/evidence and verify those paths match fetched
  5a79f1b (excluding this tracker update).

Production entry SHA-256:
8f97c9ded40826db97b6c642b810c859ec21444b06459b0fe76123121c629bdb.
No hosted inference was repeated during release verification. This increment
fixes demonstrated reference/draft guard gaps, but does not complete full sample
acceptance. Next: inspect the still-withheld lease explanations (c2/c4/c7) and
resolve their content failures before advancing the remaining full sample checks.
No legal analysis correctness is inferred from passing schema/token validation.


## Likhil review follow-up — November 20

Review read first: https://github.com/lgudip-01/-BuildHybridAI/pull/28#issuecomment-7031577403
User authorized acting on the review after inspection. The comment is teammate
review evidence; it does not override user constraints or independently grant
permission for paid services, security changes or unrelated work.

Adjusted priority: correct the demonstrated company/person restoration regression
before further cloud acceptance. Clause-reference restriction is approved by the
engine owner, with the conservative cross-clause notice trade-off acknowledged.

Checklist:
- [x] Inspect latest refs, working tree, review and actual engine alias path.
- [x] Reproduce Jordan Ltd./Mr. Jordan identity corruption before correction.
- [x] Apply surname-owner organization/suffix checks without changing approval.
- [x] Restore one shared COORDINATION regex and describe personItEnds behavior.
- [x] Verify pattern-only and model-reported paths and exact local restoration.
- [x] Pass 94 engine + 156 web tests (250 total), engine typecheck and web build.
- [x] Verify older PR work/discussions before housekeeping; preserve branches.
- [x] Close superseded #6/#10/#24 with links to #28 and the review rationale.
- [x] Publish engine correction/release evidence and verify those paths against
  fetched 646d161 (excluding this tracker update).
- [x] Update no-billing hosted demo; verify entry /assets/index-DXRiOaHG.js.
- [x] Inspect retained lease request log; it is empty after reloads. Keep the
  explanation-quality gate open and prepare a bounded follow-up.

Both Jordan regressions failed before the fix (Signed by [ORG_1]) and passed
afterward (Signed by [PERSON_1]), restoring the original titled person rather
than the company. Existing unique full-person surname/landlord-alias cases still
pass. Two paths account for 250 tests rather than the reviewer's single added
case/249. No raw model calls were required to establish this engine correction.

PRs #6/#10/#24 are closed as superseded, not merged. Their branch heads are
retained, and both historical heads are ancestors in the preserved local Git
history. The browser-published integration has equivalent/newer source, not
identical historical commit ancestry. All extant files from those PRs are present.
The filename architecture/index.html is a deletion in #10 itself, not missing
unique work. No branch deletion, reset, force push or main merge occurred.


Release: current Cloud Billing showed no linked account immediately before
Hosting-only deployment; official no-billing Hosting quota behavior was rechecked.
Deployed entry /assets/index-DXRiOaHG.js, SHA-256
024ae9f14a048f0bea4572458ec1d10c8af609fd15b16347c9aa0d7b3be60e96.
Hosted DOM loads that entry and Mask contract. No hosted model call was made.
The batch-token helper is retained to avoid unnecessary shared API removal; the
production isolated-clause transport uses only clausePlaceholders as approved.

Retained lease diagnostic was inspected without submitting again: its request log
is empty after page reloads, so the older raw response bodies cannot be recovered.
No claim is made about the exact rejected wording. Added a manual fixed selection
for c2/c4/c7, selected before masking/approval, for one bounded follow-up after
publication. No automatic request, logging of rejected output or validator
relaxation was introduced. The engine-owner fix does not itself resolve the
separate explanation-quality gate.


### Next bounded lease check under current clause-local validation

- [x] Reconfirm no-billing/model pricing prerequisites before inference.
- [x] Prepare and inspect only c2/c4/c7 with genuine engine masking/approval.
- [x] Send one explicitly approved three-clause batch: 2/3 cloud validated.
- [x] Record source, failures and local restoration without weakening validation.
- [x] Publish the observed result and preserve broader acceptance limits.


## Held lease outcome and bounded term correction — November 20

The first preparation attempt was unavailable while the local Vite server was
stopped; it did not establish a privacy-engine or fixture leak. Restarted the
local server. Pattern-only preparation of c2/c4/c7 passes with no analysis call.
Development diagnostics now show only fixed preparation categories (local privacy
block, surviving fixture value, or preparation unavailable); no raw spans, SDK
errors, response bodies or credentials are exposed by this error path.

One reviewed c2/c4/c7 cloud batch completed 2/3. c2 restores both tenants once,
keeps multiple tenants, asks neutrally about joint/several obligations and the
represented party. c7 restores the landlord name/contact details and describes
repair reporting without inventing cost allocations. c4 remains withheld.

Inspected c4's recorded HTTP response without another send. Its explanation
negated a generic list of red flags, including broad indemnity, on a clause that
only states two dates. The existing guard conservatively rejects this unrelated
checklist even when negated. Captured only the masked explanation as a regression;
provider metadata and opaque signatures are not persisted in source/docs.

Correction checklist:
- [x] Reproduce the observed response and keep its strict rejection covered.
- [x] Constrain only the exact simple masked lease start/end-date form, <=1500
  characters; qualified, extended, unmasked-date and other wording stays normal.
- [x] Use visibly application-authored source-quoted explanation and fixed neutral
  questions in both cloud/device schemas; require empty draft and exact format.
- [x] Reject provider noncompliance instead of replacing an invalid reply.
- [x] Preserve token/grounding/approval/source checks and guarantee format behavior.
- [x] Pass 174 web tests, core typecheck and production build.
- [x] Confirm a stable single-clause live check: cloud 1/1, dates restored, empty
  draft, two allowed questions and source-quoted-lease-term-v1 reported.
- [x] Publish source/evidence and verify fetched source equality: all application
  and release-evidence paths match fetched 11b147c; tracker updated afterward.
- [x] Deploy/verify the tested correction on the no-billing demo: hosted DOM
  loads /assets/index-vEwRZA-q.js; no hosted inference in this smoke check.

The initial post-correction c4 attempt reloaded before any result could be
observed. It is inconclusive, not a pass or confirmed provider failure. Vite logs
show websocket connection loss and reconnection. Added dev:acceptance, which
binds only 127.0.0.1:5173 with strictPort and hmr false; resolved configuration
verified. Normal dev/production behavior stays unchanged. Acceptance runs must
reload manually after source/config changes. After this concrete environment
correction, one newly previewed/approved c4 check completed cloud 1/1. No automatic
retry or broad batch loop was introduced. The inconclusive attempt remains in
the evidence ledger rather than being erased.

The returned explanation quotes February 1, 2026 and January 31, 2027 after local
restoration, clearly says Source-based lease-term review, asks about intended
dates and early termination/renewal elsewhere, and frames risk as preliminary.
This is a constrained review template, not free-form legal reasoning. c2/c7 and
c4 passed focused checks across separate runs; there is no new full-lease pass.
The broader six-sample and complete hosted-content acceptance gate stays open.


Final publication check: application and evidence paths match the fetched
11b147c branch, excluding this final tracker update. No working changes were
discarded. A concurrent upstream update moved main to d7052f3 via merged PR #29;
its only changed file is reports/privacy-engine-evals.pdf. PR #28 does not change
that report, so its newer upstream version must remain intact on eventual merge.
No runtime code changed upstream and no main merge was performed locally.
The report describes engine masking/type/restoration tests, not complete cloud
review acceptance; its freelance c6 clause-type miss remains recorded upstream.
Next increment: one reviewed full-lease run under the current guards, classify
any failures without retry loops, then remaining sample and hosted acceptance.
Gate A stays open; later import/native/chat/polish gates remain pending.


## Full-lease acceptance increment — November 20

Checklist for this bounded increment:
- [x] Confirm clean working tree and published-source equality; refresh refs and
  PR #28 comments. No newer review or runtime change supersedes this run.
- [x] Start localhost-only dev:acceptance after the earlier server had stopped.
- [x] Verify current project has no linked billing account and the configured
  standard model's input/output pricing remains free.
- [x] Mask and inspect all ten public lease clauses; no fixture values remain;
  separate tenant identities and genuine engine-issued approval retained.
- [x] Approve one full batch and inspect all accepted explanations/restorations.
- [x] Record all failures without a retry, validator relaxation or fabricated
  success. Result: cloud 6/10, all six accepted drafts empty.
- [ ] Full lease accepted: c3/c5/c8/c9 remain withheld for indemnity wording not
  established in their source clauses. Gate A stays open.
- [x] Publish this evidence and verify fetched source equality: all application
  and evidence paths match fetched 1b2bf07, excluding this tracker update.

The accepted clauses are c1/c2/c4/c6/c7/c10. See DEMO_READINESS.md for per-clause
content review and the limits of the fixed failure category. No new code or
configuration changed, so no redundant model run, build or unit suite was used
to relabel this evidence. The live production build remains index-vEwRZA-q.js.

Next corrective increment checklist (before another acceptance send):
- [x] Inspect retained request evidence without resending: DevTools request table
  is empty after the run, so these four response bodies cannot be recovered.
  Closed DevTools without reload/send; do not invent their exact wording.
  Use the previously captured masked c4 checklist replay as available evidence.
- [ ] Resolve the general prompt-policy conflict: prevent unrelated risk-list
  narration while preserving source-supported risk detection and exact guards.
- [ ] Add meaningful cloud/device replay coverage and run affected checks.
- [ ] Recheck no-cost prerequisites, then choose one justified focused live check.
- [ ] Publish correction/evidence before any subsequent full-lease acceptance.

This replaces the earlier assumption that completing the held-clause focused
checks would establish full-lease readiness. Later sample/hosted acceptance and
import/native/chat/polish gates remain pending. No main merge, paid service or
deployment occurred in this increment.


## User-requested improvement from 6/10 to 10/10 — November 20

The user explicitly requested 10/10. This increment replaces the previous
focused-before-full sequence with a single new full-lease check after a concrete
prompt correction and passing automated checks. It does not repeat unchanged
requests or relax a failed acceptance requirement.

- [x] Verify current refs, PR discussion, clean starting tree and source equality.
- [x] Reproduce v1 prompt retention on both providers and flag states: four new
  regressions fail before correction.
- [x] Retire v1 prompts via versioned source-first defaults while retaining remote
  false flags, approved free-tier model, schema and runtime guards.
- [x] Synchronize local Remote Config templates; document source defaults until
  v2 is published/activated. No server configuration publication performed.
- [x] Pass 178 web tests, core typecheck, production build and nine Firebase checks.
- [x] Recheck current no-billing project and standard model pricing before send.
- [x] Reload manually, inspect a fresh full masked lease and record requests
  before approving exactly one new batch.
- [x] Observe cloud 10/10, no failures; inspect all restored content. All drafts
  empty; identities, amounts, contacts and timing correctly restored.
- [x] Record rent grace-period phrasing as a quality caveat, not perfect reasoning.
- [x] Publish code/evidence and verify fetched tree equality: application, local
  templates and release evidence match 559820d, excluding this tracker update.
- [x] Deploy Hosting-only on the verified no-billing target and inspect live entry:
  /assets/index-dQaypz2E.js. No hosted inference in this smoke check.

The earlier 6/10 failure remains historical evidence. This closes the narrow
full-lease runtime-validation target for this run; it does not close broader
Gate A. Next: remaining fixed samples and complete hosted review, with the rent
wording caveat retained for general content-quality refinement. No import/native/
chat/polish gate is advanced by this result.


Publication checkpoint for v2: no working changes were discarded, and the
upstream report-only main update remains untouched. The tracked source/evidence
tree matches fetched 559820d except this tracker completion. The old failed-run
checkboxes above are historical; the user's newer 10/10 request and v2 sequence
supersede their planned focused/publish-before-full ordering. Broader Gate A
remains open. No additional model send followed the successful full-lease run.


<!-- Preserved #40 checkpoint; its build-status boxes are historical and superseded by the current roadmap below. -->
## November 23: native chat method candidate

This isolated branch starts at #35 (6cf643e); #37–#39 shared engine/bindings/UI
remain separate dependencies, not missing implementations. Primary and all
teammate branches stay intact. See the native plugin NATIVE_CHAT_HANDOFF.md.

- [x] Recheck #35/#39/#17 comments and refs; no new teammate native chat delivery.
- [x] Add Swift/Kotlin stateless chat methods and independent unconditional native
  release stops before configuration/provider work; preserve existing analysis.
- [x] Cross-platform envelope/history/schema/size validation: 45 Swift and 39
  Kotlin checks pass. Swift 6 strict concurrency and plugin syntax parse pass.
- [x] Shared #39 prompt/model/limit parity; clean apply to full isolated integration.
- [x] Document failure corrections, SDK/toolchain limits and owner build handoff.
- [x] Publish draft #40 stacked on #35; fetched 362b6e4 matches all tested
  source/fixtures/handoff files. Final tracker upload/full-tree check follows.
- [ ] Full native SDK builds, native WebView stop check and real phones. Missing
  full Xcode/Swift 6.2.3, Java 21 and Android SDK prevent those claims on this Mac.
- [ ] Owner review/adoption, private config delivery endpoint, current zero-cost/
  App Check verification and bounded live acceptance before any release.

No model/cloud call, activation, deployment, payment, billing, IAM or enforcement
change. Both JS and native release blocks remain; chat is not released.

Native candidate review: https://github.com/lgudip-01/-BuildHybridAI/pull/40 .
Aarush tagged for SDK builds, native WebView blocked-call evidence and adoption;
these are concrete remaining platform checks, not a new implementation request.
Full integrated native source is preserved locally at de3bc38; no main merge.


## Near-perfect quality bar and remaining sample increment — November 20

User preference is saved in AGENTS.md. Aim for near-perfect execution while
keeping evidence candid; no single-run or schema result proves legal accuracy.

- [x] Check refs/current PR #28 discussion and document-work issue; no new teammate
  runtime change or ownership reply supersedes this increment.
- [x] Reproduce rent timing contradiction; five regressions fail before correction.
- [x] Strengthen shared prompt/guard; focused rent/deposit cloud 2/2, timing and
  independent values correct. A residual waiver/procedure question remains.
- [x] Full offer cloud 11/11 validation; inspect content and identify geographic
  scope/advance-notice overclaims instead of treating count as quality success.
- [x] Add geography/notice withholding and source instructions; focused c6/c8
  cloud 2/2 after correction. Preserve full-run flaws as historical evidence.
- [x] Pass 188 web tests and core/web typechecks; synchronization of local prompt
  templates does not publish server settings.
- [x] Inspect full freelance, note, SaaS and NDA previews/results one sample at a
  time; no automatic retries. Record 49/50 runtime validation across all five
  remaining full samples, with content caveats and focused checks separately.
- [ ] Publish tested code/evidence, verify fetched tree and deploy no-billing
  Hosting-only release.

The full offer preview set needsReview true because document-title/Employee ID
label text was conservatively masked. It was explicitly inspected and approved;
no flag was cleared or engine batch reconstructed. Employee ID and its value
restored correctly, although the model's question about that relationship is
redundant. No unmasked fixture value was sent.


## November 21: follow-up on merged main and sample-template retirement

Likhil merged #28 into main at 65152ce after approving the v2 migration/privacy
invariants. He asked for the exact-sentence date template to be retired in favor
of the general v2 path. GitHub connector writes still return 403; authorized
publication uses the signed-in browser.

Reconciliation preserved all local work: 13d29d1 remains on the original local
branch; new codex/content-quality-v3 starts from origin/main and applies only
that work as 8b1fc7d. The newer upstream evaluation PDF is unchanged. No reset,
force push, branch deletion or agent-performed main merge occurred.

- [x] Preserve the working tree before changing branches and retain old history.
- [x] Retire the exact-sentence lease helper/schema/validator; preserve general
  runtime validation and the prior unsupported-checklist regression.
- [x] Verify four lease formulations on cloud/device mocked providers; the exact
  sample case failed before retirement. 189 web + 94 engine tests and nine
  Firebase checks pass; typecheck/build pass.
- [x] Record first freelance 3/3 focused validation as a content failure; subsequent
  2/3 leaves a signature claim withheld and one additional assertion now covered.
  Do not label signature quality resolved or these runs a unified full pass.
- [x] Record SaaS focused 2/2 under final general path: mutual cap and intended
  signatories restored; broader hypothetical carve-out commentary is a caveat.
- [x] Verify one full lease run without the special template: cloud 10/10,
  failed empty, general-v2 reported and correct local restoration.
- [x] Publish separate draft follow-up PR #31; application/templates/release
  evidence match fetched 872f39e, excluding final root instruction/tracker files.
  Verify the complete tree after the root upload.
- [x] Deploy verified no-billing Hosting-only build and record current live asset:
  /assets/index-olgSHuM7.js; no hosted model call in this smoke check.

User preference: close completed task tabs; old project tabs were closed, leaving
active diagnostic, publication, billing and live-check pages only. Close those
too after their evidence is recorded. Unrelated user tabs stay untouched.

Broader Gate A remains open for a uniform final-policy full matrix/content
review and complete hosted acceptance. This increment records actual failures
and withholds known overclaims rather than weakening guards to force green.


Publication: https://github.com/lgudip-01/-BuildHybridAI/pull/31 is draft. The
application, local templates and release evidence match fetched 872f39e before
this final root update. No final-policy full-matrix or hosted-inference success
is claimed. Close the publication tab after final verification; other completed
project tabs have been closed as requested.


## November 21: concise policy v3 and general signatory fields (in progress)

Checklist:
- [x] Refresh refs/PR #31 discussion; published c0230e1 matches the clean starting
  tracked tree. No newer maintainer runtime change supersedes the work.
- [x] Replace global legal-topic lists with concise source-fact instructions;
  retire cached v1/v2 prompts while retaining independent false kill switches.
  Configure cloud temperature 0; no model/provider/API change.
- [x] Six migration/provider checks fail before correction, then pass. Known
  overclaim guards and actual high-risk source-supported analysis remain covered.
- [x] Fresh policy-v3 freelance c6/c9/c10 returns 2/3; ownership improves, but
  signature wording still fails. Do not erase or relabel that observation.
- [x] Add a bounded signatory/identification FIELD grammar across layouts, not an
  exact sentence or named sample. Unknown/operative fields stay on ordinary
  analysis. Explicitly labeled application-authored source quote, fixed neutral
  questions and empty draft are enforced by both schemas and equality checks.
  Provider noncompliance remains a failure, never a substituted answer.
- [x] Pass 218 web tests, core/web typechecks; tests include unseen token IDs and
  field layouts, lowercase/unknown tokens, unknown titles, operative additions,
  input bounds and cloud/device schema enforcement.
- [x] Verify affected freelance/SaaS clauses under the new field format; preserve
  the intermediate cap-comparison failure and its subsequent guard/correction.
- [x] Run/review all six fixed samples on frozen analyzer 5b0a147: actual cloud
  60/60 validation (50 general, nine signatory, one guarantee). Content review
  found an amount-as-recipient deposit question; this is not a perfect content
  pass. New cloud/device replay failures precede its narrow guard; one fresh
  post-guard rent/deposit batch passes actual cloud 2/2. All prior runs retained.
- [x] Correct the dev acceptance WebSocket reconnect reset, prove selection
  survives a server restart without inference, retain the interrupted lease
  attempt as inconclusive. Production unchanged by this dev-only transport fix.
- [x] Pass 225 web tests and core/web typechecks/build after the recipient guard;
  prior unchanged engine (94) and Firebase (nine) checks remain recorded.
- [x] Verify ordinary offline content/restoration: completed November 22 after
  restoring native control and correcting the observed incomplete draft. The
  earlier no-window/prepared-only blocker remains in the historical evidence.
- [x] Complete hosted review: November 22 actual cloud 4/4 plus edit clearing;
  inspect degraded masking warning without clearing it.
- [x] Publish reviewed source/release evidence and verify the fetched application
  tree at 923883b; deploy verified no-billing Hosting-only build. Final root
  tracker upload/full-tree verification are reported in the PR checkpoint.
  Close completed task tabs; retain only the pending hosted-mask handoff.

Pricing/actual project state were rechecked before inference: standard configured
model input/output remain free and the project has no linked billing account.
Only approved masked fixture clauses were sent; no unchanged automatic retry.
The field review labels its application-authored guidance visibly and does not
prove actual signing, authority or legal correctness. It is not free-form model
reasoning. The existing bounded guarantee format remains separately labeled.

Hosted follow-up: the default four-clause demo returned cloud 4/4 and passed
edit clearing, but content review caught contact-scope and compound Name/CEO/entity
signing claims. Seven checks failed before extending the general field grammar
and adding a narrow contact-scope guard/instructions. Grounding v5, 235 web tests
and build now pass; a new hosted check is pending. The 60/60 matrix above is
explicitly the prior v4 baseline and must not be relabeled as a v5 full matrix.

Current deployment: official Hosting-only CLI succeeded, live entry
index-BkV4srSd.js matches the tested build. Fresh hosted v5 masking remains
pending (no preview, no cloud approval/send); native Chrome also reports no
visible window. A human action was requested only to expose a Chrome window for
the isolated DevTools test/diagnosis. Do not advance Gate B while this is blocked.

Next required checks, in order within Gate A:
- [x] Restore native control and inspect the recovered 185,806 ms degraded mask.
  Its cause was not captured; no blind resend was made.
- [x] Complete v5 hosted preview/approval/content/restoration and edit clearing.
- [x] Verify one ordinary general clause offline with actual device source and
  restored values, incomplete draft visibly withheld; No throttling restored.
- [x] Run and inspect uniform v5 six-sample matrix on frozen 3f096b6. Keep the
  earlier v4 60/60 and focused checks separate.
- [x] Update draft PR #31 title/description around current scope and tag Likhil
  for review; prepare the verified publication checkpoint. Close completed
  project tabs while retaining the pending hosted-mask handoff. Gate B's local
  PDF/DOCX fixtures remain blocked by the unchecked acceptance items above.

Publication checkpoint: source, templates, tests and release evidence match
fetched 923883b, excluding this final tracker update. The upstream evaluation
PDF is untouched. Local and browser-created histories remain preserved; no
reset, force push, branch deletion or main merge occurred. PR #31 stays draft.
235 web tests and build pass; remaining acceptance boxes above are intentionally
open. Finished diagnostic/billing tabs are closed; the unresolved hosted-mask
page is retained as a handoff. No further model request was made while blocked.

## November 22: resumed hosted/offline acceptance and draft preservation

- [x] Restore native Chrome access; recover the old preview rather than resend.
  Mask completed after 185,806 ms with patterns-only/review warning; cause not
  captured. Inspect all four fictional clauses/ten values without clearing it.
- [x] Recheck no-billing/free model pricing; approve exact preview once. Hosted
  grounding-v5 cloud 4/4 has correct contact scope and source-based printed-name
  review. Restore all local values; verify editing clears preview/approval/results.
- [x] Mask ordinary one-clause lease dates on device, inspect two placeholders,
  select only the tab Offline, verify cloud failure/zero bytes, actual device
  source and both dates restored. Restore and verify No throttling afterwards.
  Runtime 1/1, but content FAILED: date-only replacement dropped the end date.
- [x] Two provider replay regressions fail before correction; visibly withhold
  drafts omitting source references without replacing prose or retrying. Keep
  complete-reference noncommercial rewrites and strict validation first.
- [x] 238 web tests, core typecheck and production typecheck/build pass. Prompts,
  schemas, configured model, grounding v5 and privacy boundaries unchanged.
- [x] Verify corrected ordinary offline behavior once on the tested deployed
  build: actual device 1/1, both dates restored, incomplete draft visibly withheld.
  Cloud request blocked/zero bytes; No throttling restored. This is safe display,
  not improved model drafting. Current entry index-Cr3HSrZw.js verified live.
- [x] Publish source/evidence, verify fetched application tree at 4d7b67a, update
  PR #31 and close finished test tabs. Full-tree/root verification follows in
  the final PR checkpoint.

New teammate branches are preserved, not merged: engine-masking-gaps at 3e90529
(masking patterns/review warning changes), docs-import at 1a6b334 (local PDF/DOCX,
section splitting, twelve fixtures). Main remains 65152ce and PR #31 has no new
reviewer comment at this checkpoint. Review these branches before Gate B/integration;
do not overwrite their work. Final-policy full matrix remains an unchecked Gate A
item; the v4 60/60 cannot be relabeled. Long/degraded masking remains a reliability
limitation, not a new pass or a proven consequence of window visibility.

## November 22: final branch matrix and team v2 priorities

- [x] Run all six samples on frozen analyzer 3f096b6 without changing policy:
  actual cloud lease 10/10, freelance 10/10, offer 11/11, SaaS 10/10, NDA 10/10,
  note 9/9. Failed empty and all drafts empty. 50 general, nine labeled signatory,
  one labeled guarantee. Preserve broad/redundant-question quality caveats.
- [x] Complete current-policy hosted flow/restoration/edit clearing and ordinary
  guarded offline restoration, retaining degraded-mask and incomplete-draft evidence.
- [x] Publish final source/evidence and verify the fetched application tree at
  4d7b67a; post #30 results/dependencies, update PR #31 and close completed test
  tabs. The final root upload/full-tree check is reported in the PR checkpoint.
- [ ] Likhil reviews/merges #31 when approved; verify and run the cloud checks on
  main before closing #30's explicitly main-based requirement. No agent main merge.

Issue #30 supersedes older assumed owner priorities: team v2 target is November 23
at 2:59 AM Eastern (November 22, 11:59 PM Pacific). Our assigned scope is six-sample
cloud acceptance, general lease path, clearly preliminary offline results, cloud
chat (#9/#13), and Hosting after merges. No main success is inferred from this branch.

Do not duplicate the new teammate work: review #32 (3e90529 engine masking gaps)
and #33 (1a6b334 local PDF/DOCX plus twelve fixtures) for integration/compatibility
before the import gate. Both are unmerged and preserved. Main remains 65152ce.

Next Cloud AI step after the acceptance gate: chat #9/#13 using the confirmed
engine-issued frozen context/question tickets, per-question masked approval,
atomic one-use consumption, current-revision checks, masked-only bounded history,
exact placeholder/clause-citation validation and local restoration. Likhil confirmed
the contract in #13 but the engine APIs are not implemented; Sai's UI confirmation
is still outstanding. Request concrete delivery in #30; never remask a question
with document mask(), fabricate approval tickets, or enable chat before the real
question-masking privacy checks pass. Keep mobile ownership with Aarush (#17/#30).

Final publication handoff: #30 now contains the branch results and explicitly
open main requirement, with Likhil tagged for #31 review/merge and chat engine
delivery, Sai for #13 UI confirmation, and Aarush for mobile PR/device evidence.
Main is not modified by the agent. The runtime source/tests/templates/release
evidence match 4d7b67a; only this final tracker update follows. Keep the long-mask,
broad-question and generated-draft limitations visible; do not mark native,
masked chat, import integration or main acceptance complete from branch results.

## November 22: independent cloud-chat adapter (user-authorized)

Checklist:
- [x] Recheck clean tree, refs, #13 confirmation and #30 comments before editing.
  No new engine delivery or UI confirmation. Preserve analyzer/teammate branches.
- [x] Isolate on codex/cloud-chat-adapter from published e2cde29; no main merge.
- [x] Implement typed masked-only chat bridge, fixed source prompt, strict
  placeholder/citation/schema validation and bounded immutable masked history.
- [x] Enforce first approval check, post-config recheck, atomic consume immediately
  before dispatch, post-dispatch current checks, cross-wrapper serialization,
  clear/timeout cancellation, stale/late discard and fixed sanitized errors.
- [x] Keep production disabled through fail-closed chatGuard functions; no issuer
  or injectable production authorizer. App/production entry does not import chat.
- [x] 58 new chat tests pass; 296 total web tests, core typecheck and production
  typecheck/build pass. Production JS hash remains byte-identical to the live
  index-Cr3HSrZw.js. No deployment, live inference or cloud setting change.
- [x] Write CHAT_INTEGRATION.md with confirmed binding contract, limits, tested
  scope and six-sample real acceptance cases. Mock passes are not live chat proof.
- [x] Publish separate stacked draft PR #34 (base codex/content-quality-v3,
  head codex/cloud-chat-adapter). Source/tests/handoff match fetched e6e6830
  excluding this final tracker update. Tag Likhil/Sai with the concrete #13
  engine/UI binding requirements in #30. Full-tree check follows in PR checkpoint.

Chat runtime remains blocked: real engine ticket/context/question-mask/restoration
exports, UI lifecycle confirmation/binding, actual outgoing-payload inspection,
six-sample cited-answer/variant privacy checks, and current no-billing/App Check
verification before any model call. PR #31/main verification and #32/#33 integration
remain separate open gates. This independent code does not close those checkboxes.

Independent adapter/testing step complete within this scope. PR #34 is draft,
production guard still rejects all chat, no live inference/deployment or paid
service was enabled, and production JS is byte-identical to the existing release.
All old local branches and teammate work remain preserved. Next independent task
is compatibility review of #32/#33 in isolation; actual chat enablement continues
to require engine/UI delivery and real privacy/content acceptance.

## November 22: independent PR #32/#33 compatibility review

- [x] Refresh refs and #13/#34 comments after the browser-review interruption;
  no new engine/UI delivery. PR #34 publication/checkpoint is verified and tabs closed.
- [x] Create a disposable local review worktree from bbac120; combine #32 at
  3e90529 and #33 at 1a6b334 without changing main or teammate branches.
- [x] Baseline combined verification: 320 web + 107 engine tests pass, all twelve
  imported fixtures match, core typecheck and production build pass. No model calls.
- [x] Reproduce a #32 false-negative review flag using an email and URL containing
  a model-only name: two failing cases; a missed lowercase name remains in masked output.
- [x] Reproduce #33 deletion of substantive standalone rent/year/account numbers:
  three failing cases. Reproduce a slow import overwriting newer manual edits:
  one failing actual-handler/ReviewSession case with controlled hooks/file read.
- [x] Preserve six failing cases on the local review branch and as a checked patch;
  document precise source locations, scope and correction requests in
  PR_COMPATIBILITY_REVIEW.md. Do not count these as passing or approve integration.
- [x] Publish report/repro patch (application docs match fetched 9782f32); post
  findings to #32/#33 with Likhil tagged and summarize blockers in #30. Final
  root upload/full-tree verification follows in the PR #34 checkpoint; close tabs.
- [ ] Author corrections and retests before integration approval. Main/cloud-chat
  activation and real device/payload checks remain separate gates.

Review handoff: #32 comment 7083451440 and #33 comment 7083456530 contain the
three findings and requested corrections. Full rerun after adding the cases:
320 web passes/four expected failures, 107 engine passes/two expected failures;
typecheck passes. All six failures are review cases, with no unrelated baseline
failure. Runtime implementation and deployed app remain unchanged. Do not approve
integration merely because the original twelve fixtures pass. Retest the author's
corrected heads before advancing; all local evidence is preserved at the documented
temporary worktree/review commit. No main merge, force push, reset or branch deletion.

## November 22: optional independent candidate corrections

- [x] Preserve original failure evidence at 4a81662 and create a second isolated
  candidate checkout; do not modify teammate branches or deployed source.
- [x] Correct rule coverage, preserve standalone numeric values, and make import
  completion generation/snapshot-aware with an explicit cancellation outcome.
- [x] Keep actual short-name/address coverage, explicit page markers and latest-
  import behavior covered. An added long-company short-form control failed first;
  checking coverage after defined-alias registration corrected that candidate issue.
- [x] Candidate full verification: 326 web + 112 engine = 438 passes, core typecheck
  and production typecheck/build pass, all twelve imported fixtures retained.
- [x] Preserve candidate at d2613f7 and create PR_COMPATIBILITY_CANDIDATE.patch,
  checked forwards against original failure checkout and backwards against candidate.
- [x] Publish candidate artifact/report at fetched 715a560; notify owners in
  #32/#33 and #30 (comments 7083669351, 7083673650, 7083681170). Final root upload/
  full-tree verification follows in PR #34 checkpoint; close finished tabs.
  Candidate corrections are review material, not adopted/deployed behavior.
- [ ] Author review/adoption and actual-head retests before approving integration.

Both original failure and candidate worktrees/commits remain available. Only
review documentation/patch artifacts are added to the published chat branch;
its runtime remains disabled and production source remains unchanged.

Candidate handoff complete: all 438 cases pass only on the isolated candidate,
with engine/core typechecks and production typecheck/build passing. Original
six failures and both local worktrees remain preserved. The actual #32/#33 heads
still require author review/adoption and retest. The engine coverage correction
changes the review flag; it does not automatically discover the intentionally
missed name or certify fully redacted input. Keep actual chat activation, main
acceptance, real browser/Nano checks and phone evidence as separate open gates.

## November 22: teammate requests, native chat and UI handoff

- [x] Inspect both project locations/current Git state; fetch all refs and read
  new PRs, issue comments, review timelines and direct mentions. Preserve local
  graphs and all teammate branches. New work: #35 native analysis, #36 redesign.
- [x] Respond to Aarush's #17 request: verify current Spark/no-linked-billing
  state and official no-payment pricing; register Android/iOS app.clauseguard;
  download and validate both SDK configs outside Git. Ask Aarush for a direct
  delivery address/channel in #17 (7091242882); never post files/debug tokens publicly.
- [x] Review #35 at 6cf643e: 191 web + 94 engine tests and web build pass; accept
  one-masked-clause native interface. Flag iOS localizedDescription raw-path
  logging/rejection to Aarush (7091360009). No real native/model run claimed.
- [x] Inspect #36 at 628c44e; preserve Workbench ownership, flag absolute privacy
  claims and reduced-motion smooth-scroll fallback. No visual/merge approval.
- [x] Move chatbot to top development priority; request concrete engine exports
  from Likhil and coordinate Aarush/Sai in #13 (7091268965).
- [x] Share the guarded dispatcher between web/native; add native cloud-only TS
  adapter, UI conversation store and genuine approved-batch ReviewSession hook.
  No fake ticket registry, document-question remask, raw/history overload or
  production mock answer. Engine seams and guards continue to reject all chat.
- [x] Test per-question approval, native projection/source/timeout, immutable
  masked-vs-display history, stale/close races, exact batch handoff, and closing
  before document edits/remasks including a failed remask. Preserve any test/
  build failures as local verification evidence; final full counts follow.
- [x] Publish verified implementation/handoff at fetched e9f1239 and tag owners
  in #13 (7091553991). Source/contracts match the tested local tree. Final
  root upload/full-tree verification is reported in the #34 checkpoint.
- [ ] Aarush supplies a private delivery endpoint; send only the requested native
  config files. Native App Check/debug/release registration remains separate.
- [ ] Likhil supplies real engine APIs/variants; owner-reviewed binding and actual
  privacy/payload checks before enabling chat. Swift/Kotlin chat methods, UI view
  binding, live six-sample answers and phone evidence remain separate gates.

No deployment, live model call, payment, trial, billing linkage, enforcement
reduction or IAM grant. New work is isolated from original primary checkout at
/private/tmp/clauseguard-chat-mobile-20261122. See CHAT_UI_MOBILE_HANDOFF.md for
concrete UI/native contracts, tested scope and remaining delivery requirements.

Final local verification: 331 web + 94 engine tests, core typecheck and web
production typecheck/build pass. New coverage is 35 cases beyond the initial
296-test adapter. An early test-only mock typing error was corrected before the
final typecheck; focused runtime checks had passed. Source commit 1ed7bea plus
#35 (6cf643e) and #36 (628c44e) merges cleanly in a separate local checkout and
passes 344 web tests and production typecheck/build. Its >500 kB chunk advisory
is retained. #32/#33 are excluded; prior failure/candidate evidence is untouched.
This is no claim about actual engine masking, native SDK builds, phones, live
answers, main or deployment. PR #34 remains draft and chat is disabled.

Final self-review found one additional lifecycle issue before handoff: an external
remask during local question preparation left previous restored messages visible
in phase error. A new regression failed against 1ed7bea (log preserved at
/private/tmp/clauseguard-chat-stale-history-before.log). Stale/wrong-session
failures now close/clear the conversation, including stale response restoration;
cleanup exceptions still clear display state and cannot expose SDK error text.
A throwing-cleanup control is included. Final source/combined counts supersede
the earlier 331/344 checkpoint after the justified correction rerun.

Final corrected verification: **333 web + 94 unchanged engine tests**, core
typecheck and production typecheck/build pass. The isolated corrected #35/#36
combination passes **346 web tests and production typecheck/build**. These final
counts supersede 331/344. The only new cloud resources are the requested native
app registrations; there was no inference, deployment, billing or IAM change.

Verified owner replies: #17 native configs/private delivery (7091242882), #35
native interface and raw-error review (7091360009), #36 integration/copy/motion
review (7091379482), and #13 concrete chat UI/native/engine handoff (7091553991).
No teammate response or engine export had arrived at this checkpoint. Original
primary/source branches remain preserved. After full publication verification,
the primary checkout may move to a new local branch at this tested handoff; never
reset or overwrite the old browser/local histories.

## November 22: genuine engine candidate for the chat dependency

- [x] Fetch refs/read current #13/#17/#30/#34/#35/#36 comments: no new engine/native
  delivery or teammate reply. Full Xcode is still unavailable; do not claim an iOS build.
- [x] Isolate from published #34 at 0ab24d8; preserve primary checkout and all
  existing branches. Implement real engine authority/snapshots/variant masking,
  append-only session tokens, per-question review, atomic consume and local restore.
- [x] Keep production seams and guards rejecting. Add only a typed cleanup seam;
  no bridge/UI issuer, no vault read/write for chat, no document mask on a question.
- [x] Preserve/fix the two initial masking regressions and the actual-Nano
  party-label issue. Pre-correction commit b0a4a22 and local failure logs remain.
- [x] Final automated checks: 140 engine + 340 web tests, engine/core typechecks,
  web production typecheck/build pass. Seven web cases use REAL engine authority
  with only provider/config/binding mocked. Diagnostic is absent from build output.
- [x] Complete the frozen corrected local-only Chrome synthetic matrix on
  d2ac4ec: eight expected outcomes; nine actual Prompt API completions, zero
  failed. Inspect document/question previews, verify one-use/replay locally,
  preserve both runs in CHAT_ENGINE_BROWSER_EVIDENCE.json, close context/tab
  and stop only the agent-owned 5176 server. No cloud answer/network-capture claim.
- [x] Publish separate stacked draft #37 (base #34); source/evidence match
  fetched e098ae7 apart from this final tracker update. Tag Likhil/Aarush/Sai
  in the PR and #13 (7092173315). Full-tree/root verification follows in the
  final PR checkpoint; production seams/guards still reject all chat.
- [ ] Owner-reviewed real binding, native methods/product view, full six-sample
  payload/answer/privacy checks, current zero-cost/App Check verification and phones.

No cloud model call, Firebase activation/configuration, deployment, billing,
payment/trial, IAM or enforcement change. Local Prompt API uses only an already
available device model with no Firebase transport or model download. The candidate
worktree is /private/tmp/clauseguard-chat-engine-20261122. See
CHAT_ENGINE_CANDIDATE.md for precise limits, rephrasing behavior and review gates.

Corrected browser checkpoint completed November 23 at 12:00 AM Eastern.
Known parties remain PARTY_A/B; new Sam/Ada use PERSON_1/2. Shared surname and
invented-token cases block, while full names, street prefix and injection-data
masking preserve expected identities. Main and #34 remain unchanged; separate
engine-candidate publication and reviewer handoff follow. No real cloud call.

Separate candidate + #35 (6cf643e) + #36 (628c44e) compatibility check: clean
local merges, 353 web tests and production typecheck/build pass. The >500 kB
redesign chunk advisory remains visible. No Swift/Kotlin/native SDK build, phone,
main or #32/#33 integration acceptance is inferred. All temporary worktrees and
original branches are preserved.

Engine-candidate handoff: https://github.com/lgudip-01/-BuildHybridAI/pull/37 .
The dependency is now review/adoption and real direct binding of implemented
engine APIs, not waiting for an engine implementation from scratch. Candidate
remains isolated on codex/chat-engine-candidate-20261122; primary checkout is
still the preserved #34 UI handoff on codex/chat-ui-ready-20261122. No source
was copied over teammate work or merged to main. Local/browser histories and
all original failure evidence are retained. No live cloud chat is enabled.

## November 23: real chat binding and full isolated compatibility

- [x] Recheck current refs/comments: no new teammate delivery at this checkpoint.
- [x] Replace stub engine/guard modules with direct real engine exports. Add an
  independent unconditional release stop before config/provider/session/consume.
- [x] Verify real approved questions stop safely on both bridges; forged objects
  still fail authority. Binding checks: 341 web + 140 engine, typecheck/build pass.
- [x] Reconcile #32/#33 and preserved compatibility corrections with #35/#36 in
  an isolated branch, porting import controls/race safeguards into Workbench.
  Full checks: 384 web + 158 engine, core/engine typechecks and web build pass.
- [x] Preserve resolution patch and exact provenance in CHAT_BINDING_INTEGRATION.md.
- [x] Publish thin stacked draft #38 (base #37); fetched 7a41a69 matches all
  tested source/evidence files. This final tracker upload/full-tree check follows.
- [ ] Owner adoption, product chat view/native methods, zero-cost/App Check and
  bounded live acceptance, then real phones/demo. Hard chat egress stop remains.

No cloud calls, deployment, payment, billing linkage or enforcement/IAM change.
Full combined source is local only at 10d9674; primary and author branches intact.

Binding review: https://github.com/lgudip-01/-BuildHybridAI/pull/38 . Owners
Likhil/Aarush/Sai tagged in the PR with concrete adoption/UI/native needs.
The full combined branch remains isolated locally; main was not merged.

## November 23: product chat view candidate

- [x] Recheck #13/#38 and remote heads; no new teammate implementation/review.
- [x] Add shared ReviewChat panel using real session/controller, exact masked
  previews, explicit per-question approval and safe release_pending feedback.
- [x] Wire web/native bridges without enabling dispatch; retain independent stop.
- [x] Seven view regressions: 348 thin-branch web tests; production build passes.
  Isolated redesign/import/mobile integration: 391 web tests/build pass.
- [x] Local desktop/430px browser check: preview, blocked send, zero config/provider
  calls, document-edit cleanup; record synthetic-fixture limits. Stop server/tab.
- [x] Preserve redesign wiring patch and adoption notes in CHAT_VIEW_HANDOFF.md.
- [x] Publish stacked draft #39 (base #38); fetched 0fbbf43 matches all tested
  source/adoption artifacts. Final tracker upload/full-tree verification follows.
- [ ] Owner adoption, native methods, zero-cost/App Check/live acceptance, phones.

Full combined view source is isolated locally at e43d254; original work preserved.
No cloud/model call, deployment, payment, billing or enforcement/IAM change.

Product chat view review: https://github.com/lgudip-01/-BuildHybridAI/pull/39 .
Aarush/Sai tagged for view/redesign adoption; Likhil tagged for engine review.
Native plugin chat methods and live release/phone checks remain unfinished.


## November 23: functional web chat release

- [x] Preserve primary/ZIP folders and teammate branches; use an isolated #39-based release.
- [x] Adopt reviewed masking coverage corrections; retain real approval authority.
- [x] Direct masked-document chat approval, per-question review, source links and stale recovery.
- [x] Verify Spark/no billing, existing Developer API and enforced App Check; no configuration changes.
- [x] Real cloud answers across six public samples and normal product flow; retain provider failures.
- [x] Validate all 18 captured body snapshots against projection/raw-fixture checks (includes duplicates).
- [x] Final 355 web + 158 engine tests and production typecheck/build pass.
- [x] Publish #44 tested runtime source (78b0bb2); Hosting-only deployment succeeded.
- [x] Actual production-origin cloud answer and #chat-source-c1 target verified.
- [ ] Adopt verified flow into teammate UI/import/progress branches without overwriting them.
- [ ] Native #40 full SDK builds, App Check and real-device acceptance; mobile chat stays disabled.

Details/evidence: apps/web/WEB_CHAT_RELEASE_20261123.md and
apps/web/WEB_CHAT_LIVE_EVIDENCE_20261123.json. Earlier release_pending notes above
are historical: web dispatch is now enabled in this candidate; native remains stopped.

Release review: https://github.com/lgudip-01/-BuildHybridAI/pull/44 .
Hosted demo: https://clause-guard-hackathon.web.app . Production smoke used only
synthetic Lucia/Example Services/$250/30-day text, with Nano masking, genuine
document/question approval, real cloud response and local detail restoration.
The source citation resolves to the exact approved masked clause.

New teammate work was read at this checkpoint: #41 (42dfdcc) masking progress,
#42 (16b6f00) manual mask/reveal/undo and per-clause source, #43 (a9f8149) document
deletion with storage/approval races. No new discussion comments in these PRs.
Next integration must invalidate chat on manual changes/deletion, clear per-
document choices, preserve source provenance, and port controls into #36 Workbench.
These branches remain unchanged; this release does not claim their acceptance.


## November 23: redesigned controls + chat integration

- [x] Recheck refs/comments and preserve every original branch/check-out.
- [x] Isolate #44 + #36/#33 corrections + #41/#42/#43; port controls into Workbench.
- [x] Preserve real engine authority and revised private chat snapshots/aliases.
- [x] Close chat on manual edits/deletion and discard pending cloud completions.
- [x] Keep manual protections for deletion retry; clear them for the next document.
- [x] 395 web + 163 engine tests, core/engine typechecks and production build pass.
- [x] Real Nano progress/manual reveal/undo/chat-preview check; desktop and actual 430px layout.
- [x] Publish #45 complete source dcb2a3c, exact full-tree match; tag owners.
- [x] Hosting-only deployment, fresh no-billing check, actual production chat/import/citation/undo smoke.
- [ ] Native #40 SDK builds, App Check and physical-device acceptance remain separate.

See apps/web/WEB_CONTROLS_INTEGRATION_20261123.md for provenance, corrections and limits.

Integration review: https://github.com/lgudip-01/-BuildHybridAI/pull/45 .
Deployed runtime/config source 044ad59; root responds HTTP 200 with Cache-Control:
no-cache and existing security headers. Published source matched the complete
tested local tree. Word NDA import produced 10 clauses on the production origin.
A real cloud answer restored manually masked bluebird, Lucia, Example Services,
$250 and 30 days; citation points to the approved masked source. Hosted undo then
removed the conversation and required fresh document approval. One cloud question
was approved for this hosted acceptance; no automatic retries or provider switch.

Next: final release review/adoption against main and extension/mobile surfaces,
then #40 full native SDK/device acceptance. Current web integration is functional,
not waiting for missing chat implementation. Native chat remains disabled.


## November 23: reported lowercase and currency-free number misses

- [x] Reproduce the report; preserve failing regression evidence locally.
- [x] Remove chat's extra capitalization restriction after case-insensitive known-alias matching.
- [x] Retain shared-name ambiguity, word boundaries and explicit document/question approval.
- [x] Mask standalone comma-grouped numeric values without requiring a currency marker.
- [x] Keep bare numbers separate from currency values, restoring their exact entered spelling.
- [x] Verify provider body/history projection excludes Acme and 12,500 (mocked provider).
- [x] 396 web + 173 engine tests, engine typecheck and production build pass.
- [x] Real local Chrome preview: Does acme pay 12,500? becomes Does PARTY_A pay AMOUNT_2, with bracketed tokens.
- [x] Publish #46 on #45; source 7029038 exactly matches the tested runtime tree.
- [x] Verify no billing account and complete Hosting-only deployment.
- [x] Confirm the exact question preview on the hosted production origin after verifying current bundle.

Fix review: https://github.com/lgudip-01/-BuildHybridAI/pull/46 .
Known company variants Acme/acme/ACME/aCmE and lowercase known first names now
mask without relying on new model detections. Comma-grouped values such as
12,500 and 1,234,567.89 are masked in both documents and questions. Ordinary
deadlines/section numbers and embedded identifier fragments remain unchanged.
This is not a claim of detecting every previously unknown lowercase proper noun.
No actual cloud question was approved for this fix verification; real masking
uses ONLY_ON_DEVICE. No payment, billing, API, IAM or App Check changes.
Teammate branch updates 17d1ab0/5cac809 remain preserved for later integration.

Hosted verification completed: `Does acme pay 12,500?` previews as
`Does [PARTY_A] pay [AMOUNT_2]?` before any send. Initial tab loaded the older
index-BEUXnVKD bundle and reproduced the old rejection; a normal refresh loaded
the deployed index-DJtNrnDw bundle and the exact reported case passed. Existing
open tabs need a refresh to load this fix. No cloud question was approved.


## Current roadmap after November 23 repository review

This section supersedes earlier pending-status notes, without deleting their
history. Main is still 65152ce; no main merge or teammate branch rewrite occurred.

### Immediate masking report — completed

- [x] Reproduce plain `12500` as five failing engine regressions before the fix.
- [x] Mask ungrouped standalone values of five or more digits, including `12500.50`.
- [x] Preserve account-rule precedence, ordinary years/deadlines, section decimals,
  identifier boundaries, explicit approval and exact local restoration.
- [x] Extend real-engine/mock-provider history checks to `12500`; no raw value in
  the projected contract/question/history and no question-map writes to the vault.
- [x] 396 web + 179 engine tests, engine typecheck and production build pass.
- [x] Publish/deploy runtime b9d4dfa; freshly confirm no billing account.
- [x] Current production bundle index-Bt36sZKb previews `Does acme pay 12500?` as
  `Does [PARTY_A] pay [AMOUNT_2]?`. No cloud question was approved for verification.

### New evidence: what is already done

- [x] Sai approved both requested panel fixes in #44 at 1a21116. His independent
  rerun passed 513 tests; this is UI/automated acceptance, not new cloud/phone proof.
  https://github.com/lgudip-01/-BuildHybridAI/pull/44#pullrequestreview-6029942434
- [x] Sai approved the combined Workbench controls/source rendering in #45 at
  2252c91, reporting 558 tests. Do not request these same UI fixes again.
  His formal approving review was verified through the reviews API.
- [x] Aarush reports #40/c9acf60 iOS Debug/Release SDK builds, 45 strict Swift
  policy checks, Android debug APK/release Kotlin compile and both WebView stops.
  iOS simulator returned release_pending in 35 ms; Android Pixel 8/API 37 emulator
  returned it in 38 ms, before provider work, with no Firebase config/network.
  https://github.com/lgudip-01/-BuildHybridAI/pull/40#issuecomment-7114221884
  https://github.com/lgudip-01/-BuildHybridAI/pull/40#issuecomment-7114733068
- [x] The original 39 Kotlin/JVM policy checks were already run locally for #40;
  Aarush's note that he did not rerun them does not undo that existing evidence.

### Next work we can do independently, in order

1. **Native source safety reconciliation (Cloud AI + Aarush) — source and #48 SDK rerun COMPLETE; physical-device acceptance pending.** Integrate Aarush's
   5cac809 into an isolated #40-based candidate. It fixes our earlier #35 finding:
   iOS onDevice must return a fixed message and log only the error type, because
   localizedDescription can echo raw contract text. Preserve the registered chat
   methods, native policies, native release stop and JS stop. Verify the merged
   source and relevant policy regressions; request a full SDK rerun only for the
   newly reconciled source, not another run of unchanged c9acf60.
   Checklist: compare both heads; preserve both implementations; no raw error
   detail in logs/rejections; policy/type checks; concrete owner handoff.

2. **Carry latest accessibility/mobile UI corrections into our deployed stack — COMPLETE in #49 and Hosting; owner review pending.**
   #36 now has c10eaab (review/storage wording and reduced-motion auto scrolling),
   05ac38e (nearly opaque Android-safe top bar), and f11094e (focus transfer after
   Try it/How it works). Our #45 already contains softened wording and progress,
   but not the latest focus/nav corrections. Reconcile the remaining changes,
   retaining imports/manual controls/deletion/chat. Test keyboard activation,
   document.activeElement inside the target, subsequent Tab order, reduced motion,
   desktop/phone widths, native scrolling and no approval/provider regressions.
   Sai explicitly asked to carry this into #45 in his #36 review; code is now
   available, while his formal design approval has not yet been refreshed.
   https://github.com/lgudip-01/-BuildHybridAI/pull/36
   https://github.com/lgudip-01/-BuildHybridAI/commit/f11094e

3. **Main-based release adoption and cloud acceptance (Cloud AI + engine owners) — candidate preparation COMPLETE; owner merge and actual-main acceptance pending.**
   Prepare a reviewable exact combination of #31 and the reviewed engine/UI/chat
   stack, including the numeric fixes. Preserve main until coordinated review and
   merge. After the actual main merge, run bounded six-sample cloud checks from
   that exact main tree, then deploy it. Existing branch/deployment successes do
   not satisfy #30's explicitly main-based requirement. Keep source/payload and
   answer-quality failures visible; no paid fallback or unbounded retry loops.

### Work requiring a teammate/device or infrastructure response

4. **Native App Check and physical-device acceptance.** Simulators/emulators and
   SDK builds above are complete for c9acf60. Still open: native Firebase config
   delivery through an owner-approved private channel, real App Attest/Play
   Integrity runtime, real phone/tablet masking/source/payload checks and native
   cloud answers. The published local/mobile-with-redesign branch at fa39214
   combines mobile + latest design + 5cac809; it does not supply #40's chat methods
   or our full #45/#46 engine/UI stack. Inspect/reconcile rather than replacing it.
   Our Mac was freshly rechecked: Command Line Tools, Swift 6.0.3, Java 17; full
   SDK validation remains with Aarush's verified toolchain. Native chat stays
   disabled until current no-cost/App Check/privacy/runtime checks actually pass.

5. **Extension scaffold dependency (Sai/project owner); our role is the cloud
   boundary.** Sai reports his #9/#25 side-panel tasks blocked by the initial
   Manifest V3 package. Main contains no extension manifest/package, and no
   extension branch appeared in the refreshed remote inventory. Ask the project
   owner to assign/link the scaffold. Once present, we verify the shared masked
   dispatcher, explicit approval/history, extension-origin attestation/no-cost
   setup and side-panel integration; do not ask Sai to implement the cloud engine
   again or label the hosted web demo blocked by this separate surface.
   https://github.com/lgudip-01/-BuildHybridAI/issues/30#issuecomment-7114563182

### Ownership/next-action interpretation

- Directly addressed to us: Aarush's #40 results; we acknowledge completed builds
  and reconcile the newer iOS safety fix instead of repeating the old request.
- Shared release responsibility: Sai's #44/#45 approvals and #36 focus request;
  update acceptance status and carry available fixes into the deployment branch.
- Primarily Sai/Aarush: design sign-off, mobile layout/device testing and extension
  scaffold/UI. We supply cloud integration and coordinate dependencies.
- Varun/team: eligibility, demo video/submission and quota-account request in #30.
  Do not request a trial/credit/billing-linked quota account under the zero-cost
  policy. No payment or new external service is authorized by teammate comments.

No credentials/config files were published, no payment/billing/API/IAM/App Check
settings changed, and no real user document was deleted during this work.


## Native error safety reconciliation — completed source step

- [x] Refresh native refs/comments; retain primary checkout and all worktrees.
- [x] Isolated merge of #40/c9acf60 and #35/5cac809; both parent histories retained.
- [x] Only runtime delta from #40: iOS onDevice logs the error type in DEBUG and
  rejects with the fixed message `On-device generation failed.`; provider error
  text is neither interpolated nor passed through this handler.
- [x] Registered Swift/Kotlin chat methods, policies and independent native stops
  remain unchanged. Current shared native JS stop is inspected and retained.
- [x] Executable regression extracts the actual onDevice catch body and captures
  its exact NSLog formatting and reject expression. Two synthetic echoing-error
  types run in release/debug: 4 checks pass, Swift 6 complete strict concurrency.
- [x] Old #40 source fails the rejection regression. A log-only unsafe fixture
  separately checks that the DEBUG log path is detected; failure evidence stays
  local. No real contract, Firebase SDK, provider or Capacitor call is involved.
- [x] 45 Swift policy checks, 39 Kotlin/JVM checks, shared prompt/model/limit parity
  and Swift plugin/helper syntax parsing pass. Safety patch applies cleanly to
  the earlier full native integration; source is preserved for adoption.
- [x] Publish #48 native source/harness/handoff at 77b77ef, matching tested files;
  tag Aarush for full SDK verification on the newly merged revision.
- [x] Full iOS Debug/Release + Android SDK builds on #48/294ca23 were reported
  by Aarush November 24. His 45 Swift + four error-boundary checks also passed.
  This closes that changed-source build gate; physical-device/cloud acceptance
  remains separate. Later Swift changes need their own changed-revision build.

This native-only branch is stacked on #40 and carries the latest execution
tracker from #47 for continuity; it does not replace the deployed web stack.
No Hosting deployment, model calls, Firebase/config/IAM/App Check changes or paid
services. Native chat remains disabled. Next independent task: carry the latest
navigation-focus/reduced-motion/nav corrections into the deployed UI stack.

Native safety integration review: https://github.com/lgudip-01/-BuildHybridAI/pull/48 .
Aarush was asked for a changed-revision SDK build because this is the first
combination of 5cac809 and #40's chat methods. The requested checks and commands
are concrete in NATIVE_CHAT_HANDOFF.md; no new implementation is required from
him for this source fix. Final whole-tree publication verification follows.


## Navigation accessibility adoption — 2026-11-23

- [x] Inspect both original folders, preserve local work, and refresh remote refs and
  owner comments before editing. Isolated candidate starts from #47/cae2985.
- [x] Carry exact scroller/Hero/HowItWorks source from #36/f11094e; apply only the
  reviewed nav opacity and programmatic-heading focus CSS to the integrated styles.
  Keep the #45–#47 import/manual-mask/delete/chat/numeric fixes intact.
- [x] Reproduce the missing behavior first: 4 of 6 focus tests fail on old helper.
  All 6 pass after the fix; all 402 web tests and the production build pass.
- [x] Actual desktop Chrome: Enter on nav Try it focuses the Workbench heading;
  subsequent Tab reaches Import PDF or Word. Nav How it works and hero Try it
  also focus their destination heading. No model question was sent.
- [x] Actual DevTools phone viewport: innerWidth and document scrollWidth both 430.
  With reduced motion emulated before reload, actual hero/nav activation focuses
  the Workbench/How headings. The reduced-motion query is true. Automated tests
  separately verify immediate auto scrolling and next focus order. DevTools
  prevents automated key input in this environment, so phone activation is through
  Chrome's accessibility controls; the keyboard proof above is desktop only.
- [x] Restore the test tab to normal motion, no device emulation, 1512-pixel width.
- [x] Publish the reviewed runtime candidate at 3899456 to a branch stacked on
  #47; fetched web source exactly matches the tested files. #49 tags Sai/Aarush
  for review of the carried #36 corrections. Whole-tree comparison is the final
  publication gate after this tracker upload.
- [x] Fresh Cloud Console check: this project has no linked billing account.
  Official Firebase Spark pricing still requires no payment method. Hosting-only
  deployment completed; hosted script index-_zRnRsvX.js matches the production
  build. Real hosted Enter activation passes for nav Try it/How and hero Try it;
  subsequent Tab reaches Import PDF or Word. No question/model call was sent.

This web branch includes the native tracker for continuity, not #48's native
source changes. Native SDK rerun and physical-device acceptance remain separate.
Next independent roadmap step: prepare the exact main-based release candidate
for coordinated adoption and the subsequent bounded six-sample cloud acceptance.

Navigation adoption review: https://github.com/lgudip-01/-BuildHybridAI/pull/49 .
Verified deployment: https://clause-guard-hackathon.web.app .
Spark pricing checked 2026-11-24: https://firebase.google.com/pricing .
The initial deployment command failed locally because the prior temporary CLI
installation had missing dependencies. Restored the same official firebase-tools
15.37.0 from the local npm cache and completed the deployment; no paid service,
payment information or billing account was created or linked.


## Main-targeted web release candidate — November 24, 2026

- [x] Refresh main/owner refs and discussions; main remains 65152ce.
- [x] Prove #49 already contains main and #31; preserve the tested runtime tree
  instead of replacing corrected engine/import/Workbench files with older heads.
- [x] Create isolated codex/main-release-candidate-20261124 from 8d28c4e.
- [x] 402 web + 179 engine tests, all three workspace typechecks, nine isolated
  Firebase checks and production build pass. Entry script exactly matches the
  existing deployed build. No fresh live/browser/model check is claimed here.
- [x] Document source provenance, retained fixes, exact checks and owner adoption
  order in RELEASE_CANDIDATE_20261124.md. No native runtime source is included.
- [x] Publish the main-targeted candidate as draft #50, base main. Fetched
  403c8f3 matches the complete checked local tree; Likhil and Sai are tagged for
  coordinated source/navigation adoption review. The final tracker-only upload
  is verified again before finishing.
- [ ] Coordinated owner review/merge. No agent merge of main.
- [ ] Actual merged-main six-sample cloud acceptance and Hosting verification,
  after refreshed no-cost/billing/App Check prerequisites. Historical branch
  evidence does not satisfy this gate.

The independent preparation step is complete and published. Subsequent main
acceptance depends on coordinated source adoption. No action is needed from the
user for candidate preparation. Native #48 SDK/physical-device and extension
scaffold dependencies remain tracked separately.

Consolidated main adoption PR: https://github.com/lgudip-01/-BuildHybridAI/pull/50 .
This is a reviewable web candidate, not a main merge or mobile release. The
complete earlier stacked history is preserved; no local/remote ref was reset.


## Release documentation alignment — November 24, 2026

- [x] Refresh #50/#48/owner discussions and main: no new review/merge; actual-main
  cloud acceptance remains gated. Local full Xcode/Android SDK are still absent.
- [x] Independently inspect README, HACKATHON, Firebase setup, current entry paths
  and existing release evidence without additional inference/deployment.
- [x] Correct README privacy absolutes, native/extension availability, Remote
  Config status and missing hosted demo instructions. Link the exact candidate.
- [x] Replace the November 17 implementation table that called analyze a stub,
  App Check absent and Hosting unstarted; retain unverified submission gates.
- [x] Recheck the official deadline; retain the older rules summary as historical
  rather than claiming a complete new eligibility/legal review.
- [x] Make setup preserve existing env files and require fresh no-cost/billing
  verification before model calls; do not encourage unnecessary inference reruns.
- [x] Check all 17 local Markdown link destinations; compare claims with current
  source, official deadline and recorded evidence. All four changed files are
  Markdown only; no runtime tests need repeating for this documentation change.
- [x] Publish the reviewed docs as ready-for-review #51, stacked on #50.
  Fetched a55c0f0 exactly matches the reviewed local tree; final tracker-only
  publication is checked again before finishing.

This is independent documentation work while main adoption awaits owner review.
No runtime, dependency, environment, deployment or cloud/security setting change.
Next gated Cloud AI task remains the six-sample run on actual merged main.

Documentation review: https://github.com/lgudip-01/-BuildHybridAI/pull/51 .
Project owner tagged for coordinated adoption. No duplicate owner request or
new cloud run is needed; #50 main merge and #48 SDK/device gates remain pending.


## Formal release review handoff — November 24, 2026

- [x] Refresh main, #48/#49/#50/#51 and owner comments: no new review or merge.
- [x] Compare the unchanged #50 tree with its tested local candidate; existing
  402 web/179 engine, nine Firebase, typecheck/build evidence still applies.
  No repeated model run or test matrix is justified by a metadata-only handoff.
- [x] Mark #50 ready for review after its candidate checks passed. This changes
  review status only; no source, branch protection, permissions or main merge.
- [x] GitHub confirms formal reviewer requests to lgudip-01 for engine/cloud and
  saikamsani30 for UI/navigation. Earlier tags alone were not formal requests.
- [x] Correct #50 description and candidate notes: owner review/merge remains
  pending, but the source candidate no longer needs to be held as draft.
- [x] Publish updated notes in #51; fetched 0dea7e4 matches the full local
  documentation tree. Only Markdown differs from #50; the final tracker-only
  checkpoint is compared again before finishing.

The GitHub connector still rejects write access, so the authorized signed-in
GitHub page completed the handoff. No security access was broadened to fix it.
The next functional gate is owner review/coordinated merge, followed by exact-main
six-sample cloud/content/restoration acceptance after fresh no-cost and App Check
checks. Native #48 combined SDK and physical-device gates remain separate.
No user action is required for this handoff. No inference/deployment or charges.


## Independent native analysis parity — November 24, 2026

- [x] Identify useful source work while #50 review/main acceptance is pending.
- [x] Compare #48 adapter with #50 shared policy and preserve both source trees.
- [x] Reproduce six missing bounded-policy/provenance checks on the old adapter.
- [x] Correct the isolated adapter without wiring NativeBridge or enabling chat.
- [x] 25 targeted checks, full 427 web tests, all three workspace typechecks and
  production build pass; genuine engine authority/remask behavior is exercised.
- [x] All 63 production output files remain byte-identical to #50's build.
- [x] Record precise source provenance, adoption order and runtime/SDK limits in
  apps/web/NATIVE_ANALYSIS_PARITY_20261124.md. No engine or native SDK source changed.
- [x] Publish source/tests/handoff as ready-for-review #52 and formally request
  Aarush review. Fetched ee68e8d matches the four tested source/handoff files.
  Final whole-tree publication verification follows this tracker upload.

Next independent source task: tighten/review the iOS native analysis execution-
source confirmation against the already stricter native chat policy. This can
be prepared with local source/fixtures while owner SDK/physical-device gates
remain pending. Native release stays disabled; #50 review and actual-main cloud
acceptance are not advanced by mocked native responses. No charges/model calls.

Native adapter review: https://github.com/lgudip-01/-BuildHybridAI/pull/52 .
No native release or additional SDK/model run is claimed by this source candidate.


## PR #54 model coverage review — November 24, 2026

- [x] Inspect exact #54 head 0e41aae, its empty comment timeline and nine-file diff.
- [x] Preserve opaque top bar/native theme listener and all teammate branches.
- [x] Reproduce misleading zero/unknown coverage wording with two failing checks.
- [x] Correct wording and clarify the optional field without changing its shape
  or any production engine/approval/native/provider behavior.
- [x] Verify later-chunk failure and unusable output yield zero complete reads;
  manual edits retain coverage and invalidate old approval.
- [x] 438 web + 185 engine tests, three typechecks and production build pass.
- [x] Chrome synthetic Workbench zero and 1-of-4 flows pass at 430px with no
  horizontal overflow. No SDK/provider calls; QA files/server cleaned up.
- [x] Publish ready-for-review #56 above #54; request Aarush review and deliver
  findings on #54. Fetched 0161ea6 matches all six source/test/review-note files;
  final complete-tree verification follows this tracker upload.

#53 owner SDK builds are complete. Aarush approved exact #55/fb0d85a: config
receipt confirmed, configured iOS Debug/Release builds and exact bundled-copy
checks pass, missing-source rebuild removes stale output; target script sandbox
is NO. Android emulator built-in-sample cloud review is owner-reported complete
(4/4 validated clauses, restored values, debug App Check), per #17/#48. This is
not real-device/Nano/Play Integrity evidence or exact-main acceptance. #50 owner
merge, iOS runtime App Check/cloud proof, #54 Likhil shared-type review, and
physical-device attestation remain separate. No deployment or payment. See apps/web/MODEL_COVERAGE_REVIEW_20261124.md.

Next priority: suppress Capacitor Debug bridge logging before testing raw text
on model-capable phones. Aarush found masked prompts/replies in emulator logcat;
on-device calls would cross the same bridge with raw text. Prepare and verify
loggingBehavior=none locally, then request native log verification. Afterward,
reconcile this #54-based UI/core stack with #53/#55 in an isolated candidate.
Preserve owner branches; publication is not native release authorization.

Review follow-up: https://github.com/lgudip-01/-BuildHybridAI/pull/56 .
Packaging evidence: https://github.com/lgudip-01/-BuildHybridAI/pull/55#pullrequestreview-6046758729 .
Android evidence: https://github.com/lgudip-01/-BuildHybridAI/pull/48#issuecomment-7143275410 .


## Aarush review/build reconciliation and iOS source guard — November 24

- [x] Verify Aarush's formal #52 approval and reported 606 tests/typecheck/build.
  Credit his empty/whitespace-reply check; its wording nit is nonblocking.
- [x] Credit #48/294ca23 iOS Debug/Release, Android debug APK/release compile,
  45 Swift policy and four error-boundary checks. Existing WebView stop and
  local Kotlin policy results remain credited; no unchanged rerun requested.
- [x] Reproduce iOS analysis accepting blank/unknown cloud model versions.
- [x] Tighten analysis source confirmation and strict end-of-input matching;
  retain fixed model, providers, native chat stop and both platform histories.
- [x] 24 actual-source-guard checks and 47 Swift policy checks pass; old source
  and old matcher negative controls fail. Contract parity and Swift parse pass.
- [x] Document exact source/build evidence and the remaining iOS-only SDK check
  in apps/mobile/plugins/clause-guard-ai/NATIVE_CHAT_HANDOFF.md.
- [x] Publish the source/test/handoff follow-up as #53, stacked on #48, and
  formally request Aarush review of the changed iOS revision. Fetched 813d413
  matches all six native source/test/handoff files; final whole-tree verification
  follows this tracker upload.

The next native build gate targets this new Swift source, not the completed
#48 baseline. Android is unchanged. Physical devices, runtime attestation, native
cloud answers and approved private config delivery remain open. No main merge,
provider call, deployment, payment, billing or security setting change occurred.

New iOS source-confirmation review: https://github.com/lgudip-01/-BuildHybridAI/pull/53 .
Aarush’s #48 builds and #52 approval remain credited; no extra Android build or
unchanged release-stop check is requested. Full native release remains gated.


## iOS config bundling — November 24, 2026

- [x] Verify Aarush's #53 approval, 47/24/4 checks, and Debug/Release SDK builds.
  That Swift build gate is now complete; actual source/device/cloud proof is open.
- [x] Inspect #35/0ec857d and carry its exact Xcode project change into an isolated
  #53-based branch; preserve author/provenance and all existing worktrees.
- [x] Execute the actual build-phase script in a synthetic build tree: eight
  config copy/missing/stale/path/failure/privacy checks pass; old project fails.
- [x] Validate project syntax and verify config identifiers locally without
  printing values. No real config is copied into source or published.
- [x] Record Dhruv's confirmation that he sent both files privately; receipt
  remains unconfirmed. No email action was taken.
- [x] Inspect new #54 phone UI/model-status work; preserve it for separate shared
  core/UI review after this packaging step. Do not overwrite it with native code.
- [x] Publish source/test/handoff as ready-for-review #55, stacked on #53, and
  formally request Aarush review. Fetched f052e32 matches all three native files;
  the complete-tree verification follows this final tracker upload.

Next packaging gate: Aarush confirms receipt and checks a configured iOS build
product on the combined revision. No cloud requests until current no-cost/App
Check checks pass. Next independent source review: #54's model-read provenance,
shared optional field and status/bar changes. #50 owner merge and actual-main
cloud acceptance, real phones and native attestation remain separate.

Bundling review: https://github.com/lgudip-01/-BuildHybridAI/pull/55 .
No main merge or configured SDK build is claimed by publication.


## Aarush tags and iOS fenced-output fix — November 24, 2026

- [x] Inspect new #17/#48 comments, #56/#57 formal approvals, and latest #54 head.
- [x] Credit #56 approval/merge into #54 and #57 native Debug logging verification;
  preserve #54/e693389 empty-preview correction. Final #56 negative control is
  three failing tests after the full-read wording change, not only the first two.
- [x] Prioritize iOS cloud JSON mode: Likhil prefers a strict parser; Aarush verified
  the public options API and local 4/4 validated/restored precursor on the simulator.
- [x] Add the same cloud-only JSON MIME options to isolated #55-based native code;
  retain Apple defaults, model-source guard, shared strict parser and chat stops.
- [x] Carry approved #57 logging config unchanged; real private configs untouched.
- [x] Five actual-snippet dispatch checks, 24 source guards, Swift parse and 137
  analysis/adapter tests pass; old method fails the new options harness.
- [x] Publish ready-for-review #58 above #55 and formally request Aarush review.
  Reply on #17 with the fix, credited results and bounded SDK build request.
  Fetched 3189bdd matches all four native source/test/handoff files; complete-tree
  verification follows this final tracker upload. No new inference requested.

Existing iOS App Check/cloud transport and 4/4 local precursor restoration are
owner-reported complete; this is not six-sample or final-revision acceptance.
#57 Debug native log gate is complete on Aarush's combined local branch. No model
call/deployment/payment in this task. Next independent step: combine latest #54,
logging fix and this #55-based native fix in an isolated reviewable candidate.

JSON output follow-up: https://github.com/lgudip-01/-BuildHybridAI/pull/58 .


## Combined UI/native candidate — November 24, 2026

- [x] Inspect latest remote branches/reviews; #58 has no owner SDK result yet.
- [x] Combine #54/e693389 and #58/e7e0d14 in an isolated branch preserving both
  histories. Resolve adapter conflicts to approved #54; retain both tracker histories.
- [x] Restore exact #57 logging harness/handoff and retain logging-off config.
- [x] Byte-compare native trees to #58 and Workbench/core/engine to #54: unchanged.
- [x] 442 web +185 engine tests, three typechecks/build, 47 Swift policies,
  24 source guards, five JSON-option cases, four error-boundary and eight plist
  checks pass. Three actual NativeBridge regressions verify masking/approval/validation.
- [x] Real production-asset cap copy ios/android passes; seven logging/config
  groups and shared prompt/model/limit parity pass. No SDK/model/provider call.
- [x] Publish combined histories via candidate-only #59 and ready-for-review #60.
  Both #54/e693389 and #58/e7e0d14 are verified ancestors of the remote candidate.
  Fetched 92ae0a7 matches all files except this final preserved-union tracker;
  complete-tree verification follows its upload. Main and teammate refs untouched.
- [x] Formally request Aarush review on #60 and one exact combined SDK build
  covering integration and #58 together. No repeat inference requested.

#56/#57 approvals, #55 configured packaging, Likhil shared count approval and
emulator/precursor sample evidence remain credited. Native chat remains stopped.
Next gate: owner combined SDK build; then physical-device/attestation, bounded
no-cost acceptance, coordinated main merge and hosted/main validation. Real config
files, all original branches and working folders remain preserved.

Combined candidate review: https://github.com/lgudip-01/-BuildHybridAI/pull/60 .
Candidate-only history merge: https://github.com/lgudip-01/-BuildHybridAI/pull/59 .


## Independent six-sample native preflight — November 25, 2026

- [x] Check #60/#58 reviews, #54 and #17: no combined SDK result/new tag yet.
- [x] Preserve #60/47e08be; add only offline tests and evidence in isolated follow-up.
- [x] Exercise genuine NativeBridge/masking/vault/approval/validation/restoration
  and deletion on six public samples with synthetic cloud/device metadata.
- [x] 12 cases pass: 70 required strings masked, 35 required terms retained per
  source; no provider/model calls. Deletion invalidates old native approval.
- [x] 454 web tests, web typecheck and build pass; all 63 output files byte-identical
  to #60. Prior engine/native results credited without duplicate SDK checks.
- [x] Publish ready-for-review #61 above #60. Fetched b3dd290 matches both test
  and evidence files; final complete-tree verification follows this tracker upload.

See apps/mobile/NATIVE_SAMPLE_PREFLIGHT_20261125.md. SDK/device/cloud/main gates
remain open and are not satisfied by synthetic responses. #60 remains the one
combined SDK target; this test-only change does not require another native build.

Offline sample review: https://github.com/lgudip-01/-BuildHybridAI/pull/61 .


## Consolidated acceptance packet and count correction — November 25, 2026

- [x] Recheck #60/#58/#61/#50 comments/metadata: no new owner result.
- [x] Verify exact SHAs, owners, sync script, Android alias and fixture totals.
- [x] Correct documentation arithmetic: actual mask list totals 70, not 80;
  retained terms total 35. Tests used each real fixture list and remain valid.
- [x] Consolidate completed evidence and pending SDK/device/inference/main/Hosting
  gates in RELEASE_GATES_20261125.md with commands and sanitized evidence template.
- [x] Keep #60 as one SDK target; no duplicate build/model request or production edit.
- [x] Correct #61 description and sample note; publish the consolidated packet
  in that existing PR. Final complete-tree verification follows this tracker upload.

SDK result remains pending; main is still 65152ce. This documentation does not
advance acceptance, enable native chat, perform inference or authorize billing.

Current acceptance packet: RELEASE_GATES_20261125.md.


## Combined native SDK and sample gates completed — November 25, 2026

- [x] Verify Aarush's #60/#58 approvals on exact 47e08be and preserved source ancestry.
- [x] Credit clean 627-test run, sync, configured iOS Debug/Release and Android
  Debug/Release builds. #58's changed-Swift build gate is complete through #60.
- [x] Credit exact-revision built-in sample: both platforms 4/4 validated cloud
  reviews, restored values and clean payload logs with patterns-only review.
- [x] Update the acceptance packet with linked SDK/runtime evidence and remaining gates.
- [x] Check local readiness: full Xcode/Android Studio absent; Apple listing verifies
  Xcode free and free-account device testing. Start the existing App Store flow.
- [ ] Install full Xcode: two free Get attempts stalled on a blank App Store sheet.
  Product page left open; user asked to complete authentication/agreement if shown.
  Download/installation has not started; physical iPhone installation remains blocked.
- [x] Publish corrected gate state in existing #61 and hand off remaining owner/main/device
  work. Final remote complete-tree verification follows these documentation uploads.

Next native gate: physical iPhone/local-model behavior and release attestation;
Android tablet details remain pending. Six-sample content and actual-main/Hosting
acceptance stay open; native chat remains stopped. No new model/deployment call.


## Local iPhone build readiness — November 25, 2026

- [x] Verify full Xcode 27.2 (27B52), selected Developer directory and iOS 27.2 SDKs.
- [x] User reviewed/accepted the first-launch SDK agreement; first-launch check passes.
- [x] Refresh main/combined/follow-up refs without merging. Main remains 65152ce;
  combined remains 47e08be. Clean local tree matched published #61/9825b0e before
  this documentation update; production source still matches approved combined.
- [x] Web production build/typecheck and iOS Capacitor sync passed; logging none.
- [x] Place existing Firebase plist only at its ignored local build path; confirm
  expected app/project identity without disclosing configuration.
- [x] Build unsigned Debug for generic physical iOS using the pinned resolved
  dependencies: BUILD SUCCEEDED. Firebase 12.19.3, Capacitor 8.6.2, App Check 11.3.2.
- [x] Confirm built app includes the byte-identical local plist, app.clauseguard
  bundle ID and generated logging none. No tracked source/lockfile changes.
- [x] Check device readiness: no devices found by unrestricted CoreDevice check.
  Initial sandboxed discovery timed out; that was a local service access issue.
- [ ] Physical phone connection/pairing: explicitly deferred by user until later.
- [ ] Free Personal Team signing, device installation and runtime/local-model evidence.

Local build command: `xcodebuild -project apps/mobile/ios/App/App.xcodeproj
-scheme App -configuration Debug -destination 'generic/platform=iOS'
-derivedDataPath /private/tmp/clauseguard-iphone-build-20261125
-onlyUsePackageVersionsFromResolvedFile CODE_SIGNING_ALLOWED=NO build`.

Local output: /private/tmp/clauseguard-iphone-build-20261125/Build/Products/Debug-iphoneos/App.app .
This unsigned artifact is build evidence, not an installable signed release.
Local build log: /private/tmp/clauseguard-iphone-build-20261125.log . No app launch,
new provider/model request, deployment, paid enrollment or billing change.
Only the current readiness packet and tracker are updated for publication in #61.
Next: connect/unlock/trust the iPhone when the user is available, inspect actual
OS/developer mode, then configure free personal signing without weakening App Check.
Earlier installation-pending notes above are historical and superseded here.


## Physical iPhone installation — November 25, 2026

- [x] Verify paired physical iPhone 16 Pro Max on actual iOS 27.2.1.
- [x] User enabled Developer Mode; CoreDevice independently confirms Enabled.
- [x] User signed in to Xcode; verify free Personal Team, no paid membership.
- [x] User explicitly approved development certificate/key/app ID/profile creation.
- [x] Assign local Personal Team; user completed protected Keychain prompts.
  Repeated prompts corresponded to separately signed components, then the app;
  the build advanced and finished without a password reset or security bypass.
- [x] Signed Debug build for the connected iPhone: BUILD SUCCEEDED.
- [x] Deep strict signature verification passes; private plist matches source;
  expected bundle ID and generated logging none retained.
- [x] Install via CoreDevice and independently query only app.clauseguard:
  Clause Guard version 1.0, build 1 is installed.
- [x] Embedded development profile includes this device and expires December 2,
  2026 at 20:12:44 UTC (3:12:44 PM Eastern). Rebuild/reinstall after expiry.
- [ ] Launch/runtime, Apple local-model availability and sample acceptance.
- [ ] Release attestation, native chat and actual-main/hosted acceptance.

Production source remains approved combined #60/47e08be. Existing #61/171bfcf
was the published baseline. Xcode added two DEVELOPMENT_TEAM lines to the local
project; preserve these uncommitted for this user's signing, and exclude them
from publication. No shared app identity, dependencies or runtime source changed.
Private configuration, provisioning profiles and signing keys are never uploaded.
Signed output: /private/tmp/clauseguard-iphone-build-20261125/Build/Products/Debug-iphoneos/App.app .
Log: /private/tmp/clauseguard-iphone-signed-build-20261125.log .
The unsigned output at this same path was replaced by this successful signed build.
No app launch, provider/model request, deployment, paid membership or billing change.
Next: verify current no-cost/account/App Check readiness before runtime/provider
activity, then inspect local-model status and exercise a bounded fictional sample
with explicit preview review. Installation alone does not establish runtime,
App Attest, model availability, semantic quality or native chat acceptance.


## First physical iPhone local-model masking result — November 25, 2026

- [x] Recheck installed app identity; current Console shows Spark, no linked
  billing account, AI Logic App Check enforced. No billing/service change.
- [x] Inspect native startup: native bridge, local Foundation Models for raw text;
  masking does not dispatch an approved cloud analysis. Apple documents on-device
  inference as no-cost; no cloud/private-cloud provider was selected for masking.
- [x] Preserve first launch failure: iOS rejected launch with a signing/trust
  security error. User then trusted their development profile; CoreDevice launch
  succeeded and the expected installed app process remained running.
- [x] User observed Apple Intelligence ready on the physical iPhone.
- [x] One unchanged built-in fictional Acme/Dana sample masking run, user observed:
  Apple Intelligence still ready; 10 values replaced; 7,776 ms; all 4 clauses read;
  all sensitive sample values masked correctly in the visible preview.
- [x] Stop at preview; no Approve & analyze action or cloud inference requested.
- [ ] Extend coverage to public six-contract fixtures with exact mask/keep checks.
- [ ] Confirm partial/unavailable/offline behavior on the physical phone.
- [ ] Release attestation, native chat and actual-main/Hosting acceptance.

Evidence distinction: launch/process/configuration checks are tool-verified.
Status, latency, 4/4 coverage, count and visual masking are reported by Dhruv from
the phone screen, not an automated capture or instrumented payload audit. This
is the first real-phone local-model result, separate from Aarush's emulator/
simulator cloud sample and #61's synthetic six-sample tests. One sample does not
establish general masking recall, clause classification or legal/content quality.
Production source remains #60/47e08be; same signed app.clauseguard 1.0/build 1 as
the prior installation (published baseline #61/171bfcf; later changes docs only).
Native release attestation is still shown unregistered in Console; enforcement
remains on. No new token registration, cloud analysis, deployment or paid change.
Next: prepare one public fixture at a time for local-only phone scoring, preserving
observed misses/retained-term losses; no automatic inference retry or cloud send.


## Prepared six-fixture physical-phone masking protocol — November 25, 2026

- [x] Use actual splitter and current JSON fixtures; validate every expected
  mask/keep string appears in source before deriving the checklist.
- [x] Verify 60 total clauses, 70 required mask-string checks and 35 keep checks;
  per-sample clauses are 10/10/10/11/9/10. Replacement counts are not mask totals.
- [x] Prepare reports/PHONE_LOCAL_MASKING_20261125.md with exact source hashes,
  source links, checklist and first-result reporting template. No model run.
- [ ] Run unchanged NDA text on the physical phone, then remaining fixtures.

The built-in four-clause smoke result is separate from all six pending fixtures.
Stop at local preview; retain partial/failure observations, no automatic retry.


## NDA physical-phone score and mirroring setup — November 25, 2026

- [x] User explicitly authorized iPhone Mirroring for Clause Guard and test files,
  completed Apple setup/authentication; notification forwarding declined and
  future sessions set to Ask Every Time.
- [x] Prepare exact six-fixture protocol; existing source samples match #60.
- [x] Reject malformed automation transfers BEFORE inference (wrong clause count);
  transfer exact source via TextEdit Copy, focused mirrored field and Paste.
- [x] NDA: one local run after confirming 10 input clauses; 8 replacements,
  21,006 ms; visually score mask 9/9 and keep 5/5 across complete c1–c10 preview.
- [x] Preserve two classification disagreements: c2 and c7 confidentiality vs
  expected other and liability/other respectively. No prompt/fixture change.
- [x] Leave cloud approval unpressed; keep private config/signing out of uploads.
- [ ] Owner review of the two NDA classification expectations.
- [ ] Finish freelance local run and remaining four fixture scores.

No app source/dependency changes or new cloud model calls. Current native result
comes from the same signed app installed earlier. Coverage inference/limitations
and exact checklists are in reports/PHONE_LOCAL_MASKING_20261125.md.


## Physical masking matrix checkpoint and liveness priority — November 25, 2026

- [x] Complete first local-only runs for NDA/freelance/lease/offer/note: 50 clauses,
  62/62 required mask checks and 27/27 keep checks pass by direct mirrored UI review.
- [x] Preserve 7 classification disagreements (43/50 fixture labels match).
- [x] SaaS input verified 10 clauses and model ready; first actual run stalls at
  reading clause 2 with no completed preview. Keep remaining 8 mask/8 keep unscored.
- [x] Record all timings, review states, additional redactions and limitations in
  reports/PHONE_LOCAL_MASKING_20261125.md; save screenshots locally.
- [ ] Fix unbounded native raw-read wait, prove with a never-settling-plugin test,
  then perform one separately recorded candidate recovery check.
- [ ] Resolve classification findings with engine/native owners; no fixture edits.

Next priority changed from more model scoring to local-read liveness. Original
failed SaaS evidence must remain; no automatic model retry or cloud approval.
Private/local signing project changes are preserved and excluded from publishing.


## Native local-read deadline candidate — November 27, 2026

- [x] Inspect latest #17/#60/#61 comments and refreshed remote refs; Aarush's
  #17 cancellation review confirms JS must enforce the caller limit. No owner
  code change accompanied that review. Preserve the five phone passes and SaaS stall.
- [x] Add a 30-second deadline per NativeBridge.onDevice call and a shared raw-read
  fence retained until actual native settlement, including after caller timeout.
- [x] Stop further model reads in the affected masking batch after timeout/busy;
  late native completion cannot resume that batch or mutate its finished preview.
- [x] Seven regressions cover never-settling, late, overlap, status race, normal,
  rejected/malformed/synchronous failure, and actual engine review-required fallback.
- [x] Original bridge fails deadline regression; original engine fails late-answer
  batch regression. Fixed source: 461 web + 185 engine tests (646), core/engine/web
  typechecks, production build and diff whitespace check pass. Existing bundle-size
  advisory remains. Fake timers leave IndexedDB's setImmediate real.
- [x] Publish source/tests to the separate candidate branch; fetched 054c222
  matches all three tested code files. Final complete-tree verification is recorded
  in the pull request after this documentation batch.
- [ ] Aarush/Likhil review; targeted separately recorded physical-iPhone SaaS
  recovery check after current readiness/no-cost checks. No automatic rerun.

This bounds the JS caller, not Foundation Models execution or cancellation. A
never-settling native read remains fenced; status reports unavailable and patterns
remain available. No Swift/Kotlin, dependencies, private config or personal signing
changes. Approval, leak checks, analysis validation and native chat gates remain.

Main adoption update: owner merged #50 on November 26; origin/main is now
1ac26a957587ab214d76b7613096bb3935d0f3a2. Its complete tree matches the previously
prepared accdd41 candidate. The old pending-#50 statements above are historical.
Actual-main six-sample content and Hosting acceptance (#30) are now independent
next work after current no-cost/App Check readiness verification. #60/#61 native
adoption remains separate; this candidate stays stacked on #61/5f340f7.
No new cloud/model call, deployment, billing, API, IAM or attestation change.
