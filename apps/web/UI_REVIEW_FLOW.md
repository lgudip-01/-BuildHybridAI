# Minimal web review flow — issues #8 and #19

The existing masking bench now has an explicit masked-review action and result cards. This is a functional integration increment for the Cloud/Firebase sector; Sai still owns the complete product screens, file-loading experience, extension, and visual design.

## Behavior

- `ReviewSession` (`src/reviewFlow.ts`) owns a stable document ID, retains the exact engine-issued mask object, and serializes masking/analysis.
- Masking stops at the preview. It never automatically sends contract clauses for analysis. Clicking **Approve & analyze** explicitly approves the masked version, including pattern-only runs.
- Editing after completion clears the mask and all results. The user must mask and review again. Editing and duplicate operations are locked while work is in progress, so queued model calls cannot continue against text the UI has already changed.
- Analysis uses genuine `approve → bridge.analyze → assertApproved → unmask → assertApproved`. It checks the returned document ID, confirmed source and exactly one outcome per requested clause before restoration.
- Actual successful `ranOn` controls the badge. All-request failure with no confirmed execution gets no badge.
- Results show a clause overview and cards, original source available locally, preliminary risk, explanation, proposed wording and questions. Failed clauses get a needs-review card without a fabricated risk, rewrite or questions.
- Commercial draft-withholding notices are distinct from missing proposals. Source-based guarantee explanations stay visibly labeled. The app does not imply that a schema-valid answer is legal approval.
- No automatic retries or new cloud requests are introduced. Redundant extra classification previously performed by the bench was removed; clause types now come from the engine result.

## Validation

116 targeted tests passed across review lifecycle, server-rendered result cards, analyzer/config, sample helper and real-engine integration, plus web TypeScript and production build. Lifecycle tests use the genuine mask/approve/unmask engine and actual WebBridge with model responses mocked. They cover explicit approval, raw-value request projection, local restoration, partial failure, edit clearing, stable IDs/remask invalidation, duplicate-operation locks, stale replies, wrong/missing/duplicate outcomes, and unconfirmed-source failure. Render tests cover withheld drafts, failed-card semantics, source labels and escaping untrusted source text.

Compatibility check: main at `9719099` was integrated locally, retaining this UI flow and the engine's current clause-type handling. After resolving the single App.tsx conflict, the 116 targeted tests and all 77 engine tests passed. The published branch must include that main ancestry before users update their already-integrated checkouts; do not merely publish conflicting App.tsx edits and ask the user to resolve them.

The cloud browser could not reach the local development server (`ERR_CONNECTION_REFUSED`). An interactive check was attempted with a synthetic/mock harness, but did not run; the temporary harness was removed. Do not claim browser interaction, phone layout, real UI cloud calls or offline fallback were verified by these tests.

## Small check for Dhruv on his Mac

1. Update the configured checkout from `origin/cloud/approved-analysis`, preserving local main/engine merges; run the existing web dev command.
2. Open localhost. Paste a short fixed public sample such as the guarantor clause from `samples/promissory-note.txt`.
3. Click **Mask contract**. Confirm the masked preview is displayed and **Approve & analyze** appears; no analysis should start automatically.
4. Review placeholders. Click **Approve & analyze** once. Input and Mask must lock until it finishes.
5. Check the result card/source badge. The previously validated short-guarantee format should return a source-based review with no replacement wording. Any rejected answer should instead be clearly marked needs review, with the original clause still available.
6. Edit the contract after completion. Old preview, badge and result cards must disappear; analysis requires masking/review again.

One approved clause is enough for this first live UI check. Do not rerun the six full samples or provoke model failures for UI screenshots. Remaining work includes real offline behavior, the outgoing-request audit and full product UI/extension integration.

## Reuse for the UI teammate

Use the `ReviewSession` lifecycle or retain its invariants in the product state model; reuse `AnalysisResults` or its failure/notice handling. No new shared `AiBridge`, `Analysis`, or `AnalyzeResult` fields were introduced. No broad teammate test run is requested; Cloud/Firebase has run the integration checks above.
