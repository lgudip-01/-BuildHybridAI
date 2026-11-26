# Approved-batch analysis integration

Related: issues #5, #7, #8, and Firebase setup PR #6.

## Current status

Update: engine d7af3b4 is now integrated. approvalGuard.ts uses a direct package
import, and all nine real-engine integration cases run and pass (cloud SDK mocked).
The pending-engine descriptions below are retained as historical context and are
superseded by ENGINE_INTEGRATION_CHECKS.md, which contains current status and the
review-before-send six-sample helper. Remote Config is implemented and the project
owner verified its published values in Chrome. Live cloud/offline checks remain.

`WebBridge.analyze(batch)` is implemented against the approved-batch proposal.
The real privacy-engine `approval.ts` is still pending in issue #8. Until that
file exists, `approvalGuard.ts` throws `approval_unavailable` before any analysis
SDK/model request. Do not replace it with a cast, a hand-built batch, or a dummy
guard. Test mocks exercise orchestration only; they do not prove engine approval.

The small Vite eager glob in `approvalGuard.ts` lets this branch build while
that engine file is absent. When the file lands at
`packages/privacy-engine/src/approval.ts`, restart Vite/rebuild: the adapter will
use its real `assertApproved()` and module-level identity registry. Eventually
replace the optional glob with a direct package import once the dependency is
merged. The fallback is always an error, never permission to send.

`ApprovedBatch`, `AnalyzeResult`, and `ClauseFailure` are exported from
`@clause-guard/core/types`. The existing `MaskResult` is deliberately left for
Likhil's engine implementation to update with `docId` in both result variants.
No approval implementation is duplicated in the Cloud AI branch.

## Web teammate call order

After Likhil's real engine is integrated:

```ts
import { mask } from '@clause-guard/privacy-engine/mask';
import { approve, assertApproved } from '@clause-guard/privacy-engine/approval';
import { unmask } from '@clause-guard/privacy-engine/unmask';

// One stable docId per opened document. Serialize masking/unmasking operations
// and discard the displayed result immediately when input changes.
const masked = await mask(docId, clauses, bridge);
if (!masked.ok) return showLeaks(masked.leaks);
if (masked.needsReview && !(await userApproves(masked))) return;
const batch = approve(masked, { reviewed: masked.needsReview });
const answer = await bridge.analyze(batch);
assertApproved(batch);
const restored = await unmask(answer.docId, answer.results);
assertApproved(batch);
showResults(restored, answer.failed, answer.ranOn);
```

The UI must not reuse an old batch after edits or display/unmask an answer
against another document. Freeze/identity checks do not replace UI revision
handling. Unknown placeholders and other failed clauses are excluded from
`results`; do not unmask or display a failure as a successful review.

## Prompts and schemas for mobile

`@clause-guard/core/analysis` exports `ANALYSIS_VERSION`, `ANALYSIS_MODEL`,
`ANALYSIS_JSON_SCHEMA`, `CLOUD_ANALYSIS_PROMPT`, `DEVICE_ANALYSIS_PROMPT`, and
`validateAnalysis()`. These are shared source defaults; Remote Config publishing
is a separate task. The web SDK uses its `Schema` factory for cloud generation
and the JSON Schema for Chrome response constraints.

Raw masking/classification stays in `ONLY_ON_DEVICE`. For masked analysis,
the first responding clause uses `PREFER_IN_CLOUD`; subsequent clauses are pinned
to that actual source so one batch-level badge cannot conceal mixed execution.
The local model gets the shorter preliminary red-flags system prompt. App Check
is attached by the Firebase SDK initialized in PR #6; server enforcement remains
required. No separate preflight token exchange prevents offline fallback.

Only clause id, optional type, and masked text are projected into generation
requests. The analyzer never imports the vault or sends docId, ledger, or raw
contract input. Each isolated request's prompt and response allowlist contains
only placeholders present in that supplied clause, including alphabetic party
labels. A token approved elsewhere in the batch cannot be introduced here.
All response fields are checked; an invented or out-of-clause bracketed placeholder
fails the clause. Known placeholders rewritten as unbracketed "Party A" also
fail response validation. No claim is made that this detects every possible
semantic rewrite or every sensitive detail a masking model could miss.

## Errors and source badge

- Approval errors propagate unchanged; stale approval aborts the batch and stops
  subsequent sends. An already dispatched request cannot be recalled.
- `unknown_placeholder`, `invalid_response`, and `model_error` appear in `failed`
  with fixed/sanitized details. Successful clauses still return.
