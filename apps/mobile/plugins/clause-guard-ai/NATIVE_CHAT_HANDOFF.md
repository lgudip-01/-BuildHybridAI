# Native chat candidate — November 23, 2026

The original native candidate is based on Aarush's #35 at 6cf643e. This safety
integration combines #40/c9acf60 with his #35/5cac809 raw-error correction,
preserving analysis, on-device execution, App Check, vault, chat methods and
policies. The functional shared web/engine/UI stack is published separately
through #47; this native-only candidate does not replace that release.

## November 24 source-confirmation follow-up

Aarush completed the #48/294ca23 SDK rerun: 45 Swift policy checks, four iOS
error-boundary checks, iOS Debug/Release simulator builds with real Firebase SDK
and Capacitor 8.6, Android debug APK and release Kotlin compile. Report:
https://github.com/lgudip-01/-BuildHybridAI/pull/48#issuecomment-7136787733 .
The unchanged c9acf60 simulator/emulator release-stop and local 39 Kotlin policy
checks remain credited. No request to repeat those unchanged checks is needed.
These results close #48's changed-source build gate, not native cloud/device
acceptance. No Firebase config or provider/network execution occurred.

Aarush also formally approved #52/1a5ed5a after 606 checks (427 web, 179 engine),
typecheck/build and an empty-native-reply check:
https://github.com/lgudip-01/-BuildHybridAI/pull/52#pullrequestreview-6042756467 .
The wording difference for empty replies is nonblocking; the approved adapter
source remains unchanged. Its approval does not mean that #50, #48 and #52 have
been combined or that a phone/cloud flow has passed.

This follow-up tightens iOS AnalysisSupport.run's execution-source guard.
Previously any modelVersion other than the exact Apple device identifier could
be accepted as cloud, including blank/unknown values. NativeAnalysisSource now
requires the current fixed reviewed model plus exact cloud version or a three-
digit revision; device execution requires the known device identifier. Unknown
requested sources are rejected. The existing shared cloud matcher now uses a
strict end-of-input anchor so a trailing newline cannot pass as a model revision.
No request shape, model selection, SDK dependency, timeout, provider setup or
release stop is changed. SwiftPM already includes the entire source directory.

Fresh local evidence (Swift 6.0.3, Swift 6 complete strict concurrency):

- The original analysis guard fails 14 invalid combinations in the initial
  22-case matrix. The actual response-source guard is extracted unchanged from
  AnalysisSupport.run into a synthetic response harness, not reimplemented.
- The final 24-case matrix passes, including blank/unknown/wrong models, invalid
  requested source, cloud/device mismatch, exact/three-digit revisions and final
  CR/LF rejection. The old shared cloud policy separately fails the two final-
  line-terminator negative controls. Source files are snapshotted before compile.
- All 47 Swift policy checks pass (the prior 45 plus CR/LF regressions). Native
  chat still returns release_pending before provider work.
- Shared prompt/model/limit parity against #52's current core passes. Swift
  plugin/helper syntax parsing passes. No Kotlin, web/core or dependency change.

Commands from this candidate root:

```sh
python3 apps/mobile/plugins/clause-guard-ai/tests/native-chat/checkAnalysisSource.py
swiftc -swift-version 6 -strict-concurrency=complete apps/mobile/plugins/clause-guard-ai/ios/Sources/ClauseGuardAIPlugin/NativeChatPolicy.swift apps/mobile/plugins/clause-guard-ai/tests/native-chat/main.swift -o /tmp/clauseguard-native-policy
/tmp/clauseguard-native-policy apps/mobile/plugins/clause-guard-ai/tests/native-chat/fixtures.json
node --experimental-transform-types apps/mobile/plugins/clause-guard-ai/tests/native-chat/checkSharedContract.mjs /path/to/current-shared-core
```

The fixture runner permits an optional AnalysisSupport source path and optional
old NativeChatPolicy path for reproducing negative controls; these are test-only.
It compiles the actual guard and policy, with synthetic metadata and no SDK call.
This does not prove Firebase returns those identifiers on an actual device.
An unrecognized real version must fail closed until verified, not be relabeled.

Aarush's next bounded check: iOS Debug/Release simulator builds for this changed
Swift revision, confirming SwiftPM includes NativeAnalysisSource.swift and the
new guard links with the real SDK. This is a changed-source iOS build request,
not another Android build, unchanged WebView stop or six-sample cloud run.
Private config delivery still requires a designated approved private channel;
never attach those files to a public issue/PR. Physical-device App Attest/Play
Integrity and native cloud/content/source acceptance remain pending, after
current no-cost/billing verification. Native chat remains disabled.

