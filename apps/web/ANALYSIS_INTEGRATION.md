# Approved-batch analysis integration

Related: issues #5, #7, #8, and Firebase setup PR #6.

## Current status

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
contract input. The allowlist spans the whole batch, including alphabetic party
labels. All response fields are checked; an invented bracketed placeholder
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