- Empty, duplicate-ID, or oversized batches reject before model calls: 1–40
  clauses, at most 6000 characters per clause and 60000 total.
- If no response ever confirms an execution source, `AnalysisUnavailableError`
  rejects the batch with `.code === 'analysis_unavailable'`, `.docId`, and a
  sanitized `.failed` list. There is no fabricated cloud/device badge.
- Cloud requests use a 30-second SDK request timeout. Local session creation
  has a 60-second signal. The installed SDK does not expose a prompt-abort
  signal in `LanguageModelPromptOptions`; local generation duration still needs
  real-device testing. There are no automatic application-level retries.

## Native teammate

`NativeBridge.analyze()` now checks approval and fails closed instead of calling
the old clauses-only plugin signature. Aarush must implement the new native
`{docId, clauses}` -> `AnalyzeResult` protocol, keep the JS approval checks,
validate the response and source, and replace this temporary explicit error.
Do not restore the old array-only cloud path. Other native methods are unchanged.

## Validation and remaining live checks

From the root:

```sh
npm run test:analysis --workspace @clause-guard/web
npm run test:firebase --workspace @clause-guard/web
npm run build --workspace @clause-guard/web
npm test
```

Analyzer unit tests mock the model and approval registry. The guard test
verifies that handcrafted batches are rejected with or without the real engine.
After issue #8 lands, add real approved, copied, and stale batch integration tests.

Still required before closing #7: six sample contracts through the real
mask -> approve -> cloud analyze -> unmask path, plus real offline Nano fallback
and a Network request audit. A passing mock suite/build is not evidence for
these checks. Each teammate needs their own registered App Check development
token. Never upload real contract values or tokens into an issue or test log.

## Real engine integration gate (issue #8)

Run `npm run test:engine-integration --workspace @clause-guard/web` after the
engine implementation is published. The runner currently exits **2 (BLOCKED)**
with an explicit missing-dependency message; it never reports a passing suite
when approval.ts is absent. Running the test file directly through Vitest
shows nine explicit skips in that case.

The prepared suite imports the real mask(), approve(), assertApproved(), vault,
and unmask() code. It mocks only the cloud SDK, uses pattern-only local masking,
and exercises a synthetic fixture: a full roundtrip, missing review, forged or
copied objects, post-mask mutation, needsReview tampering, remasking, invalidation
before the first await, and invalidation during a cloud request. It does not
verify Gemini/Nano execution, real cloud responses, or an outgoing-request audit.

No production approval code or bypass is supplied by this test harness. Until
the actual engine lands and this gate passes, Step 1 remains blocked.


## Retired bounded simple lease-term format (historical)

`sourceQuotedLeaseTermReview()` recognizes only the simple masked date form
`2. Term. The lease starts on [DATE_1] and ends on [DATE_2].` (number optional).
It returns a visibly labeled application-authored source quote and review context.
`LEASE_TERM_REVIEW_QUESTIONS` supplies the two allowed questions;
`validateSourceQuotedLeaseTermReview()` requires that explanation, empty draft,
and only those questions. The model still selects a preliminary risk priority.
The web cloud/device schemas enforce the explanation/question choices; normal
JSON/token/grounding checks run first. Provider noncompliance fails visibly and
is never silently replaced. Other wording, added duties/qualifiers or unmasked
dates stay on the normal guarded path. This bounded format does not verify date
chronology, legal meaning, the full agreement, or the correctness of a risk rating.
Native adapters need equivalent schema/validation wiring before claiming support.


## Source-first analysis policy v2

The generic risk-topic checklist in v1 could be echoed even when a clause did
not establish those topics. v2 asks for the clause's actual function, operative
duties/conditions, supported concerns and material questions. It explicitly
forbids narrating a risk checklist, including negative claims about absent risks.
It applies to every contract clause; no new sample-specific template was added.
The existing bounded date/guarantee formats and all runtime guards remain intact.

The version change intentionally retires v1 Remote Config prompts instead of
appending contradictory instructions. The current application defaults are used
for a v1 payload, with independently read false kill switches retained. The
diagnostic truthfully reports defaults / clause-analysis-v2. Remote settings
are not modified by this migration. Local paste-ready/template files now match
v2; remote verification will fail honestly until v2 is published and activated.

Four new configuration/provider regressions failed before correction and pass
afterward. They cover true/false flags through retirement and preservation of
a source-supported high-risk indemnity on cloud/device. Existing negated
checklist and unsupported-indemnity responses still fail, with no retries or
silent rewriting. 178 web tests, core typecheck, production build and nine
Firebase checks pass. One post-correction full public lease completed cloud
10/10; see DEMO_READINESS.md for actual content observations and limits.


