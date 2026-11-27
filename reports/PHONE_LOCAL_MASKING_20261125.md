# Physical-phone local masking checklist — November 25, 2026

Scope: six existing fictional/public repository text samples, local masking only.
Five runs completed; the sixth (SaaS) stalled at clause 2. No six-pass claim. Exact production
source baseline: combined #60/47e08be; first installed iPhone app is version
1.0/build 1, with local personal signing excluded from shared source.

Completed smoke check: Dhruv reports the separate built-in Acme/Dana sample read
4/4 clauses and replaced 10 values in 7,776 ms with Apple Intelligence still
ready and no sensitive sample values visible. That four-clause sample is not
the ten-clause NDA fixture below and does not count as its acceptance.

## Before each run

1. Use the exact linked .txt fixture, preserving the paragraphs and signature
   line breaks. Replace the built-in text; do not append to it. Confirm the
   displayed clause count matches the table before calling the model. A mismatch
   means input/copy normalization must be fixed before the single test run.
2. Record device/OS, installed source revision, local-model status and test time.
3. Tap Mask contract once. Stop at masked preview. Do not approve analysis/chat.
4. Record the first result, including latency, values replaced, usable model-read
   coverage and review/blocking text. Preserve partial/failure results; no retry
   to erase an observed failure. No model download, payment or service upgrade.
5. Inspect only the masked preview for required sensitive strings, ignoring case.
   Every occurrence of each mask entry must be absent, including aliases in
   uppercase or possessives. Check every keep entry still appears. Never publish
   vault keys/config/tokens or a personal contract; these fixtures are fictional.
6. A model status of ready alone is not completion. Distinguish 0/partial/all
   usable reads and preserve the warning. Do not manually repair the original
   preview before scoring it; a separate reviewed repair can follow afterward.

## Counts from current source

Derived with the actual apps/web/src/clauses.ts splitter and each .json fixture.
Mask-entry totals are required-string checks, not an expected ledger/replacement
count: aliases/repetitions/overlap can change the number of replacements.

| Text fixture | Clauses | Required mask strings | Required keep strings | Physical result |
| --- | ---: | ---: | ---: | --- |
| [nda](../samples/nda.txt) | 10 | 9 | 5 | Mask 9/9; keep 5/5; 21,006 ms |
| [freelance](../samples/freelance.txt) | 10 | 15 | 6 | Mask 15/15; keep 6/6; 18,377 ms |
| [lease](../samples/lease.txt) | 10 | 14 | 5 | Mask 14/14; keep 5/5; 19,321 ms |
| [offer-letter](../samples/offer-letter.txt) | 11 | 10 | 6 | Mask 10/10; keep 6/6; 18,012 ms |
| [promissory-note](../samples/promissory-note.txt) | 9 | 14 | 5 | Mask 14/14; keep 5/5; 17,241 ms |
| [saas](../samples/saas.txt) | 10 | 8 | 8 | Stalled at c2/10; not scored |
| Total | 60 | 70 | 35 | Completed 5/6: mask 62/62, keep 27/27; SaaS unscored |

## nda

Source: [text](../samples/nda.txt), [expectations](../samples/nda.json).
Text SHA-256: 2b84d163407a85f9811b9a28502499ce7c96fdd4ed5a6e2b08e817793e524c51.

Required absent from masked preview (case-insensitive):

- March 3, 2026
- Northwind
- Bellhaven
- Priya Raman
- Tomas Lindqvist
- legal@northwind-analytics.com
- 1180 Harbor Boulevard
- 94607
- (415) 555-0142

Required retained in masked preview:

- Delaware
- Confidential Information
- Receiving Party
- 3 years
- General Counsel

- [x] Exact input / 10 clauses confirmed before masking.
- [x] First run result and read coverage recorded.
- [x] All 9 required mask checks scored; exact misses recorded.
- [x] All 5 required keep checks scored; exact losses recorded.
- [x] No approval/cloud send; evidence source and limitations stated.

Observed result: one actual local masking run, 8 values replaced in 21,006 ms.
Input header confirmed 10 clauses before inference. All 9 mask checks pass
across all occurrences, including uppercase aliases/possessives and signatures;
all 5 keep checks pass. Entire c1–c10 preview was directly inspected through
user-authorized iPhone Mirroring. Stopped at the still-unpressed Approve & analyze
button. No cloud analysis requested. Apple Intelligence ready before the run.