The older sections below retain the native candidate's source/test history.

## Implemented, still blocked

- Swift registers chat in pluginMethods and implements the method; Kotlin exposes
  @PluginMethod chat. Both first call an unconditional native release stop,
  independent of the JS stop in #38. Direct plugin calls return release_pending
  before request parsing, config, provider or coroutine/task creation. There is
  no preference, build setting, environment variable or request field to enable it.
- NativeChatPolicy checks the six-field request envelope, literal cloudOnly true,
  current shared model, exact reply schema and a 30-second deadline. It bounds
  system/input text and validates projected contract/history/question shape,
  unique clause IDs, alternating bounded masked history and supplied citations.
  Limits use UTF-16 lengths on both platforms. Unknown metadata is rejected.
- This is structural validation, NOT proof of masking or engine-issued approval.
  Genuine authority, atomic consumption, privacy checks, fresh-run validation and
  restoration remain in the shared engine/dispatcher. No raw overload, vault
  access, telemetry, persistent chat or native/provider conversation history added.
- Android uses #35's runCloud helper: ONLY_IN_CLOUD, schema conversion and an
  explicit InferenceSource.IN_CLOUD check. No fallback/retry loop in chat.
- Swift uses a fresh Gemini-only session. Cloud modelVersion must equal the
  requested model or its three-digit revision suffix; blank, device and unknown
  versions fail. This is stricter than #35's existing analysis check, which is
  untouched. Experimental iOS session schemas are embedded in the prompt; shared
  JS validates returned JSON, tokens and citations before any answer is displayed.
- Swift requests carry only Sendable strings/integers across the deadline closure;
  the schema is created fresh, not shared mutable Any state. Errors are fixed text
  and codes; new methods never log SDK errors, request input or model output.
- JS and native timeouts cannot recall server work once dispatched. Swift's
  inherited task-group deadline depends on cooperative cancellation; JS also
  bounds/discards late completion. Release stops currently prevent all dispatch.

## Verified locally

38 shared fixtures cover valid projected requests/history, unknown metadata,
wrong models/schemas/booleans/timeouts, clause and history limits, UTF-16 boundary,
role order and invalid citations. Fixture repeat recipes expand locally, keeping
large bound cases reviewable rather than committing megabytes of repeated text.

- Swift 6.0.3, Swift 6 mode and complete strict concurrency: policy compiles and
  **45 checks pass** (38 fixtures, six modelVersion checks, native stop check).
- Kotlin 2.1.21 compiler, Java 17 and JVM org.json: policy compiles and **39 checks
  pass** (38 fixtures and native stop). Compiler/test jars are public Maven
  downloads in /private/tmp only; no dependency or SDK version changed in the app.
- Swift plugin/helper syntax parse passes. Capacitor 8.6.0 APIs were inspected:
  Swift NSDictionary options are explicitly converted to string-keyed values;
  Kotlin uses PluginCall.getData(). This is not SDK typechecking.
- Shared prompt/model/limit parity checked against the published #39 source.
- Candidate applies cleanly to the full corrected #32/#33 + #35/#36 + #37–#39
  local integration. No web/engine source changes; previous 391-web/158-engine
  baseline is unchanged, not rerun or claimed as a new native-build check.

Pre-correction evidence is retained locally: compact-fixture encoding initially
confused false with numeric zero in Python equality (fixture fixed, original
production policies already rejected it); strict Swift 6 then rejected a stored
Any schema (fixed with fresh computed schema and Sendable serialized request).
No concurrency checks were disabled and no @unchecked Sendable was introduced.

## Historical #48 verification and source reconciliation

Aarush supplied full-toolchain evidence for #40/c9acf60: iOS Debug/Release builds,
45 Swift policy checks, Android debug APK/release Kotlin compile, and real WebView
release_pending results on the iOS simulator and Pixel 8/API 37 Android emulator.
The stops ran before provider work without Firebase config/network calls. See:

- https://github.com/lgudip-01/-BuildHybridAI/pull/40#issuecomment-7114221884
- https://github.com/lgudip-01/-BuildHybridAI/pull/40#issuecomment-7114733068

