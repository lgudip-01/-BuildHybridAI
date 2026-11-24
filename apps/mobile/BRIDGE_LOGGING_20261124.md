# Mobile bridge logging privacy — November 24, 2026

Aarush observed masked prompts and full placeholder replies in Android Debug
logcat. Raw on-device input uses the same Capacitor bridge, so model-capable
phone tests must not rely on Debug's default logging behavior.
Evidence: https://github.com/lgudip-01/-BuildHybridAI/pull/48#issuecomment-7143275410 .

## Change

Set the shared `capacitor.config.json` loggingBehavior to `none`. There are no
Android/iOS logging overrides. Keep this setting when combining #56's UI stack
with #55's native changes. No plugin, provider, attestation, signing, WebView
inspection, dependency, app identity or private Firebase configuration changes.
Run the usual build and Capacitor copy/sync before native builds; editing the
source JSON alone does not update an installed app.

## Verified locally

- Before the change, `node apps/mobile/checkBridgeLogging.mjs` fails because the
  global setting is absent. This is a configuration regression, not a model run.
- The harness executes each platform's installed, unmodified Capacitor 8.6.2
  native-bridge.js in an isolated Node VM with synthetic transport/console stubs.
  DEBUG stays true in both positive and negative controls.
- With isLoggingEnabled=true, both platforms expose request and reply sentinels.
  With false, neither platform logs the synthetic request, successful result, or
  rejected result; original request and success/error callback delivery remain.
- The config assertion rejects an Android/iOS override that re-enables logging.
- Installed Android CapConfig maps `none` to false; Bridge exports that flag to
  JS and Logger.shouldLog uses it. Installed iOS descriptor maps `none` to the
  none enum, configuration maps it to false, CAPBridgeViewController applies it
  to CAPLog, and JSExport exports the same flag. These native paths were inspected,
  not compiled or runtime-certified on this Mac.
- Real `cap copy ios` and `cap copy android` both pass in a clean fixture seeded
  only with tracked #55/fb0d85a native project files, the corrected shared JSON,
  and a synthetic HTML asset. CI/noninteractive mode disables CLI telemetry.
  Both generated native JSON files retain `none` and the unchanged app identity.
- Harness: seven PASS groups including both generated copies. CLI copy is local
  packaging evidence, not a native SDK build or device log test. No private
  Firebase config was present in the fixture and no SDK/model/cloud call ran.
- Repository plugin Swift/Kotlin/TypeScript source contains no direct logging
  calls in the reviewed stack. This setting does not certify all OS or third-
  party SDK logs; never print raw contracts/tokens to console in new app code.

Reproduce after installing locked dependencies:

```sh
node apps/mobile/checkBridgeLogging.mjs
```

After local Capacitor copy/sync on a native project, optionally append paths to
its generated iOS and Android capacitor.config.json files. The script reads only
those Capacitor JSON files and installed bridge assets, never Firebase configs.
No need to rerun the unchanged web/model/approval matrix for this config change.

## Owner native check

@aarushgoel1: adopt this config into the combined native test branch and rebuild.
Report exact source SHA and Debug iOS/Android build results, generated setting and
runtime `window.Capacitor.isLoggingEnabled === false`. Verify a synthetic bridge
request and response/error do not reach Android logcat or Xcode logs, while the
normal callbacks still work. Use synthetic markers only; no cloud/model call or
real contract is needed. State whether either platform remains untested. Native
log verification remains pending until that evidence is supplied.

#55 configured iOS Debug/Release and stale-copy checks are already approved, and
Android emulator 4/4 cloud sample results are credited separately. Neither proves
this new logging setting on a running native build. Real phones, Nano, production
App Attest/Play Integrity, iOS runtime App Check/cloud, owner integration and exact-
main acceptance remain open. Future provider work still needs fresh verified
no-cost/account state and App Check. No merge, deployment, cloud activation or
billing change in this task.

Next independent step: reconcile reviewed #56 UI/core and #53/#55 native changes
with this privacy setting in an isolated candidate, preserving all owner branches.
