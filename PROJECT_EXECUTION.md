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
