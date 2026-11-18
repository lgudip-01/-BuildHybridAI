# Clause Guard — Cloud AI / Firebase handoff

Read this file before continuing. It captures the working state reported on November 18, 2026. Inspect current GitHub state before assuming branches or issue statuses are unchanged.

## Scope and working copy

- Owner/user: Dhruv Vyas. Collaborator/local-engine owner: Likhil, GitHub `@lgudip-01`.
- Repository: `lgudip-01/-BuildHybridAI`.
- Cloud work is published on `cloud/approved-analysis`. Last verified head before this handoff: `8933826`. Do not assume this work has been merged to `main`.
- Dhruv's configured Mac checkout is `~/Desktop/ClauseGuard-cloud-check`. It also includes merges from main for engine fixes; inspect `git status`, branch and history before switching or merging. Preserve local changes and local environment configuration. Never reset the checkout or overwrite it just to match the remote cloud branch.
- Work on the cloud/web AI bridge and Firebase sector. Other teammates own local masking, mobile adapters and web/extension UI. Coordinate changes to their interfaces.

## Product and critical invariants

Clause Guard masks contracts on the device, sends only approved masked clauses to cloud Gemini, and restores names/values locally. The interface is in `packages/core/src/types.ts`.

- Raw text is allowed only through `AiBridge.onDevice`, pinned to `ONLY_ON_DEVICE`. Importing `firebase/ai` for this path does not itself mean raw text is sent to cloud.
- Web `analyze` requires the privacy engine's genuine, current runtime-approved batch, not just a TypeScript cast. Keep stale/remask checks around async boundaries. Never copy/filter an issued batch to bypass approval.
- Cloud request projection is only clause id, optional type and masked text. Never send docId, replacement map, ledger, raw names or raw contract data.
- Unknown placeholders and malformed JSON are rejected before restoration. Do not relax validation to make demos pass.
- Actual inference source sets `ranOn`. A batch pins to its first confirmed source; avoid mixed-source or unconfirmed badges.
- No automatic extra inference calls/retries. Model failures remain visible per clause.

## Firebase and implemented files

Firebase project: `clause-guard-hackathon`; Gemini Developer API enabled; Spark plan reported. Web App Check enforced. User verified token acquisition and an invalid-token 401 rejection. Do not print or copy debug secrets; configuration is local to the user's machine. Native app registration/providers and production web App Check still need verification; do not assume they are done.

Core files:

- `apps/web/src/firebase.ts`: shared Firebase/App Check setup; development debug mode, production reCAPTCHA Enterprise requirements.
- `apps/web/src/webBridge.ts`, `cloudAnalyzer.ts`, `approvalGuard.ts`: real `firebase/ai` model calls and runtime approval enforcement.
- `packages/core/src/analysis.ts`: prompts, schema, validation and review policies shared with native bridge owners.
- `apps/web/src/analysisConfig.ts`: versioned, bounded Remote Config loading; old remote prompts get current application-owned output rules appended.
- `apps/web/src/sampleRoundtrip.ts`: development-only fixed sample mask/review/analyze/unmask workflow. Supports selecting clause IDs BEFORE masking. Preparing the same sample invalidates old previews.
- `roles/cloud-analysis-live-checks.md`: detailed live findings and policy limits.

Remote Config was published and verified by Dhruv: `cg_analysis_config` JSON string, `cg_analysis_enabled=true`, `cg_device_fallback_enabled=true`. Version `clause-analysis-v1`; model `gemini-3.5-flash-lite`. Configuration is cached per app/page; refresh after code changes. Never let remote configuration change raw-text inference mode.

## Review safeguards and limitations

1. Commercial redline guard (`commercial-review-v1`): changes to clauses containing covered commercial vocabulary are withheld, with a local notice added to the explanation. Empty/unchanged redlines can remain. It is conservative and can hold useful edits.
2. Guarantee grounding guard (`guarantee-grounding-v1`): rejects specified unsupported guarantee labels in explanations as `invalid_response`. Neutral questions can ask about unknown terms. This is a lexical check, not general entailment or legal validation; legitimate complex wording may be held.
3. Short unspecified guarantees (`source-quoted-guarantee-v1`): a per-clause schema constrains the explanation to an explicitly application-authored, source-quoted review and questions to neutral choices. The model selects a preliminary risk level; redline is empty. This deliberately limits reasoning/drafting flexibility. Other clauses use the normal guarded path. A provider ignoring the schema is still rejected; bad output is never silently replaced and marked successful.

Do not describe successful schema validation as proof of semantic/legal accuracy. The model has previously confused borrower/lender roles, inferred missing context, and suggested unsupported commercial changes.

## Latest verification

Local targeted tests: 103 passed; TypeScript and production build passed. Inference responses in these automated tests are mocked; some integration tests use the real engine's pattern-only mask/approve/unmask path.

