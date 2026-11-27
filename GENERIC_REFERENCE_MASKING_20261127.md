# Generic references and explicit name aliases — November 27, 2026

- Base: #69/59b55339cf1af79b40990ef55021fd465b439ceb. #66 shared-name fix and
  #69 question-grounding changes are preserved. No main merge or deployment.
- Scope: unnecessary redaction observed in #68 and the physical-phone report,
  plus privacy counterexamples discovered while testing the proposed exemption.

## Changes

- Context ranges preserve Purpose when locally established as `(the "Purpose")`,
  and its `the Purpose` references, instead of globally excluding the word.
- Standard agreement captions require a preceding document action such as sign,
  execute or review, and are preserved only when their complete wording
  consists of descriptive contract vocabulary. Proper stems in privately named
  agreements remain sensitive. No blanket exemption for titles ending Agreement.
- The same ranges filter both pattern-derived spans and model-reported entities.
  A model value is ignored only when all its mentions in the supplied text are
  covered by those ranges. Independent name mentions retain conservative masking.
- Genuine names such as Purpose Inc., Purpose Labs LLC and a company whose full
  name resembles a descriptive agreement title remain masked. Shared private
  aliases can still mask a generic occurrence; privacy takes priority in that
  ambiguity, rather than automatically revealing text.
- Countertesting found that explicit non-prefix aliases could remain raw. A
  directly adjacent quoted definition now binds an alias to the actual named
  entity, including acronyms. It does not bind unrelated quoted project terms.
- Duplicate acronym aliases remain ambiguous in chat; no company is selected.
- Explicit aliases are restored after coordination of a surviving whole name;
  an alias of a group split into separately identified people blocks analysis,
  rather than being assigned to either person or silently lost.
- If an explicit private-name alias also equals ordinary contract vocabulary
  (e.g. company alias AS versus the word as), the document is blocked for
  clarification. Ignoring it could leak the alias; replacing all ordinary uses
  could distort the source. Established non-identifying role aliases remain
  readable. The blocked result cannot become an approved analysis batch.
- Approval identity, revision invalidation, leak checks, encrypted vault and
  restoration remain in the existing engine path. No cloud dispatch is added.

## Verification

- Eleven new real-mask cases cover model/pattern reference retention, private-name
  counterexamples, descriptive-looking companies, explicit aliases and restored
  identity. Nine fail against the previous source; two privacy counterexamples
  already pass there. Fixed source passes all eleven, including group-alias
  blocking and readable uppercase role labels.
- Twelve fixture integration cases replay all six public samples with patterns
  only and with synthetic model entities reproducing the generic-reference
  mistakes: all required sensitive strings masked (70/70 per mode), all required
  useful terms retained (35/35 per mode). NDA purpose and offer standard-caption
  text also remain readable. No fixture expectation was changed.
- Two further integration cases verify shared-acronym chat ambiguity and blocking
  an ordinary-word alias; no model or analysis invocation in those cases.
- **627 web/engine tests**, core/engine/web typechecks, production build and
  whitespace checks pass. No dependency or lockfile changes.
- All model responses in the new tests are explicit synthetic replays. No new
  genuine Nano/Apple/cloud call, broad sample retry or runtime quality claim.

## Classification investigation

- Existing TYPE_RULE already instructs title/opening/signature blocks to use
  other and to classify by main subject rather than passing words.
- Original web disagreements remain NDA c2 confidentiality vs other and
  freelance c6 Ownership payment vs ip. Eleven physical-phone disagreements
  remain separately recorded across original and recovery revisions.
- No keyword-based relabeling or fixture relaxation was introduced. An ownership
  clause can mention payment as a condition, and an opening can contain operative
  terms; a broad override risks new errors. Existing cloud review on the same
  source remained factual despite those local hints.
- Next independent increment: a classification-specific replay/evaluation plan
  with engine-owner review of structural cases and subject rules. This masking
  candidate does not claim those semantic labels are corrected.

## Limits and next gate

- These are bounded English reference forms, not general document-title or
  identity understanding. Unknown/ambiguous forms remain conservatively masked
  or blocked. References split across chunks/clauses may lack local definition
  context. Literal private names sharing a generic alias can still overmask.
- Explicit definitions are recognized from directly adjacent quoted parentheses.
  Other definition styles/acronyms need separate evaluation; no universal recall
  claim. Common-word alias blocking may withhold a valid document.
- Engine review/adoption is required, then a bounded genuine local-model check
  on the concrete accepted revision. No automatic inference retry.
- Carry #56 banner correction and #60/#61/#67 native work during coordinated
  adoption. Corrected-main acceptance and Hosting remain separate gates.
- No private config, credentials, personal signing data, generated build, billing,
  paid service, API, attestation or server Remote Config change in this work.