Read coverage: 10/10 is inferred from successful green output with no review
warning plus the reviewed engine: useModel=false or any failed read sets
needsReview=true. Progress reached clause 10. This is source-derived coverage
from observed UI, not a directly instrumented modelReadClauses export.

Additional classification finding (outside the masking checklist): 8/10 match
the JSON fixture's allowed types. c2 was confidentiality (expected other);
c7 Remedies was confidentiality (expected liability or other). Preserve both
first-run disagreements for engine/fixture-owner review; no inference retry.
Evidence images saved locally: clause preview middle/tail and review stop under
/private/tmp/clauseguard-iphone-nda-*.png. No personal phone screen is published.

## freelance

Source: [text](../samples/freelance.txt), [expectations](../samples/freelance.json).
Text SHA-256: f329395fd985db076f7f3ae6017fb3f268c047cad52833ea954941e5c3be3e9c.

Required absent from masked preview (case-insensitive):

- 2 February 2026
- Larkspur
- Okonkwo
- Adebayo
- Hannah
- Kowalczyk
- 77 Willow Lane
- 78704
- $95
- $38,000
- okonkwo.adebayo@fastmail.com
- 004417829316
- 111000614
- DE89 3704 0044 0532 0130 00
- 47-3920185

Required retained in masked preview:

- Client
- Contractor
- 15 days
- 14 days
- work made for hire
- Exhibit A

- [x] Exact input / 10 clauses confirmed before masking.
- [x] First run result and read coverage recorded.
- [x] All 15 required mask checks scored; exact misses recorded.
- [x] All 6 required keep checks scored; exact losses recorded.
- [x] No approval/cloud send; evidence source and limitations stated.

Observed: 12 replacements in 18,377 ms, green success, 10 input clauses and
10/10 usable reads inferred by the same source invariant as NDA. All 15 sensitive
checks absent across complete c1–c10 preview; all 6 keep terms retained.
Classification comparison: 7/10 fixture matches; c1 governing_law vs other,
c5 other vs payment, c6 payment vs ip. First result preserved, no retry or
cloud approval. Screenshots saved locally under freelance-head/middle/tail.

## lease

Source: [text](../samples/lease.txt), [expectations](../samples/lease.json).
Text SHA-256: 3b2888f6ff8a2f6f137f771fad991e40efa821a1025069f088c12d202efdbe29.

Required absent from masked preview (case-insensitive):

- 15th day of January, 2026
- Margaret
- O'Connell
- Wei Zhang
- Lucia Fernandez
- 2210 Cedar Avenue
- 97214
- February 1, 2026
- January 31, 2027
- $2,150
- $75
- Two Thousand One Hundred Fifty Dollars
- (503) 555-0187
- margaret.oconnell@gmail.com

Required retained in masked preview:

- Landlord
- Tenants
- 5 days
- 21 days
- Oregon

- [x] Exact input / 10 clauses confirmed before masking.
- [x] First run result and read coverage recorded.
- [x] All 14 required mask checks scored; exact misses recorded.
- [x] All 5 required keep checks scored; exact losses recorded.
- [x] No approval/cloud send; evidence source and limitations stated.

Observed: 12 replacements in 19,321 ms; exact 10 input clauses, green success
and inferred 10/10 usable reads. All 14 sensitive checks absent and all 5 keep
terms retained across c1–c10. Classification: 8/10 fixture matches; c1 title and
c8 Pets both governing_law vs expected other. No retry or cloud approval.

## offer-letter

Source: [text](../samples/offer-letter.txt), [expectations](../samples/offer-letter.json).
Text SHA-256: 4865fce3bd5e87dd891c1a39224e72ef3135855fb1f546c5992ac54fc8ceffca.

Required absent from masked preview (case-insensitive):

- Samuel Osei
- Quillfeather
- Anika
- Bose
- April 6, 2026
- $148,000
- recruiting@quillfeather.io
- March 20, 2026
- +1 646-555-0193
- QF-20418

Required retained in masked preview:

- the Company
- Senior Data Engineer
- 15%
- 12 months
- 4 years
- United States

