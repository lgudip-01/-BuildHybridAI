# Native chat candidate — November 23, 2026

Based directly on Aarush's #35 (`feat/android-project`, 6cf643e), not the older
plugin skeleton inherited by the chat UI branches. Preserve the #35 analysis,
on-device, App Check and vault implementations. This candidate adds only native
chat methods, policies and local tests. Shared engine/bindings/UI remain in
#37/#38/#39 and must be adopted together; this branch does not replace those.

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

## Full native verification remains OPEN

This Mac still has Command Line Tools, not full Xcode, Swift 6.0.3 rather than the
#35 Firebase hybrid requirement 6.2.3, Java 17 rather than #35's Java 21, and no
Android SDK. No app compilation, linkage, simulator, actual Capacitor invocation,
App Check token or phone evidence is claimed. JVM org.json tests do not substitute
for Android platform parsing/SDK integration. Run both platform builds on the
owner's configured toolchains, verify SDK imports and modelVersion values, then
exercise the native stop in a real WebView before considering release work.

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
