> November 25 update: Aarush approved exact #60/47e08be. iOS Debug/Release,
> Android Debug/Release and the built-in cloud sample (4/4 validated/restored on
> both emulator/simulator) pass. See RELEASE_GATES_20261125.md for current gates;
> older build-pending wording below records the original handoff.

# Combined web/mobile candidate — November 24, 2026

## Exact inputs and reconciliation

- Latest UI/core/engine: #54, e69338979f800773801c7717d9c5a3395579d957,
  including #52 native adapter parity, merged #56 status wording, and the empty-
  preview truthfulness fix. Likhil approved the optional count and engine changes.
- Native: #58, e7e0d14aecf3f1b645f7cf8724c72794399a4d91, including #48 error
  safety/chat stops, #53 execution-source guard, #55 plist bundling and the new
  cloud-only iOS JSON options. #58's exact-revision SDK review remains pending.
- Logging: exact config plus harness/handoff from approved #57/bf26374. Actual
  native Debug log verification on Aarush's earlier combined branch is credited.

Two adapter add/add conflicts were resolved to #54's exact approved files, retaining
bounded shared policy and per-failure source reporting. Neither file was rewritten.
The tracker conflict preserves both histories and adds a current checkpoint. The
native plugin/Android/iOS project trees and config remain byte-identical to #58;
Workbench/core/engine remain byte-identical to #54. The web test:analysis command
also carries the native adapter suite. Both Git histories remain ancestors of the
candidate; main, teammate refs, original worktrees and private configs stay intact.
The source merge is candidate-only, not a release or main merge.

## Checks on the combined tree

- 442 web tests +185 engine tests pass (627 total). Three new actual NativeBridge
  tests use genuine engine masking/approval: only masked projected input reaches
  the registered plugin, fenced replies stay rejected with confirmed source, and
  stale approvals block before native dispatch. No real SDK/provider calls.
- Core, engine and web typechecks pass. Production build passes; existing >500kB
  Vite advisory remains. New tests do not change production output.
- 47 Swift native policy checks pass, including the unconditional release stop;
  24 analysis-source checks; five actual JSON option-dispatch checks; four actual
  onDevice error-boundary checks; eight synthetic plist bundling checks.
- Shared prompt/model/limit parity passes with Node's --experimental-transform-types
  flag. Plain Node strip-only mode first failed on an existing TypeScript parameter
  property; it did not indicate a policy mismatch. A premature attempt to run the
  Swift check before compilation finished found no binary; the completed compile
  and actual 47-check execution passed.
- Real cap copy ios and cap copy android both pass using this production web build.
  Generated configs retain loggingBehavior=none and app identity; actual bridge
  controls plus generated config checks pass (seven groups). Copies are ignored,
  not committed. No real Firebase config exists in the candidate.
- Original Android Gradle wrapper CRLF/trailing whitespace is retained byte-for-
  byte; diff --check flags this inherited formatting. No formatting rewrite of
  upstream native scaffolds was made to hide the advisory.

## Native feature state and remaining gates

Web masking/review/chat retains the approved web reference. Native analysis now
uses the same current approved-batch adapter. Native chat is still stopped in JS
and both native entry points; integration does not authorize enabling it. Logging
remains off. Strict JSON/schema/source checks and per-question authority remain.

Credit earlier #55 configured builds, #57 native Debug log check, Android emulator
4/4 sample/restoration, and Aarush's local iOS JSON-options precursor 4/4/restoration.
These are not new cloud runs, six-sample content evaluation, actual phones or exact
final-revision certification. Full Xcode/Android SDK builds are unavailable here.

Next owner check: one SDK build pass of this combined candidate after normal local
sync, keeping logging off and real configs ignored. It can satisfy #58's changed-
Swift build gate too; do not run duplicate build matrices for each precursor.
Report exact SHA, SDK resolution and iOS Debug/Release + Android build results.
No cloud/model call is requested for this build check.

Then: physical iPhone/Android model behavior and attestation; current verified
no-cost/account/App Check state before any bounded masked cloud acceptance; six-
sample content/restoration review on the chosen integrated revision; coordinated
owner main merge; exact-main/hosted acceptance; finally debug-token cleanup and
demo preparation. No billing/trial/provider activation/deployment in this task.
