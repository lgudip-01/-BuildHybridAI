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

## Live guard confirmation and explanation grounding follow-up

Dhruv subsequently reported SaaS c5/c7/c8 completed 3/3 with empty redlines and no failures. Those responses had no local drafting notice, so that run showed the model itself declined replacement wording; it did not exercise the local withholding branch. The following promissory-note c7/c8 run completed 2/2. C7 included the local drafting notice, confirming live withholding. It kept Lender as a role and asked about Mr. Mendoza's identity instead of labeling him the lender. C8 still asserted unconditional, absolute, uncapped liability and coverage of all future obligations. That remained a quality failure despite valid JSON and an empty draft.

### Guarantee explanation policy (guarantee-grounding-v1)

The shared output instructions now distinguish express wording, possible consequences and missing excerpt context. They instruct the model to describe absent caps/conditions as unspecified in this excerpt and put questions about unknown terms in the questions field. They forbid deriving guarantee classification or future coverage from masked identities or the phrase “all obligations under this Note.” Existing Remote Config prompts receive these application-owned rules in updated web code.

After JSON/token validation and before redline triage or unmasking, `validateExplanationGrounding` checks guarantee explanations for these specific labels:

- unconditional/unconditionally;
- absolute/absolutely;
- uncapped/unlimited;
- future obligations/liabilities/debts;
- without limits/limitations/conditions.

If a label occurs in an explanation but not in the source clause, the entire clause answer is rejected as `invalid_response` with a fixed grounding-specific detail. A source containing negation or qualification (for example “not,” “except,” or “subject to”) is conservatively held too, even when it contains the same label. Unknown terms can still be asked about in questions. The rejected rationale and risk rating are not returned as successful analysis. There are no additional AI calls or automatic retries.

This is a limited lexical check for the observed failure family, **not** a semantic/entailment verifier. It can reject legitimate complex wording and does not catch every paraphrase, unrelated error or incorrect role/risk inference. Positive keyword presence is not a guarantee of legal meaning. Native bridge owners must explicitly adopt equivalent post-validation enforcement; updating shared instructions alone does not enforce it on native platforms.

The sample helper adds `groundingPolicy`, `cloudGroundingRulesPresent`, and `deviceGroundingRulesPresent` diagnostics. These report the current configuration and local policy, not proof of model compliance or of a historical network payload.

Verification: 92 targeted tests passed, plus TypeScript and the production build. Regression coverage includes the observed c8 explanation, cloud and device response paths, neutral questions, source-scoped “no cap is stated in this excerpt,” explicit affirmative wording, qualified/negated sources, and validation ordering. No live cloud request was made for this correction.

Next live check: prepare only `prepareSample('promissory-note', ['c8'])`, review the masked preview, then run it once. A grounded response or a visible grounding rejection provides useful evidence; do not repeatedly rerun until green. Broader document-context reasoning remains a separate task.

## Source-quoted guarantee generation

The next live c8 check returned 0/1 results with the grounding-specific rejection. This confirmed the guard operates in Chrome, but did not resolve answer availability: free-form generation still produced a rejected explanation.

For short, otherwise unspecified clauses ending in a guarantee of all Borrower's obligations under this Note/Agreement, generation now uses `source-quoted-guarantee-v1`. The shared `sourceQuotedGuaranteeReview` function builds an explicitly application-authored review explanation that quotes the approved clause exactly and directs review toward obligations, limits, conditions and amendments elsewhere. It does not invent those terms or claim they are absent from the full agreement.

The cloud JSON response schema permits only that explanation string and a fixed set of neutral review questions. The device JSON constraint carries the same restrictions. Both receive a per-clause instruction to follow this format. Risk remains a model-selected preliminary review priority; redline must be empty. Runtime checks still reject schema noncompliance, unsupported guarantee labels, unknown tokens or bad JSON. No rejected answer is silently rewritten into a successful one; there is no automatic retry or extra model call.

This is a deliberately limited, **source-based review template**, not unrestricted AI legal interpretation or proof of risk-rating correctness. The template is visibly labeled in the explanation. Explicit/qualified, long, unrelated or differently worded clauses stay on the normal guarded path; the known lexical guard is still not a general semantic verifier. This change trades drafting/reasoning flexibility for a constrained response on the observed short-guarantee case. It must not be described as fixing every guarantee or every hallucination.

The public five-field response contract remains unchanged. `promptCheck.guaranteeReviewFormat` reports the format revision. Native owners would need to adopt the same per-clause schema selection and validation to get equivalent behavior.

Verification: 103 targeted tests and web TypeScript passed. Tests check the serialized Firebase cloud schema and device constraint at the actual provider boundary, successful bounded responses, rejection when the provider ignores the format, preserved request projection, and normal-path selection for other clauses. These responses are mocked. One real c8 call is still needed to check Gemini's handling of the bounded schema; do not claim live success before that result.
