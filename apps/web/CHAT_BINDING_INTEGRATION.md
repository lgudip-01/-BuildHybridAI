# Real engine bindings and isolated integration — November 23, 2026

The production binding modules now import the real privacy-engine chat APIs.
`chatDispatch.ts` checks genuine engine authority first, then calls
`assertChatEgressEnabled()` before configuration, session/provider creation,
question consumption or network work. The separate `chatRelease.ts` function
always throws `ChatError('release_pending')`. There is no flag, environment
variable or caller option to enable it. Genuine questions stay unconsumed;
forged values still fail authorization. This PR does not release chat.

The UI owner can use the real local context/question/review lifecycle. Only
transport unit tests mock the release check. Actual-engine integration tests
use the production bindings, and a production-stop regression proves both
bridges reject a genuine approved question without configuration/provider calls.

## Verified checks

Binding-only checkout: 341 web tests, 140 engine tests, core typecheck and web
production typecheck/build passed. The branch is stacked on draft #37 at 6aa242e.

Separate full integration at local commit
`10d9674c96baceab0b950ddecf72071b6ba392a1` combines:

- this binding implementation (local b44fbb1),
- #32 engine-masking-gaps at 3e90529,
- #33 docs-import at 1a6b334,
- the six-file preserved compatibility corrections from
  PR_COMPATIBILITY_REPROS.patch and PR_COMPATIBILITY_CANDIDATE.patch,
- #35 feat/android-project at 6cf643e,
- #36 feat/web-redesign at 628c44e.

Result: **384 web + 158 engine tests pass**, core/engine typechecks and web
production typecheck/build pass. npm ci used the existing public-package cache,
offline, with lifecycle scripts disabled. The >500 kB main chunk advisory remains
(584.49 kB minified); PDF worker is 1,271.91 kB. No claim of native SDK compilation,
phone execution, deployed compatibility, live cloud answers or legal accuracy.
No cloud activation, model request, deployment, billing or permission changes.

The full integration exists only in an isolated local branch/worktree. This PR
publishes the thin binding change plus the text resolution patch, not the full
combined branch or teammate source histories. Main and each author branch remain
unchanged. Original primary checkout and prior failure evidence are preserved.

## Reproducing the integration conflicts

Use a fresh isolated branch at this binding implementation. Merge the pinned #32,
then #33 heads. In reviewFlow.ts retain chat lifecycle imports/fields/methods;
replace the old local splitClauses function with `import { splitClauses } from
'./clauses'` from #33. Keep ReviewSession's chat invalidation and close behavior.
Apply both preserved compatibility patches (reproductions first, corrections
second) before merging #35 and #36. Do not reapply them to an already corrected tree.

For the #36 conflict, use its App.tsx page wrapper, including AnalysisResults
reexport. Retain the incoming Workbench.tsx, then apply
CHAT_WORKBENCH_RESOLUTION.patch. This ports the guarded import handler, generation
and snapshot checks, file controls, numeric-preserving splitter import, URL/IP/
HANDLE labels and actual event-handler tests into Workbench. It retains the
redesign, platform wording, nested-scroll attributes and full-width result cards.
The lifecycle regression imports Workbench directly and only stubs motion.

The lockfile conflict is disjoint package entries: preserve BOTH `node_modules/lie`
(from #33) and `node_modules/lenis` (from #36), with their complete dependency and
optional peer metadata. Package.json must retain mammoth/pdfjs-dist alongside
GSAP/Lenis/Locomotive. Verify JSON syntax, npm ci, full tests and build before
considering the integration accepted. No resetting author branches is required.

## Remaining release gates, in order

1. Owner review/adoption of #37 and these real bindings; upstream the masking/import
   corrections with owners, and review the Workbench conflict resolution.
2. Bind the product chat view to ChatConversation's real preview/review/send/close
   lifecycle; implement native Swift/Kotlin chat methods. Raw drafts/history stay
   local. UI booleans cannot mint engine approval or bypass the release check.
3. Verify current zero-cost project/provider state and App Check, then perform the
   bounded synthetic payload/answer/privacy acceptance matrix on the intended
   platform. Remove the hard stop only in a separately reviewed release change.
4. Complete real iPhone/Android evidence and final demo integration. Full Xcode,
   native config private delivery and teammate platform work are still pending.
