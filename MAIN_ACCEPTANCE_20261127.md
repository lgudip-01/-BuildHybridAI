# Exact-main web acceptance — November 27, 2026

Runtime/privacy/restoration matrix complete. Content quality gate remains open;
this is not a perfect-content or general legal-accuracy pass. No new deployment.

## Revision and prerequisites

- Actual owner-merged origin/main: **1ac26a957587ab214d76b7613096bb3935d0f3a2**
  (#50), isolated unchanged worktree. Complete tree matches reviewed accdd41.
- Clean lockfile installation; **402 web + 179 engine = 581 tests** pass,
  core/engine/web typechecks, nine mocked Firebase checks and build pass.
- Existing private web/production configuration copied locally and kept ignored.
  No source, dependency, server Remote Config or security setting changed.
- Fresh Console checks: Spark/no-cost; Cloud Billing explicitly no linked account;
  Firebase AI Logic Basic Enforced, replay off; Gemini Developer API enabled;
  Agent Platform API not enabled. Web registered; native release attestation
  remains separate and unregistered.
- Official pricing verified for standard gemini-3.5-flash-lite text input/output:
  free tier, no payment method/billing account. No tools, paid quota or trial.
- Actual Cloud Console model quotas before testing: free-tier 500 requests/day,
  13 used; 15 requests/minute, 0 current; 250,000 input tokens/minute, 0 current.
  Usage is observational, not a guaranteed reservation.
- Verified existing localhost App Check token acquisition. 127.0.0.1 failed
  verification and was not used for cloud inference. Its initially slow NDA
  local preview eventually completed and was preserved unapproved. Switched to
  the existing registered localhost origin; no new debug token was registered.
- Vite acceptance mode: loopback port 5173, no HMR/WebSocket reconnect.

## Six fixed public samples

Each full sample was locally masked, every exact preview inspected, then approved
once through the existing diagnostic UI. Batches were sequential, at least 60
seconds after the preceding completion observation; no inference retries, model
switches or fixture changes. Source confirmed by runtime SDK response.

| Sample | Cloud validated | Required mask | Required keep | Type matches |
|---|---:|---:|---:|---:|
| nda | 10/10 | 9/9 | 5/5 | 9/10 |
| freelance | 10/10 | 15/15 | 6/6 | 9/10 |
| lease | 10/10 | 14/14 | 5/5 | 10/10 |
| offer-letter | 11/11 | 10/10 | 6/6 | 11/11 |
| promissory-note | 9/9 | 14/14 | 5/5 | 9/9 |
| saas | 10/10 | 8/8 | 8/8 | 10/10 |
| Total | **60/60** | **70/70** | **35/35** | **58/60** |

All six returned failed=[], confirmed cloud source and no unresolved placeholders
in restored output. All 60 drafts were empty under the conservative
drafting policy; this is not successful generated replacement wording.
50 general clause reviews, nine clearly labeled application-authored source-based
signatory reviews, one clearly labeled source-based guarantee review.

All runs used application defaults clause-analysis-v3, gemini-3.5-flash-lite,
commercial-review-v4, explanation-grounding-v5 and source-quoted signatory/guarantee
v1. Prompt diagnostics confirm instruction presence, not model obedience.

## Content review and remaining defects

- NDA: mutual purpose, party-specific survival, separate notice channels and
  permission to seek relief are factual in the explanations. The model masked
  the second occurrence of the generic defined term `the Purpose` as ORG_1.
  The restored purpose explanation is accurate, but this extra redaction is
  unnecessary. c7 asks whether injunctive relief should be mutual “rather than
  applying only to the disclosing party”; either party may be the discloser.
  That question misleadingly frames the role-based provision as asymmetric.
- Freelance: payment-conditioned ownership, reporting and termination authority
  remain accurately stated. c6 Ownership is mislabeled payment instead of ip.
  Some questions ask for information supplied elsewhere in the contract.
- Lease: start/end dates, rent, grace period, deposit return and notice contacts
  restored correctly. Questions about the grace period and late-fee cap are
  redundant with stated terms; governing-law question is broad negotiation advice.
- Offer: stated United States scope, 12-month duration and mutual at-will ending
  remain accurate in explanations. Non-compete question redundantly asks for
  geographic scope. Generic Proprietary Information and Inventions Agreement
  title is additionally redacted and then restored; review warning is shown.
- Note: principal/rate/installments, debit instructions, no-penalty prepayment
  and acceleration threshold preserved. Mr. Mendoza remains distinct, with an
  explicit identity-confirmation question rather than an invented co-reference.
  Grace-period question partly repeats the stated 10-day threshold. Guarantee
  and printed-identity blocks remain labeled source-based rather than execution
  evidence.
- SaaS: user limit, fees/interest, availability/credit, GDPR contact, mutual cap
  exception, renewal and exclusive forum accurately explained. Some questions
  remain broad negotiation suggestions.
- Second classification mismatch: NDA c2 opening is confidentiality vs other.
  Do not relax fixture expectations to hide either disagreement.

No unsupported legal enforceability conclusion was observed in explanations.
Risk labels remain preliminary priorities. Clause-local prompts do not see the
whole contract; repetitive cross-clause questions are not missing contract facts.
The misleading NDA question and generic-term overmasking prevent a clean content
acceptance claim despite all runtime/privacy checks passing.

## Hosting verification

Existing public URL: https://clause-guard-hackathon.web.app/
Hosted HTML references `/assets/index-_zRnRsvX.js`; independently downloaded
script is byte-identical to the configured exact-main build:
`6a1976538f14f28082d1a32dcb94c7777e9d300c7cf07d0ccc0540744edba9c2`.
Production build contains only index.html; development diagnostic HTML excluded.
Existing CLI authentication and intended Hosting site independently verified.
Official Spark Hosting documentation confirms stop/disable at quota rather than
billed overages without Blaze. No new Hosting release or hosted model call was
made. Existing matching Hosting is preserved while content findings are fixed.

## Next increment

- [x] Freeze/inspect actual merged main; complete six-sample runtime/privacy check.
- [x] Preserve first results, source, restoration, drafting limits and content errors.
- [ ] Cloud owner: strengthen question grounding using these captured failures;
  retain useful supported questions and avoid sample-specific templates. Prove
  demonstrated defects with meaningful regressions before a bounded new check.
- [ ] Engine owner: review generic Purpose/agreement-title overmasking and the two
  web type mismatches, separately from the eleven physical-phone disagreements.
- [ ] Accept corrected content on its concrete revision; owner adoption into main,
  fresh no-cost/attestation check, then Hosting release and browser acceptance.
- [ ] Native #60/#61/#67 adoption, physical cloud/attestation, Android model readiness
  and native chat acceptance remain separate; this web matrix does not close them.

Public-fixture preview/result JSON captures and computed summary retained locally.
No real contract, token, private config, signing setting or model reply containing
non-public user data is included here.

Sources checked November 27:
- https://aistudio.google.com/docs/pricing#gemini-3.5-flash-lite
- https://firebase.google.com/docs/ai-logic/pricing
- https://firebase.google.com/docs/hosting/usage-quotas-pricing
