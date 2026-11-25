# Release acceptance packet — November 25, 2026

This is the current gate ledger. Older roadmap entries are historical evidence.
No gate becomes complete merely because a PR is published or a synthetic test passes.

## Revisions to use

| Purpose | Exact revision | Status |
| --- | --- | --- |
| Actual main | 65152ceaaa4a5006223c0705f7896631b95b70ed | Still lacks pending integrated work |
| Web adoption, #50 | accdd4185e81c2047b24df7a12aadd146c413123 | Likhil and Sai review requests pending |
| Latest reviewed UI/core, #54 | e69338979f800773801c7717d9c5a3395579d957 | Includes merged #56 and truthful empty preview |
| Native JSON fix, #58 | e7e0d14aecf3f1b645f7cf8724c72794399a4d91 | Approved; SDK check completed through #60 |
| Combined SDK target, #60 | 47e08be8b2c4e52ee26ea2706227813e50f6d4de | Approved; iOS Debug/Release and Android Debug/Release pass |
| Offline six-sample baseline, #61 | fb1c9062afe4a024a9c23469b85323a53d87f341 | 12 synthetic cases, 454 web tests; not live acceptance |

#61 adds tests/docs only; all 63 production output files match the tested #60
build. This packet is another documentation-only addition to #61. Keep #60 as
the one SDK target; no duplicate precursor build matrix is requested.

## Completed evidence to retain

- #53 source-policy SDK builds; #55 configured iOS Debug/Release, exact bundled
  plist and stale-copy removal. Both private Firebase files were received.
- #57 Android/iOS Debug logging-off verification on Aarush's earlier combined
  local branch. The logging-on control exposed the vault key; keep logging off,
  sanitize evidence and never upload vault keys/debug tokens or raw diagnostics.
- Android emulator built-in sample: owner-reported 4/4 validated and restored.
- iOS simulator JSON-options precursor: owner-reported 4/4 validated and restored.
  The earlier 1/4 fenced-response failure remains recorded; the shared parser
  remains strict. Neither precursor result certifies the final combined revision.
- #60 local 627 web/engine tests, policy/source checks, production build, both
  Capacitor copies and native config/logging checks. Full native SDK linkage is
  not established by these local checks.
- #61 actual engine/NativeBridge tests across six public samples and synthetic
  cloud/device labels. Current fixture assertions cover 70 required sensitive
  strings and 35 retained terms per synthetic source. This is not model accuracy.

