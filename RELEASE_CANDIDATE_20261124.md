# Main-targeted web release candidate — November 24, 2026

This candidate consolidates the tested web stack for review against `main`.
Review: https://github.com/lgudip-01/-BuildHybridAI/pull/50 (draft pending owner adoption).
It starts from #49 at `8d28c4e05958d4c10863ad3d3a40ffeef544e652`, which already
contains main and #31 ancestry. No synthetic merge or replacement of teammate
branches is needed. Runtime, dependencies and Hosting configuration are unchanged
from that tested stack; this increment adds release documentation and its tracker.

## Source and preservation

| Input | Frozen head | Relationship to candidate |
| --- | --- | --- |
| Current main | `65152ce` | Ancestor retained |
| #31 factual analysis | `e2cde29` | Ancestor retained |
| #32 engine input | `3e90529` | Reconciled source; original branch preserved |
| #33 import input | `1a6b334` | Reconciled source; original branch preserved |
| #44 web chat | `1a21116` | Ancestor retained |
| #45 combined controls | `2252c91` | Ancestor retained |
| #46 case/grouped amounts | `c1d7f05` | Ancestor retained |
| #47 plain numbers | `cae2985` | Ancestor retained |
| #36 latest navigation input | `f11094e` | Reconciled source; original branch preserved |
| #49 tested web stack | `8d28c4e` | Ancestor retained |

The #31 core analysis/signatory policy, fixed config/defaults and Remote Config
local template match exactly. Its only subsequent analyzer changes record
confirmed per-clause failure provenance, with regression coverage; they do not
change the model, prompt, grounding or draft policy. General lease analysis is
retained and `sourceQuotedLeaseTermReview` is absent from current runtime source.

#32's contact-substring coverage flaw and #33's bare-number/import-race findings
remain documented in PR_COMPATIBILITY_REVIEW.md. Their corrected implementations
and the original reproductions are already in the candidate, rather than taking
an older PR head over the corrected deployed files. This is source adoption;
it is not an assertion that those original PRs were approved or merged.

#41–#43 progress, manual masks, per-clause source and deletion are reconciled in
#45. Sai's formal #44/#45 UI approvals remain credited. Latest #36 focus, motion,
nav opacity and privacy copy are carried through #49; their owner sign-off is
still pending. Import/manual/delete/chat changes from the combined Workbench
are preserved. All 12 public fictional PDF/DOCX fixtures remain tracked.

## Fresh candidate checks

- [x] Refresh remote refs and #30/#31/#32/#33/#36/#44/#45/#48/#49 discussions.
  Main is still `65152ce`; no new #48/#49 owner response was present at inspection.
- [x] Original project folders and earlier local-only histories are preserved.
  The ZIP-derived Desktop folder has no Git repository; the cloud-check checkout
  is clean. Work is isolated in codex/main-release-candidate-20261124.
- [x] Runtime tree starts identical to #49, which contains both main and #31.
- [x] 402 web tests pass across 21 files, including genuine chat approval/replay,
  source validation, import races, numeric retention, controls and focus cases.
- [x] 179 privacy-engine tests pass across eight files.
- [x] Core, privacy-engine and web typechecks pass.
- [x] Nine isolated Firebase setup checks pass without live credentials/network.
- [x] Production build passes. Existing >500 kB advisory remains.
- [x] With existing ignored private configuration, entry script is
  `index-_zRnRsvX.js`, SHA-256
  `6a1976538f14f28082d1a32dcb94c7777e9d300c7cf07d0ccc0540744edba9c2`,
  byte-identical to the already deployed #49 build. No new deployment is needed
  to demonstrate a documentation-only candidate.
- [x] Targeted source inspection retains raw on-device-only inference, genuine
  approval, atomic one-use question consumption, masked-only history and strict
  source/placeholder validation. No direct fetch/logging was added to the cloud
  analyzer/chat/dispatch/session paths. This is a scoped check, not a full
  third-party or all-endpoint privacy audit.
- [x] Native app sources and nativeBridge.ts are unchanged from main; native chat
  retains its independent release stop. This is a web release candidate.

Reproduction from a fresh checkout (no install scripts needed):

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm exec --workspace @clause-guard/web -- vitest run
npm test --workspace @clause-guard/privacy-engine
npm run typecheck --workspaces --if-present
npm run test:firebase --workspace @clause-guard/web
npm run build --workspace @clause-guard/web
```

Use the documented Firebase setup for a browser deployment. Ignored environment
files, credentials, dependency folders and build output are not part of the PR.
The first offline dependency install found an incomplete npm cache; the exact
lockfile was then installed from the public npm registry with scripts/audit off.
No dependency files changed and no account/payment/service was created.

## Adoption order and remaining release gates

1. Likhil reviews the combined engine/cloud changes, especially #31's factual
   field grammar and conservative draft/grounding rules plus the #32 corrections.
   Sai reviews the #49 focus/navigation carry-forward. Prior #44/#45 approvals
   cover their original changes, not approval of this complete new PR.
2. A coordinated owner merge adopts this candidate into actual main. This PR
   consolidates the stacked web history; do not separately merge obsolete
   versions of #32/#33 or reapply earlier Workbench patches on top of it.
   Main and all source branches remain untouched by the preparation task.
3. Refresh actual origin/main, inspect the merge tree/diff and rerun affected
   checks if conflict resolution or other runtime changes occurred. Freeze its
   exact SHA before model acceptance; a main-based branch is not actual main.
4. Reverify actual no-billing status, current no-cost model eligibility/quota and
   production App Check before any fresh cloud request or deployment. Stop if
   cost/overage eligibility is uncertain or the free quota is exhausted. Never
   link billing, request a paid quota/trial account or switch providers to proceed.
5. Run the bounded six-sample matrix on that exact merged main using the existing
   sample workflow: inspect each fictional masked preview, explicitly approve
   once, then inspect accepted content, restored names and actual inference
   source. Record every failure and quality caveat; no automatic retries or
   fabricated-success repairs. Issue #30 requires actual main, so historical
   branch 60/60 and later chat/Hosting checks do not close that checkbox.
6. Deploy Hosting only from the verified main tree and verify its live bundle,
   review/approval/restoration, edits and actual source reporting. Preserve the
   documented offline/source and question-masking limitations. Update #30 with
   exact SHA, per-sample counts, failures and the hosted build.

## Separate owner/device dependencies

#48 at `294ca23` reconciles native safety with #40's chat methods. It is not in
this candidate. Aarush's earlier c9acf60 SDK/simulator/emulator results remain
credited; the newly combined native revision still needs its own SDK rerun.
Real App Attest/Play Integrity, private config delivery and physical phone/tablet
cloud acceptance remain open. Current web nativeBridge fails closed for native
approved-batch analysis; this candidate does not enable a mobile release.

The extension Manifest V3 scaffold is still an owner dependency in #30, not a
reason to hold the independent web source review. Demo video/submission and
eligibility stay with their owners. No billing/API/IAM/App Check/Remote Config
server setting, model call, main merge or Hosting deployment occurs in this step.
