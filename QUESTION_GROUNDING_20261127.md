# Analysis question grounding and shared-name chat follow-up

- Base: Likhil's #66, d7b53dab30da448f454f12eb729abc4d5e997633, directly on
  actual main 1ac26a957587ab214d76b7613096bb3935d0f3a2. His two changed files
  are carried unchanged. No main merge, teammate-ref overwrite or deployment.
- Earlier exact-main six-fixture acceptance and first content failures remain
  recorded separately in #68 / MAIN_ACCEPTANCE_20261127.md.

## Likhil's reported error

- Issue #13: https://github.com/lgudip-01/-BuildHybridAI/issues/13#issuecomment-7216287195
- Bare Halcyon could select the Halcyon Fleet product token instead of the
  Halcyon Cloud Systems GmbH provider token with Nano. No raw value leaked, but
  analysis/restoration could refer to the wrong entity.
- #66 adds every matching name token to an existing one-word alias. Ambiguous
  short forms are refused; a full provider name keeps its correct token.
- Independently reproduced: original-main chatSnapshot.ts fails Likhil's
  regression by returning the product token. Restored #66 source passes;
  582 baseline web/engine tests and engine typecheck pass.
- Public approval: https://github.com/lgudip-01/-BuildHybridAI/pull/66#pullrequestreview-6092477629
- Likhil's nine real-Nano checks are credited separately; no duplicate broad
  model run was performed here. The fix is in this candidate and #66, not live.

## Question grounding implementation

- New question-grounding-v1 shared prompt rules preserve stated facts, allow
  zero questions, avoid invented asymmetry and broad unsolicited renegotiation,
  and distinguish excerpt omissions from contract-wide omissions.
- Rules accompany cloud/device defaults and the existing app-owned output rules
  appended to remote prompt overrides; no Remote Config server change.
- Shared runtime guard rejects otherwise well-formed answers containing the
  observed unsupported question premises: role-based disclosing-party relief
  framed as one-sided in a mutuality contrast; asking what a stated geographic
  scope is; asking what the stated late-payment threshold is.
- Rejection uses invalid_response and a fixed application explanation. It does
  not silently edit model output, replace questions with templates, or retry.
- Existing approval, placeholder/schema, factual explanation, draft withholding
  and confirmed-source requirements remain. Shared guards apply to both web
  cloud and device responses. Native integration still requires its separate
  candidate adoption; this main-based branch does not enable native analysis.
- Diagnostics expose the question policy version separately from grounding-v5.

## Verification

- Eight captured-failure regressions (four answers x cloud/device) fail before
  the implementation, while ten supported/open questions pass. Fixed source
  passes those plus two further counterexamples: a defined Term is not a
  geography; asking about exceptions to stated geography remains allowed.
- **602 web/engine tests**, three typechecks, configured production build and
  whitespace checks pass. No dependency/lockfile change.
- Existing private local/production environment copied locally and ignored;
  no config, credentials, personal signing data or generated build uploaded.

## One bounded candidate UI check

- Fresh prerequisites: Cloud Billing explicitly no linked account; Spark;
  AI Logic Basic Enforced/replay off; existing localhost token acquisition passed.
  Official gemini-3.5-flash-lite standard text free-tier pricing rechecked.
  Current model daily quota showed 73/500 before this three-call batch.
- One three-clause public-excerpt document: NDA c7 remedies, offer c6
  non-competition, lease c5 rent. Exact source wording copied from repository
  fixtures, separated into three clauses. This is not a full-fixture rerun.
- Locally masked once; exact preview checked before one Approve & analyze:
  BELLHAVEN, $2,150 and $75 replaced; role words, United States, 12 months and
  five-day threshold retained. Preview reported 18,533 ms and three replacements.
- **3/3 validated, 0 need review; each card says Analyzed in cloud**. Restored
  BELLHAVEN and amounts are correct; no replacement wording proposed.
- Remedies explanation preserves permission to seek relief. Questions ask about
  role applicability and procedural requirements, rather than proposing to make
  relief mutual from an asserted one-sided premise.
- Non-compete explanation retains United States/12 months; questions concern a
  competitor definition elsewhere and compensation, not an undefined geography.
- Rent explanation retains rent/fee and five-day trigger; questions concern
  additional procedures elsewhere and payment methods. Original captured exact
  bad answers remain rejected by regressions, independent of this new output.
- No inference retry, quota increase, paid provider, security change or deployment.

## Limits and next gate

- These are narrow lexical replay guards and prompt improvements, not semantic
  entailment or legal verification. Geography detection is limited to explicit
  proper-name scope phrases in relevant wording; timing detection covers the
  observed numeric late-payment forms. Paraphrases outside those patterns may
  still pass. Valid nuanced questions may be conservatively rejected.
- Broader or repetitive questions can remain. The candidate still asks whether
  the remedies role applies to either party and whether extra grace/time-of-day
  procedures exist elsewhere. Do not call this general perfect question quality.
- Known main UI issue observed: review-required masking is labeled patterns-only
  despite ready Nano/type output. #56 already corrects this in the #54/#60 stack;
  preserve that fix during adoption instead of duplicating it here.
- Generic Purpose/agreement-title redaction and web/phone clause classification
  findings remain separate engine work. No fixture expectation was relaxed.
- [x] Review #66 and preserve its ownership; implement grounded-question candidate.
- [x] Negative controls, regressions, full checks and one bounded UI check.
- [ ] Owner review/adoption of #66 plus this stacked follow-up.
- [ ] Reconcile approved #60/#61/#67 stack, including #56 banner correction.
- [ ] Remaining engine quality findings; exact corrected-main acceptance and
  Hosting release only after those gates and fresh no-cost verification.
- [ ] Physical native cloud/attestation, Android model readiness, native chat,
  extension and video/submission remain separate.

## Newly credited teammate work

- Likhil confirmed #18 PDF/DOCX import on actual main: all twelve fixtures split
  identically and pass 70/70 masking and 35/35 retention with patterns. Closed #18
  is credited; no duplicate import run requested.
- Likhil also reviewed main's chat ticket/context authority in #13. Approval,
  one-use turns, remask/deletion invalidation and immutable history remain intact.