Evidence links and reproduction details:
[combined candidate](https://github.com/lgudip-01/-BuildHybridAI/pull/60),
[offline sample follow-up](https://github.com/lgudip-01/-BuildHybridAI/pull/61),
[iOS JSON precursor](https://github.com/lgudip-01/-BuildHybridAI/issues/17#issuecomment-7147133536),
[logging review](https://github.com/lgudip-01/-BuildHybridAI/pull/57#pullrequestreview-6047375683).

## Gate 1: exact combined SDK build — COMPLETE

Aarush approved exact #60/47e08be: clean 627-test run, all typechecks/build,
normal sync with clean Git status, configured iOS Debug/Release simulator builds,
and Android assembleDebug/assembleRelease (unsigned Release as expected).
Resolved iOS Firebase 12.19.3, App Check 11.3.2, Capacitor Swift 8.6.2; Android
firebase-ai 18.2.0, ondevice 16.0.0-beta08, App Check debug 20.1.0. Generated and
bundled configs retain logging none, and iOS bundles the exact local plist.
This also closes #58's exact changed-Swift SDK gate; do not request it again.

Evidence: https://github.com/lgudip-01/-BuildHybridAI/pull/60#pullrequestreview-6061644704 .

### Exact combined built-in sample — COMPLETE on emulator/simulator

Aarush ran the built-in sample on those exact Debug builds, logging off. Android
Pixel 8 emulator and iOS iPhone 18 Pro simulator both returned 4/4 validated cloud
reviews with real values restored and no leftover placeholders. Ten values were
masked first, both platforms required patterns-only review, and bridge payloads
were absent from logs. iOS's only reported model-error lines were type-only.

Evidence: https://github.com/lgudip-01/-BuildHybridAI/pull/60#issuecomment-7169992278 .

This closes exact-revision built-in-sample acceptance, not physical model support,
release attestation, six-sample content evaluation, native chat release or main
adoption. These are owner-reported cloud runs; no model call was made by this
reconciliation, and any future provider use still requires fresh cost/App Check
verification. Earlier precursor failures remain part of the evidence.

### Reproduction reference (completed gate; no duplicate build requested)

Use #60's exact SHA in a clean isolated checkout; retain private configuration
only at its ignored native paths. Do not post either Firebase file publicly.
Use the already installed toolchains and locked dependencies. Record any source
or lockfile changes needed by sync/build before claiming an exact-revision result.

From repository root, normal project sync is:

```sh
npm run sync -w @clause-guard/mobile
```

Sync/build may resolve SDK dependencies; these are build steps, not provider
inference. The native owner must inspect local changes and generated configs.
Record the resolved Firebase SDK/toolchain versions, both generated configs'
loggingBehavior=none, unchanged app identity, and iOS built-plist presence/match.
Never include a token, key, full plist or generated credential contents in evidence.

Build iOS Debug and Release using the App target in the existing Xcode project
at apps/mobile/ios/App/App.xcodeproj. Report the SDK/destination and result; do
not treat a Swift stand-in harness as linkage evidence.

The Android project includes :clause-guard-clause-guard-ai (the Kotlin plugin).
From apps/mobile/android, the owner can validate these actual project tasks:

```sh
./gradlew :app:assembleDebug :clause-guard-clause-guard-ai:compileReleaseKotlin
```

These SDK commands have not been executed on our Mac; full Xcode/Android SDKs
remain unavailable here. One combined pass can cover #58's changed Swift too.
No additional cloud/model call or repeated SDK build is requested. Native chat stays stopped in JS,
Swift and Kotlin; compilation alone is not permission to enable it.

Evidence reply on #60:

```text
Revision and dirty/source changes:
Xcode / simulator SDK / resolved Firebase SDK:
iOS Debug / Release result:
Bundled plist present + project/bundle identifiers match (yes/no only):
Android Java / SDK / Gradle / resolved Firebase dependencies:
Android Debug APK / plugin release Kotlin result:
Generated logging setting and runtime flag if checked:
Untested items / failure category (sanitized):
No model/provider request made (yes/no):
```

## Gate 2: physical devices and runtime acceptance — mobile/cloud owners

Local readiness update (November 25): Xcode 27.2 (27B52) is installed and
selected; the user reviewed and accepted its first-launch SDK agreement. The
first-launch status check passed and iOS 27.2 device/simulator SDKs are available.
Web production build and iOS Capacitor sync passed with a clean tracked tree;
generated payload logging remains `none`. The existing private ignored Firebase
plist matches the expected bundle/project identifiers. No app or provider was run.
Local unsigned device build result is recorded in the execution tracker.

Apple's free Personal Team supports personal-device testing, with periodic
reprovisioning: https://developer.apple.com/help/account/basics/about-your-developer-account/ .
No paid Developer Program membership, payment details or billing service is
authorized. No device was detected; the user deferred USB connection because
they were leaving. Physical installation/runtime/signing remain unverified.

User-reported iPhone: iPhone 16 Pro Max, iOS 27.2.1. Confirm actual OS, local-model
availability and configuration on the phone before recording support. Likhil's
Android tablet model/OS/Nano availability are still unknown. Simulator/emulator
results do not close this gate.

For each available physical device, record exact built revision, device/OS, local
model status, completed/partial read counts, review requirement, and masking/type
results using fixtures at that SHA. Derive scoring targets from those fixtures;
do not reuse the older 70/34 counts as today's targets. Record exact misses and
retained-term losses, not only a percentage.

Check real release attestation separately: App Attest on iOS and Play Integrity
on Android. Debug tokens are test evidence only. Keep logging off. Device runtime
checks must distinguish a real cloud answer, a preliminary local answer and an
unconfirmed/rejected answer. Capture only sanitized counts and fixed categories.

## Gate 3: genuine bounded model/content acceptance — Cloud AI/Firebase

Before ANY new provider call or deployment, verify current no-billing account
state, current no-cost model/quota eligibility and App Check for the actual app.
If payment/billing/trial/overage exposure or cost uncertainty exists, stop; no
upgrade, paid quota account or provider switch is authorized. Exhausted quota is
a stop, not a retry trigger. Existing evidence is not a fresh cost verification.

Use public fixtures only and the existing manual sample workflow. Inspect the
exact masked preview and explicitly approve that batch once. No automatic retry.
For each sample record exact revision, model/config version, clauses attempted,
validated/rejected count, confirmed source per result/failure, exact restoration,
withheld drafting and substantive content errors. Valid JSON is not legal quality.
Record every refusal/failure and how it appeared to the user. Native chat requires
its separate acceptance before either independent stop can be removed.

## Gate 4: owner main adoption and hosted demo — Likhil / Sai / Cloud AI

#50's requested engine/cloud and UI reviews remain pending. #54/#60 are stacked
candidates, not main. Coordinate owner adoption; avoid applying old patches or
merging superseded versions over the reviewed integrated files.

After adoption, refresh actual origin/main, inspect any conflict resolutions and
freeze the resulting SHA. Run affected checks, then the bounded six-sample
content/restoration acceptance on that ACTUAL main (issue #30's requirement).
Only after fresh no-cost/App Check checks, deploy Hosting from the verified main
and verify the live bundle and masking/review/approval/restoration/chat lifecycle.
Historical branch/model runs and synthetic source labels do not close this gate.

Finally, after active native testing ends, remove obsolete debug tokens through
the project owner workflow and prepare the demo/submission with the actual
verified platforms and known limitations. No deadline/contest quota offer changes
the zero-cost policy. This packet creates no cloud activity or permissions.
