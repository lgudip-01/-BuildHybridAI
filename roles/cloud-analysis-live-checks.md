# Live cloud analysis checks — November 18, 2026

These observations come from Dhruv's Chrome runs on fixed repository samples.
`SAMPLE_ROUNDTRIP_COMPLETED` means response shape, placeholders and local restoration completed; it does not certify semantic accuracy or legal correctness.

| Sample | Observed outcome | Remaining finding |
| --- | --- | --- |
| NDA | One run completed 10/10 | Earlier invented drafting blanks were rejected; one successful run is not a reliability benchmark. |
| Freelance | Latest reported run completed 9/10 | c9 introduced `[insert title]`, correctly rejected. Exhibit A/name boundary fix restored the intended c3 input. |
| Lease | Completed 10/10 | Combined tenant identity reused at individual signature; duplicated Lucia on restoration. Engine issue #22. |
| Offer letter | Preview only | “Your” became a party token in c3/c4/c8. Engine issue #23. Hold cloud test until corrected. |
| Promissory note | Completed 9/9 | c7 called Rafael Mendoza the Lender although the original defines him as Borrower. c8 added unconditional/prompt-performance language to its proposed guaranty. The masked response was not captured, so do not assert the exact source of the role misassignment. |
| SaaS | Completed 10/10 | c5 added an exclusive-remedy restriction without a represented-party decision; c7 questioned mutuality despite “each party,” and changed paid fees to paid-or-payable fees; c8 added convenience termination without agreement on that commercial choice. |

## Focused cloud correction

Shared application-owned review rules now instruct both cloud and device analysis to:

- Stay neutral when the represented party is unknown.
- Preserve explicit role words; do not infer a placeholder-to-role relationship from its token or other-clause inventory.
- Ask about commercial decisions rather than silently choosing exclusive remedies, broader obligations, different liability calculations or termination rights. Leave the redline empty when those decisions are needed.
- Distinguish a clause-level omission from a confirmed whole-contract omission.

The rules are part of `ANALYSIS_OUTPUT_RULES`, so the web Remote Config parser appends them to previously published prompts. No Remote Config console edit is needed to activate this change in an updated web build. Native consumers must adopt the updated shared contract in their prompt construction; updating web code alone does not update native binaries.

## Verification and remaining work

The focused analysis/config tests (51) and web TypeScript check passed. A provider-boundary test verifies both inference providers receive the current constraints with older remote prompts. This is mocked verification of instruction delivery, not evidence that Gemini follows every instruction.

No paid/cloud benchmark or repeated live sample run was performed for this correction. After the code is updated, first retest SaaS and inspect c5/c7/c8; then the promissory note c7/c8. Preserve any failures as evidence instead of rerunning until green. Keep existing schema/placeholder checks unchanged. Engine fixes in #22/#23 require their own targeted preview retests.

The current helper sends clauses individually; the model does not receive the document's complete role definitions. Reliable cross-clause reasoning remains a separate bounded task. It must use approved masked text only, and must not expose the local replacement map or assume aliases are equivalent.

## Follow-up: prompt alone did not resolve SaaS drafting

The next live SaaS run completed 8/10 clauses: c4 was rejected for an unknown placeholder and c8 failed with an HTTP 500/model error. C5 still added scheduled-maintenance exclusions and an exclusive remedy. C7 returned an empty redline and no longer questioned the explicit mutual wording. Do not describe this run as a semantic pass or the prompt as a complete fix.

### Local guard (commercial-review-v1)

`applyCommercialRedlineGuard` in the shared core is applied by the web analyzer **after** JSON/placeholder validation and **before** restoration. If replacement wording differs beyond whitespace, and either the original or proposed clause contains the listed commercial terms (fees/payments, liability, indemnity, guarantees, remedies/availability, termination/renewal, restrictive covenants, assignment/ownership), the redline is withheld. A local drafting notice is prepended to the explanation; risk and questions remain unchanged. Empty and unchanged drafts remain accepted.

This deliberately holds back useful edits too. It does not certify the correctness of explanations, roles, risk ratings, or drafts outside the covered vocabulary; it is not a general semantic/legal verifier. Unknown placeholders are still rejected even if the draft would otherwise be withheld. No additional AI request or automatic retry is introduced. Native bridge owners can reuse this shared policy or implement its equivalent before restoration; web enforcement alone does not update native bridges.

### Small live retest

The dev helper now accepts clause IDs selected **before** real masking and approval:

```js
var samplesCheck = await import('/src/sampleRoundtrip.ts');
var samplePreview = await samplesCheck.prepareSample('saas', ['c5', 'c7', 'c8']);
console.log(samplePreview.result.clauses.map(c => `${c.id}: ${c.text}`).join('\n\n'));
```

Review the preview before proceeding:

```js
var sampleAnswer = await samplesCheck.runSample(samplePreview, { reviewed: true });
console.log(sampleAnswer);
console.log(JSON.stringify(sampleAnswer.failed, null, 2));
console.log(JSON.stringify(sampleAnswer.restored, null, 2));
console.log(sampleAnswer.promptCheck);
```

This sends three clauses rather than ten. `promptCheck` reports whether the current review rules are present in the same cached configuration used by the bridge, plus model/config source and local policy revision. It does not prove what a previous browser request sent or whether a model followed the rules. This subset check also does not replace a whole-document role/context evaluation.

Verification: 76 targeted tests passed across analysis, Remote Config, real engine integration, and the sample helper; web TypeScript check passed. The new sample tests use the real engine's pattern-only mask/approve/unmask path with mocked cloud responses, including stale-preview rejection. No live cloud call has yet been made for this guard.