The #48 isolated branch merged that candidate with Aarush's 5cac809 raw-error
safety fix from #35. Both histories and all native chat methods/policies/stops are
preserved. For #48, the only runtime delta from #40 was the iOS onDevice catch: DEBUG logs
only the error type; JavaScript gets `On-device generation failed.` without the
provider's localizedDescription, which may echo raw contract text.

The actual catch body is executed by tests/native-chat/checkOnDeviceError.py in
Swift 6 with complete strict concurrency. Only NSLog's sink is renamed to capture
its exact format/arguments; the debug conditional and rejection expression are
extracted unchanged from the real plugin. NSError and LocalizedError fixtures
both echo synthetic private-looking text. Release/debug checks pass (4 total).
The previous plugin fails on its rejection; an unsafe-log-only fixture separately
exercises the DEBUG log failure. This is a focused error-boundary regression, not
Capacitor/Firebase SDK linkage, model execution or complete SDK logging proof.

Fresh local checks also pass: 45 Swift policy, 39 Kotlin/JVM policy, shared #47
prompt/model/limit parity and Swift plugin/helper syntax parse. Android policy,
Swift chat policy and AnalysisSupport are byte-identical to #40. The safety patch
applies cleanly to the previous full native integration. Current shared #47 JS
native release stop was inspected; it remains unconditional.

This Mac still has Command Line Tools/Swift 6.0.3/Java 17, not Aarush's full native
toolchain. Ask him to build this exact merged revision in iOS Debug/Release and
Android, and confirm the same pre-provider WebView stop if needed. This request
is for changed source; the completed c9acf60 builds are not being requested again.
Real phones/tablets, native attestation and actual native cloud answers remain
open. Do not remove either release stop based on compilation/policy checks alone.

Existing native configs are still private/ignored in the original primary
checkout; nothing is uploaded here. Private delivery to Aarush awaits a direct
endpoint/address. No Firebase activation, inference, deployment, billing, IAM or
App Check enforcement change occurred. Do not accept provider terms or enable a
paid/trial/billing-dependent option to complete the remaining checks.

## Local policy commands

From repository root (module-cache path stays temporary):

```sh
swiftc -swift-version 6 -strict-concurrency=complete -module-cache-path /private/tmp/clauseguard-swift-module-cache apps/mobile/plugins/clause-guard-ai/ios/Sources/ClauseGuardAIPlugin/NativeChatPolicy.swift apps/mobile/plugins/clause-guard-ai/tests/native-chat/main.swift -o /private/tmp/clauseguard-swift-chat-check
/private/tmp/clauseguard-swift-chat-check apps/mobile/plugins/clause-guard-ai/tests/native-chat/fixtures.json
```

Kotlin policy/harness source files are NativeChatPolicy.kt and
`tests/native-chat/NativeChatPolicyCheck.kt`. Compile them with the owner's local
Kotlin compiler plus org.json, then run the harness with fixtures.json as its only
argument. The recorded run used Kotlin's public Maven compiler-embeddable 2.1.21
runtime dependencies, annotations 13.0 and org.json 20240303, targeting JVM 17.
No Android project dependency change is needed for this standalone check.

With Node 24 and a checkout containing #39's shared contract:

```sh
node --experimental-transform-types apps/mobile/plugins/clause-guard-ai/tests/native-chat/checkSharedContract.mjs /path/to/shared-chat-checkout
```

## Reference sources inspected

- [Firebase Apple cloud-only configuration and modelVersion](https://firebase.google.com/docs/ai-logic/hybrid/ios/configuration-options)
- [Firebase Android ONLY_IN_CLOUD and source configuration](https://firebase.google.com/docs/ai-logic/hybrid/android/configuration-options)
- [Capacitor 8.6.0 Swift call options](https://github.com/ionic-team/capacitor/blob/8.6.0/ios/Capacitor/Capacitor/CAPPluginCall.h)
- [Capacitor 8.6.0 Android call data](https://github.com/ionic-team/capacitor/blob/8.6.0/android/capacitor/src/main/java/com/getcapacitor/PluginCall.java)

## Reproduce the error-boundary regression

From repository root with Python 3 and local Swift available:

```sh
python3 apps/mobile/plugins/clause-guard-ai/tests/native-chat/checkOnDeviceError.py
```

An optional plugin path argument can check a preserved earlier source file.
The script compiles/runs only temporary synthetic harnesses; it does not use
Capacitor, Firebase, credentials, model calls, account setup or network access.