## Grounding policy v3: observed timing, geography and notice overclaims

v3 strengthens prompts and adds narrow lexical withholding for observed errors:
- An explicit more-than-N-days-late fee trigger cannot be narrated as a missing
  or unspecified grace period. Questions about waiver/procedure remain allowed.
- A restriction expressly within the United States cannot be narrated as an
  undefined geographic scope/area. Questions about narrowing it remain allowed.
- Without source notice wording, an explanation cannot assert termination
  without notice requirements. At-will/at-any-time alone is insufficient.

These guards are conservative triage, not general geographic/employment/legal
entailment verification. They can reject nuanced wording; they do not prove all
accepted claims. They run after JSON/token validation and before restoration,
without rewriting replies or triggering retries. Sources with express notice
wording and accurate timing/geography explanations remain accepted. Local
Remote Config templates are synchronized; server settings remain unchanged.

188 web tests and core/web typechecks pass. Focused rent/deposit cloud acceptance
passed 2/2 with correct values/timing. A full offer run returned 11/11 validation
but revealed geography/notice overclaims; after correction, one fresh focused
c6/c8 run passed 2/2 with accurate nationwide scope and notice left unspecified.
Those separate observations must not be called a new full-offer run under the
final guards. The manual diagnostic adds a fixed c6/c8 selection before masking.


The v3 follow-up also withholds observed assertions of execution from short
unsigned signature forms (By/For/party signature lines), without trying to verify
real signatures. It does not handle every wording or signature format. Prompt
constraints distinguish intended signatories from proof of signing and keep
imagined liability carve-outs out of factual explanations. Counterexample tests
permit missing-notice descriptions and do not infer a fee trigger from negated
wording. 195 web tests and core/web typechecks pass after these corrections.


## November 21: general lease analysis after engine-owner review

Likhil approved/merged #28 and requested retirement of the exact-sentence lease
helper. The helper, questions, format version, enum schemas and equality validator
are removed. All lease wording now uses the general v2 path with the normal
JSON/token/grounding checks. Diagnostics report leaseTermReview general-v2.
Four lease formulations on both providers verify ordinary analysis rather than
a prescribed answer; the exact sample case failed before removal. The older
negated-checklist replay and unknown-token tests remain rejected.

189 web tests, 94 engine tests, core typecheck, production build and nine Firebase
setup checks pass. The lower web count reflects retirement of nine tests for the
removed template, replaced by general-path coverage within two provider tests.
The existing labeled guarantee format is unchanged; it is not evidence of
unconstrained offline reasoning.


## Policy v3 and the general signatory/identification field format

Version v3 retires older global-topic prompts and uses concise factual
paraphrase instructions, keeping interpretations and missing terms in questions.
Cloud temperature is configured to 0 (not a guarantee of deterministic or accurate
output). Remote false kill switches remain effective when old payloads fall back
to current defaults; no server configuration is published by this change.

The signatory field grammar is in core/signatoryReview.ts. It quotes only supplied
approved masked fields and makes no signing-status assertion. A positive field/
capacity grammar rejects operative/unknown content and bounded input violations
to the ordinary analyzer. Both provider schemas constrain the application-owned
explanation and allowed questions; runtime equality, empty-draft, uniqueness and
two-question checks reject noncompliance. No invalid response is substituted.
The existing separately labeled guarantee format remains unchanged.

Name/By identity-capacity-entity tuples are also accepted across token IDs and
common printed role acronyms. They are quoted without inferring who actually
signed, who represents whom, or authority. Unknown titles/operative suffixes
still use ordinary analysis. Grounding v5 also withholds two observed semantic
errors: amounts used as payment recipients (including questions), and a contact
phone expanded into a requirement for all communications. These are narrow
lexical guards, not general entailment or question-quality verification.

The diagnostic exposes requestedReviewMethods to distinguish general analysis
from installed source-based formats without revealing originals or vault data.

## Draft reference preservation (commercial-review-v4)

After strict response validation, the local drafting check also withholds a
nonempty replacement that omits any approved source reference. The preliminary
review remains, with a visible application-authored explanation that the draft
was withheld. This covers the observed ordinary offline date-only replacement
which dropped the end-date reference. No replacement is synthesized and no extra
model request occurs. All references being present is necessary, not proof that
wording is complete or equivalent. Existing commercial-draft review still applies.
