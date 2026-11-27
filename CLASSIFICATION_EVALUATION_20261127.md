# Bounded local classification evaluation — November 27, 2026

## Change and scope

Candidate based on #70/f833dc3a78f4e0c7967dc14493505ad1f686edaa;
main remains 1ac26a957587ab214d76b7613096bb3935d0f3a2. No new review
comments on #70. Existing #66/#69/#70 changes are preserved unchanged except
for the deliberately extended classification instructions in onDevice.ts.

The original prompt already specified main subject and structural `other`, but
only enumerated category names. `clause-type-v2` adds short category definitions
and distinguishes work-product ownership conditioned on payment, product-use
permissions, and generic remedies. Both joint entity/type reads and classify-only
use the same rule. The model's actual label is retained: no keyword override,
post-hoc relabeling, fixture change, schema change or retry.

The diagnostic is development/loopback-only, absent from production output. It
loads fixed public sample text and existing expected labels, limits the cohort
to 17 unique clauses of at most 2,000 characters, and runs the real joint reader
sequentially through WebBridge's ONLY_ON_DEVICE path. No analyze() call exists.
It stops on an invalid response/error, a 60-second caller read deadline or a
three-minute total dispatch deadline. Caller timeout cannot cancel SDK work;
a stopped page cannot dispatch another run. Reports contain category/timing and
entity count, not raw text, entity values, SDK error details or credentials.

## One actual Chrome run

One button invocation on localhost, no repeat: **16/17** fixture matches,
**10/11** prior-mismatch cohort and **6/6** controls. Original expected labels
remain unchanged. The full receipt is reports/classification-local-20261127.json.

| Sample | Clause | Cohort | Expected | Actual | Match | Read ms |
| --- | --- | --- | --- | --- | --- | --- |
| nda | c2 | prior-mismatch | other | confidentiality | NO | 6421 |
| nda | c7 | prior-mismatch | liability/other | other | yes | 973 |
| nda | c4 | control | confidentiality | confidentiality | yes | 951 |
| nda | c8 | control | governing_law | governing_law | yes | 681 |
| freelance | c1 | prior-mismatch | other | other | yes | 618 |
| freelance | c5 | prior-mismatch | payment | payment | yes | 2349 |
| freelance | c6 | prior-mismatch | ip | ip | yes | 888 |
| freelance | c4 | control | payment | payment | yes | 1730 |
| freelance | c7 | control | termination | termination | yes | 902 |
| lease | c1 | prior-mismatch | other | other | yes | 618 |
| lease | c8 | prior-mismatch | other | other | yes | 625 |
| saas | c1 | prior-mismatch | other | other | yes | 617 |
| saas | c2 | prior-mismatch | other | other | yes | 1419 |
| saas | c3 | prior-mismatch | ip/other | other | yes | 1527 |
| saas | c5 | prior-mismatch | other/payment | payment | yes | 1182 |
| saas | c7 | control | liability | liability | yes | 624 |
| offer-letter | c6 | control | non_compete | non_compete | yes | 949 |

**Unresolved:** NDA c2 remains confidentiality rather than other. No failed
measurement was dropped. The earlier Chrome baseline had NDA c2 wrong and
freelance c6 payment rather than ip; this run retains the first error and returns
ip for the second. Most other selected failures came from Apple Intelligence on
an earlier phone revision; matching their expected labels in Chrome does not
prove those phone failures fixed. No before/after percentage is claimed for
identical hardware/model runs.

## Verification

- 640 web/engine tests pass (627 existing + 13 evaluator tests).
- Core, engine and web typechecks and production build pass.
- Tests exercise actual readClause parsing, mismatch preservation, unavailable
  model, malformed responses, invalid type, sanitized errors, read timeout/late
  completion, total deadline, input bounds, fixed cohort loading and no cloud
  analysis dispatch.
- No dependency/lockfile changes. Production output excludes the diagnostic and
  its public fixtures. Whitespace checks pass.
- Existing fixture masking regressions still pass, but this joint-reader run
  records entity counts only. It does NOT establish fresh masking recall or
  prove that longer classification instructions cannot affect name extraction.

## No-cost and release gates

Before the real run, Cloud Billing explicitly showed this project has no billing
account. Chrome's official built-in AI documentation confirms these APIs are
free to use; existing on-device model/settings were used, with no provider,
billing, permission, membership or quota upgrade. No cloud generation or Hosting
release was performed.

Reference: https://developer.chrome.com/blog/prompt-api-blog-cyberagent

- [x] Implement explicit taxonomy and bounded repeatable evaluation.
- [x] Preserve one genuine local run, including the remaining error.
- [x] Verify regression suite, typechecks, build and private-config exclusion.
- [ ] Engine-owner review/adoption of the stacked candidate.
- [ ] One bounded genuine full-mask verification on the accepted revision;
  validate model-derived sensitive values as well as classification.
- [ ] Carry the existing #56 truthful model-read banner correction through
  coordinated adoption; do not duplicate or misrepresent it as already on main.
- [ ] Corrected-main acceptance and Hosting verification after adoption. Keep
  phone/Android readiness, native attestation/chat and submission gates separate.

The bounded implementation/evaluation increment is complete; classification
quality is not perfect. Do not repeat model calls merely to obtain 17/17, weaken
fixture expectations, or use this cohort as legal/model accuracy certification.