- [x] Exact input / 11 clauses confirmed before masking.
- [x] First run result and read coverage recorded.
- [x] All 10 required mask checks scored; exact misses recorded.
- [x] All 6 required keep checks scored; exact losses recorded.
- [x] No approval/cloud send; evidence source and limitations stated.

Observed: 11 replacements in 18,012 ms; exact 11 input clauses; visible warning
explicitly says the model returned a usable read of every clause (11/11). Review
remains required for names. All 10 sensitive checks pass, all 6 keep terms remain;
all 11 clause labels match allowed fixture types. Stop at local preview; no retry
or cloud approval. Additional redactions outside the fixture keep list: the
generic document title Proprietary Information and Inventions Agreement became
NAME_1, and the 12,000 share count became AMOUNT_2. Preserve these for human
assessment rather than hiding them behind the required-check pass.

## promissory-note

Source: [text](../samples/promissory-note.txt), [expectations](../samples/promissory-note.json).
Text SHA-256: 556ed75da1c2fe8844fad2b72eed79f0b45ed12c458dfaaa9f096f84ed66ea53.

Required absent from masked preview (case-insensitive):

- $25,000.00
- June 12, 2026
- Rafael
- Mendoza
- Isabel
- Coastal Ridge
- Twenty-Five Thousand Dollars
- $489.15
- 1st day of August, 2026
- 3301 8842 0067
- 322271627
- 509 Juniper Court
- 95818
- 621-48-3307

Required retained in masked preview:

- Borrower
- Lender
- 6.5%
- 10 days
- without penalty

- [x] Exact input / 9 clauses confirmed before masking.
- [x] First run result and read coverage recorded.
- [x] All 14 required mask checks scored; exact misses recorded.
- [x] All 5 required keep checks scored; exact losses recorded.
- [x] No approval/cloud send; evidence source and limitations stated.

Observed: 13 replacements in 17,241 ms; exact 9 input clauses, green success,
9/9 usable reads inferred by engine invariant. All 14 sensitive checks absent;
all 5 keep terms retained across c1–c9. All 9 clause labels match allowed fixture
types. No retry/cloud approval. Co-reference observation: Mr. Mendoza becomes a
distinct PARTY_C, while Rafael is PARTY_A and Isabel PARTY_D; this masking pass
does not establish surname/role resolution or guarantee-analysis correctness.

## saas

Source: [text](../samples/saas.txt), [expectations](../samples/saas.json).
Text SHA-256: 5c89f904df5fe8d1cc329fe8714f718443a327fb4924d1f3b15d2d7121bf8669.

Required absent from masked preview (case-insensitive):

- 2026-05-01
- Halcyon
- Verdant
- EUR 84,000
- Johanna Weiss
- dpo@halcyon-cloud.de
- Stefan Brandt
- Eline de Vries

Required retained in masked preview:

- Provider
- Customer
- GDPR
- 99.9%
- 36 months
- 90 days
- Netherlands
- Amsterdam

- [x] Exact input / 10 clauses confirmed before masking.
- [ ] First run result and read coverage recorded.
- [ ] All 8 required mask checks scored; exact misses recorded.
- [ ] All 8 required keep checks scored; exact losses recorded.
- [x] No approval/cloud send; evidence source and limitations stated.

First-run failure: Apple Intelligence ready and exactly 10 input clauses were
confirmed. Masking then remained at Reading clause 2 of 10 across the phone's
4:05–4:07 PM clock observations. No completed preview, latency/replacement count,
mask/keep score or classification score is available. No retry/restart was used
to replace this evidence. Saved /private/tmp/clauseguard-iphone-saas-stall-20261125.png.

NativeBridge.onDevice directly awaits Native.onDevice; the Swift onDevice path
also awaits Foundation Models without a caller deadline. A never-settling reply
can keep ReviewSession.mask busy indefinitely. This is a first-priority liveness
follow-up, ahead of classification polish. Any candidate recovery check must be
recorded separately from this original failed run.

## Result record (one per sample)

```text
Device / actual OS / app version / production source SHA:
Fixture and exact input clause count:
Local model before / after:
Latency (ms) / values replaced:
Usable model reads / total clauses:
Review-required or blocking message:
Mask checks passed / total; exact leaked strings if any:
Keep checks passed / total; exact lost strings if any:
Evidence: user phone observation / captured UI / instrumented (specify):
Cloud approval or analysis triggered: must be no for this protocol
Unexpected failure / incomplete check:
```