Dhruv's latest REAL Chrome c8 run after updating code:

- `SAMPLE_ROUNDTRIP_COMPLETED`, promissory-note, `ranOn: cloud`, 1/1 succeeded, no failures.
- Source-quoted guarantee review returned without invented unconditional/absolute/future-coverage claims. Risk medium, empty redline, four neutral questions. Local restoration displayed the fixed sample's real values.
- Remote configuration and current review/grounding rules present; diagnostics reported `source-quoted-guarantee-v1`.
- This verifies the targeted short-guarantee path, not all contract reasoning. Stop rerunning c8 solely to get more green results.

Earlier live checks:

- NDA: one 10/10 successful roundtrip.
- Freelance: latest reported full run 9/10, with an invented drafting placeholder rejected. Exhibit A masking was fixed via PR #21; do not conflate that fix with all remaining reliability work.
- Lease: 10/10 validation, but combined tenant identity mapping duplicated a name on restoration. Issue #22 was filed tagging Likhil.
- Offer letter: local masking replaced “Your” with a party token. Issue #23 was filed; cloud analysis was paused.
- SaaS: targeted c5/c7/c8 run passed 3/3 with empty redlines after the review changes. Earlier c4 invented a placeholder and c8 had HTTP 500. Keep this historical evidence rather than claiming every clause is verified.
- Promissory c7: live local drafting notice confirmed redline withholding; it stopped falsely identifying Mr. Mendoza as lender. Subsequent c8 grounding rejection led to the source-quoted generation fix above.

## Next work, in bounded increments

The agreed next area is UI integration, then offline verification—not another open-ended prompt-tuning loop.

1. Inspect current GitHub issues/PRs and UI code. Confirm the UI teammate's current integration; do not assume the earlier masking-only UI has gained cloud analysis. Read issues #8/#10 and current discussions; #22/#23 statuses must be rechecked. Identify the smallest UI integration change and implement/test that increment.
2. Ensure successful results, local draft-withholding notices and rejected clause answers are distinct and usable. Failed clauses must preserve original source for review and must not appear approved. Keep source-based review templates visibly labeled. Do not fabricate risk/results for rejected answers.
3. Integrate/retest Likhil's masking fixes only after checking their current commits. Our sector owns integration checks; ask him only for a narrow engine deliverable if still missing.
4. Verify actual offline fallback and badge behavior in real Chrome. Mocked `on_device` responses are not live proof. Plan a small check, record actual outcome and fail honestly if unavailable.
5. Complete masked network-payload/privacy verification through the real UI. Production Hosting/reCAPTCHA setup and mobile handoff remain separate outstanding milestones. Console helpers alone do not finish the product.

## User workflow and permissions

- At every step, tell Dhruv exactly what HE should do. Clearly distinguish Terminal commands from Chrome Console JavaScript. Say whether to paste commands one by one or an entire block at once.
- Dhruv has authorized pushing useful changes and publishing GitHub issues tagging the teammate whose input is needed. Use that scope without repeated confirmation. Do not merge unrelated work or assume deployment authority beyond the requested task.
- Teammates paste issues into their AI: write self-contained, narrowly scoped prompts with evidence, a small deliverable and clear ownership. Run integration checks yourself where possible. Do not make Likhil's model run broad test matrices for our sector. Split genuinely large tasks into checkpoints.
- Avoid generated images and unnecessary screenshots. Keep updates concise.
- Do not keep rerunning all samples. Select affected clause IDs before masking; review the preview before sending. Avoid repeated model calls to chase a passing output.
- No subagents unless explicitly requested or required by applicable project instructions.

## Useful commands / browser steps

Run from the repo root. Keep the dev server running in its own Terminal tab:

```bash
npm run dev --workspace @clause-guard/web
```

Appropriate targeted verification (broaden only if changes warrant it):

```bash
npm exec --workspace @clause-guard/web -- vitest run src/analysis.test.ts src/analysisConfig.test.ts src/sampleRoundtrip.test.ts src/engineIntegration.test.ts
npm run typecheck --workspace @clause-guard/web
npm run build --workspace @clause-guard/web
```

Chrome at the printed localhost URL: Option + Command + J opens Console. Refreshing clears console variables. Sample helper usage:

```js
var samplesCheck = await import('/src/sampleRoundtrip.ts');
var samplePreview = await samplesCheck.prepareSample('saas', ['c5', 'c7', 'c8']);
console.log(samplePreview.result.clauses.map(c => `${c.id}: ${c.text}`).join('\n\n'));
```

Only AFTER the user reviews the masked preview:

```js
var sampleAnswer = await samplesCheck.runSample(samplePreview, { reviewed: true });
console.log(JSON.stringify(sampleAnswer, null, 2));
```

Do not automatically repeat the sample checks as the first handoff task. Start with current repository/issue inspection and the smallest UI integration increment.
