# Native analysis adapter parity — November 24, 2026

This is an isolated source compatibility candidate against the current shared
web/core stack. It does not enable native analysis/chat, merge main, deploy or
replace #48. Base: #50/accdd4185e81c2047b24df7a12aadd146c413123.

## Preserved source and demonstrated gaps

Aarush's analyzeClause transport and existing 13 native adapter tests were copied
from the preserved #48/294ca23 source (local native safety tree matches that
published source). Its request interface stays unchanged: cloudSystem,
deviceSystem, input, schema, model, pin, allowDeviceFallback and timeoutMs.
The candidate uses #50's current shared core and engine, not the older #48 core.

The old native adapter predates #31's bounded printed-signatory/guarantee
validation and #45's confirmed per-failure source reporting. New regressions
against the old adapter produced **six failures, 16 passes** across 22 cases:

- No bounded explanation/question schema or matching provider instructions.
- Additional commentary accepted for bounded signatory/guarantee reviews.
- Duplicate bounded signatory questions accepted.
- Confirmed cloud/device provenance omitted on invalid/mixed-source failures.

These are local controlled reproductions, not actual model/phone observations.
No original teammate branch or earlier failure checkout was changed.

## Correction

- Derive the existing shared source-based format and allowed questions from the
  current approved masked clause, then send the same constrained JSON schema and
  instructions for both native provider paths.
- Run generic JSON/clause/token and explanation-grounding validation first, then
  the appropriate existing shared bounded-format validator. Reject a mismatch;
  never rewrite it into a fabricated successful review.
- Preserve general analysis for ordinary lease terms. No sample/sentence-specific
  lease helper is introduced. The fixed default model and policies are unchanged.
- Record a source only when the native reply explicitly reports cloud or device.
  Keep that confirmed source on the failure, including a rejected mixed-source
  reply; never borrow the previous clause's source for an unconfirmed exception.
- Preserve source pinning, sanitized errors, explicit masked-field projection,
  approval checks before/after each request and abort of stale queued work.

## Verification

- 22 native adapter cases pass after correction (the original 13 plus nine new
  policy/provenance controls). One existing mixed-source expectation now includes
  the newly required confirmed device provenance.
- Three additional integration cases pass with the actual mask/vault/approval
  registry. They reject a copied batch before another dispatch, exclude fictional
  raw names/amount/document ID from requests and cancel later sends after a real
  remask, for both resolved and rejected in-flight synthetic provider responses.
- Full current web suite: **427 tests / 23 files pass**.
- Core, privacy-engine and web typechecks pass; production build passes. Existing
  >500 kB bundle advisory remains. Engine source is unchanged; this is not a fresh
  independent rerun of the earlier 179 engine checks.
- All **63 production output files** are byte-identical to the existing #50
  production build using the same ignored private build configuration. No
  NativeBridge/main/chat release stop or native SDK source was changed, and this
  adapter is not wired into the product entry point.

```sh
npm ci --offline --ignore-scripts --no-audit --no-fund
npm exec --workspace @clause-guard/web -- vitest run src/nativeAnalyzer.test.ts src/nativeAnalyzer.integration.test.ts
npm exec --workspace @clause-guard/web -- vitest run
npm run typecheck --workspaces --if-present
npm run build --workspace @clause-guard/web
```

Dependencies came from the existing local cache with an unchanged lockfile.
Tests inject synthetic native responses, not Firebase SDK/model execution.
Unit authority mocks stay test-only; the separate integration file uses genuine
engine authority. No new production bypass or approval issuer exists.

## Concrete integration handoff

Aarush: review the adapter delta relative to #48 and the three files in this
candidate. When reconciling #50's shared stack with #48's native plugin, use this
adapter/test version with the current core exports. Do not cherry-pick it onto
#48's old core in isolation or overwrite the current Workbench/engine with older
native-branch files. Keep existing NativeBridge routing/release stops until the
combined source has its remaining release checks. This candidate deliberately
leaves #50's fail-closed NativeBridge unchanged.

This step needs source review; it does not ask for another run of an unchanged
c9acf60 SDK build. SDK linkage, real provider behavior, private Firebase configs,
App Attest/Play Integrity and physical-device acceptance must target the eventual
combined revision. Existing baseline simulator/emulator stop evidence stays
credited; it does not certify this new combination.

## Remaining independent source work and release limits

The JS adapter trusts only the source field returned by the plugin; these tests
cannot establish the native SDK's source confirmation. #48's iOS analysis helper
still recognizes device by one exact modelVersion and treats a different value
as cloud, whereas its chat helper has a stricter cloud model check. Reviewing
that analysis source-confirmation boundary is a separate useful source-only
follow-up before native release. Android's schema converter carries enum values
but does not carry array maxItems; shared JS validation remains required.
Neither issue is evidence that native/cloud acceptance has passed.

Main review/merge and actual-main six-sample cloud checks stay separate. No model
call, payment, billing/API/IAM/App Check/Remote Config setting, native release or
Hosting deployment occurred. Source publication verification is recorded in the
PR and project tracker.