This protocol cannot establish classification or legal-analysis quality because
it does not call cloud analysis or score model explanations. It also does not
prove App Attest/Play Integrity, Android local-model support, native chat, network
isolation or final-main/Hosting acceptance. Offline behavior is a separate gate.

## Classification observations (completed samples only)

These are first-run UI labels compared with the unchanged JSON expectations,
not legal-analysis scores. 43/50 labels match; 7 do not. SaaS is unscored.

| Sample / clause | Observed | Fixture allows |
| --- | --- | --- |
| NDA c2 | confidentiality | other |
| NDA c7 Remedies | confidentiality | liability or other |
| Freelance c1 title | governing_law | other |
| Freelance c5 Payment Details | other | payment |
| Freelance c6 Ownership | payment | ip |
| Lease c1 title | governing_law | other |
| Lease c8 Pets | governing_law | other |

Current TYPE_RULE already directs titles/preambles/signatures to other and main
subject over incidental words. Preserve these failures for owner review instead
of simply claiming that instruction was absent or relaxing expected labels.


## Separate SaaS candidate recovery check — November 27, 2026

This does not replace the original November 25 SaaS stall or convert the original
six-fixture first-run matrix to six passes. One new run followed a concrete
caller-deadline/batch-stop fix, rebuild, install and restart. Production candidate:
03371e1090e33a2ff29af12ad4d68870683579b0, PR #67, stacked on #61/5f340f7.

Readiness rechecked before inference: physical iPhone 16 Pro Max connected;
Firebase Console Spark/no-cost and Cloud Billing explicitly no linked account;
AI Logic Basic Enforced, replay off; native release providers remain unregistered.
Apple's official on-device Foundation Models pricing remains free:
https://www.apple.com/newsroom/2025/09/apples-foundation-models-framework-unlocks-new-intelligent-app-experiences/
Swift raw reads still instantiate local LanguageModelSession, with no cloud path.
No payment, provider activation, token registration or cloud approval.

Signed Debug build succeeded with the existing approved free Personal Team.
Deep/strict signature verification passed. Bundled private Firebase plist equals
local source; logging remains none; every built web asset equals the web dist
output. Private config remains ignored; tracked signing/project files unchanged.
CoreDevice independently confirmed install and launch. User completed protected
Keychain and existing Mirroring authentication; no credentials were handled here.

Exact unchanged saas.txt copied from TextEdit; preview input count verified 10 and
Apple Intelligence ready. One actual Mask contract activation observed at clause
1/10, then clause 8/10. Completed in **20,463 ms**, **9 values replaced**. Banner
explicitly says the model returned a usable read of every clause, with names
still requiring confirmation. This run did NOT exercise the timeout branch.
The never-settling regression proves the caller deadline; phone cancellation or
root-cause elimination is not established by this successful run/restart.

Direct preview inspection across c1–c10:
- Required mask checks **8/8**: date, Halcyon (including Fleet and signatures),
  Verdant, EUR 84,000, Johanna Weiss, email, Stefan Brandt and Eline de Vries are
  replaced by placeholders. No required value observed in the preview.
- Keep checks **8/8**: Provider, Customer, GDPR, 99.9%, 36 months, 90 days,
  Netherlands and Amsterdam remain.
- Types **6/10** match fixtures. New disagreements: c1 title governing_law vs
  other; c2 opening governing_law vs other; c3 Subscription non_compete vs ip|other;
  c5 Service Levels governing_law vs other|payment. c4 payment, c6 confidentiality,
  c7 liability, c8 termination, c9 governing_law and c10 other match.

This is local-only masking/content inspection, not cloud/legal-analysis quality
or a network-payload audit. The original five passes plus this separate candidate
result cover all required fixture mask/keep strings across mixed revisions, not
a new same-revision six-fixture acceptance. Original seven classification
disagreements remain; four additional ones require engine-owner review.

Screenshots retained locally: clause-count/readiness, candidate preview head
(banner/timing/c1–c5) and tail (c6–c10). Phone stopped at preview, before Approve &
analyze. No broad retry, cloud analysis or extra model generation. iOS input
auto-zoom caused horizontal clipping after editing; separate mobile UI follow-up.
