# PR #54 model coverage review — November 24, 2026

Reviewed exact head `0e41aae080955b15ea8db18a09c3495f82684976`, stacked on #52.
The opaque navigation background and native SystemBars theme listener are retained
unchanged. Aarush reported Android emulator theme/top-bar and iOS simulator
status checks; this review does not claim to reproduce those native runs.

## Findings and correction

`modelReadClauses` counts complete usable `readClause()` results. Every chunk
must succeed. A zero count can follow successful earlier chunk calls followed
by a later failure, or model output with no usable entity list. It does not
prove that no model call ran. The pill now says “no complete read”; the zero
banner describes the absence of a usable read instead of claiming no execution.
An omitted optional field is unknown coverage, not evidence of patterns-only
masking. The legacy-result banner now says coverage was not recorded. The full-read
banner describes remaining name confirmation without attributing a rule-detected
coordinated-name ambiguity to the model.

The shared field remains optional and its runtime shape is unchanged; only its
comment is clarified. No engine production code, approval checks, needsReview,
manual masking, providers, native bridges, stop policies or dependency versions
change in this follow-up. The count remains display metadata, not authorization
or proof of physical-device inference.

## Evidence

- Two banner regressions fail against #54's original Workbench before correction.
- 438 web tests and 185 engine tests pass (623 total), including zero/partial/full,
  legacy missing count, later-chunk failure, invalid output, genuine manual edits
  preserving counts and the existing stale-approval assertions.
- Core, privacy-engine and web typechecks pass; production build passes. Vite's
  existing large-chunk advisory remains (not a build failure).
- Local Chrome at 430px wide exercised the actual Workbench and engine with a
  temporary synthetic bridge: zero usable reads and 1-of-4 reads both showed the
  corresponding banner; page scroll width equaled viewport width (430px).
  The fixture disabled cloud analysis and made no SDK/provider calls. Temporary
  fixture files were removed and its local server stopped before publication.
- Local screenshots: `/private/tmp/clauseguard-model-zero-20261124.jpg` and
  `/private/tmp/clauseguard-model-partial-20261124.jpg` (not repository assets).

## Adoption and remaining gates

This follow-up is stacked on #54, not main. Aarush can cherry-pick its small
wording/tests changes into #54 or review the stacked PR. Likhil still owns review
of #54's additive MaskResult field; this work does not imply his approval.
#55's iOS config packaging work is a separate native stack and remains preserved.
Do not replace shared UI/core with that older native branch during integration.

No device build, native system-bar behavior, physical-device partial read,
attestation or cloud execution is certified here. No main merge, deployment,
service activation or billing change. Before any future provider acceptance,
verify current no-cost pricing/account state and App Check first.

Next independent source step: prepare an isolated combined source candidate
from #54 plus this correction and the reviewed native #53/#55 changes; inspect
conflicts, run relevant local checks, and publish only after the source tree is
reviewable. Preserve owner review/merge and real-device/runtime gates separately.
