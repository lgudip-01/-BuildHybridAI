# iOS cloud analysis JSON output — November 24, 2026

## Trigger and decision

Aarush reported iOS App Check/cloud transport working, but three of four built-in
sample replies were fenced Markdown and rejected safely by the strict validator.
Likhil requested a platform JSON-output fix before considering any parser change.
Aarush then verified the public generation-options API against Firebase iOS SDK
12.19.3 and tested the minimal JSON MIME option locally: 4/4 validated and real
names restored, with logging off. His local patch was reverted and never pushed.

Evidence:
- Failure: https://github.com/lgudip-01/-BuildHybridAI/issues/17#issuecomment-7146778144
- Owner preference: https://github.com/lgudip-01/-BuildHybridAI/issues/17#issuecomment-7146885495
- Successful local precursor: https://github.com/lgudip-01/-BuildHybridAI/issues/17#issuecomment-7147133536
- SDK options API: https://firebase.google.com/docs/reference/swift/firebaseailogic/api/reference/Classes/GenerativeModelSession
- GenerationConfig: https://firebase.google.com/docs/reference/swift/firebaseailogic/api/reference/Structs/GenerationConfig

## Published correction

Based on reviewed #55/fb0d85a native stack. AnalysisSupport.run passes
GenerationConfig(responseMIMEType: "application/json") only for cloud analysis;
the Apple device path keeps ResponseGenerationOptions.default. The exact source-
confirmation guard remains after respond. Sessions, prompts/schema, model names,
deadlines and provider choices are unchanged. No fences are stripped. Schema
remains in the prompt, and the strict shared validator still checks every result;
JSON MIME does not itself enforce the schema or guarantee legal accuracy.

The shared Capacitor config is copied byte-for-byte from approved #57/bf26374
(loggingBehavior=none), so native testing must retain the logging privacy fix.
Native chat remains stopped; its implementation and shared validators are intact.
No Firebase plist/JSON, debug token or vault key is published.

## Local evidence

- New checkIOSAnalysisJSON.py fails on the old method lacking explicit options.
- Five checks compile/execute the actual options/dispatch snippet unchanged with
  SDK stand-ins: cloud JSON MIME/one call; device defaults; cloud and device error
  propagation without retry/fallback; response text unchanged for strict validation.
- 24 actual-source confirmation checks pass. Swift syntax parse passes.
- 137 analysis/native-adapter tests pass, including strict fenced-JSON rejection.
- These are local source-policy/parser checks, not SDK linkage or provider calls.
  Full Xcode is still absent here. No inference, deployment, billing or account
  settings changed in this task.

## Teammate state reconciled

- #56 approved at 1ec525a and merged by Aarush into #54. Final #56 tests against
  original #54 produce three failures: two original wording regressions plus the
  later deliberate full-read wording change. Earlier “two” referred to the first
  reproduction; three is the final-file negative-control count.
- #54 now e693389 includes the merged correction and truthful empty-preview copy
  plus a regression. It reports 624 tests and Likhil approval of the additive field.
  Preserve this newer UI commit in the upcoming combined candidate.
- #57 approved: Android Debug runtime flag false, synthetic success/error callbacks
  delivered, no markers/bridge lines in logcat; iOS sample masking produced no
  bridge payload/value logs. The logging-on control exposed a vault key, so keep
  diagnostics sanitized and never restore logging for real contract/vault tests.
  Evidence: https://github.com/lgudip-01/-BuildHybridAI/pull/57#pullrequestreview-6047375683
- #55 configured iOS Debug/Release packaging and stale-copy checks are complete.
- Android emulator sample 4/4 is credited. iOS precursor 4/4/restoration is credited
  as Aarush's local test, not an exact final-revision or six-sample acceptance run.

## Next gates

Aarush: review and SDK-build the exact published follow-up with logging off; report
resolved SDK version and compile result, and keep existing source-confirmation and
privacy guards. No repeat model/cloud request is requested by this build check.
Any future inference requires fresh verified no-cost/account state and appropriate
App Check, plus real runtime approval for masked input.

Next independent task: reconcile latest #54/e693389 plus #57 and this native stack
in an isolated candidate, preserving branches and all prior evidence. Main owner
review/merge, exact-main acceptance, six-sample content evaluation, actual phone
model behavior, App Attest/Play Integrity and final debug-token cleanup remain
separate. A public Schema converter for server-side schema enforcement can be
reviewed separately; it is not required to fix the demonstrated fenced-output bug.
