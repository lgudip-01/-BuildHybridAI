# Web demo acceptance

Checkpoint: November 19, 2026 (America/New_York). Primary checkout is
`ClauseGuard-cloud-check`, on `test/exhibit-fix`. Local working-tree changes and
their deployed bundle are distinguished from the GitHub branch state below. This is bounded evidence,
not a universal masking/legal-correctness claim.

## Current acceptance matrix

| Check | Result | Evidence and limits |
| --- | --- | --- |
| Web suite | Pass, 144 tests | All eight files; provider calls mocked, real engine where specified. |
| Engine suite | Pass, 88 tests | Includes merged #26/#27 behavior plus local collision/review guards. |
| Real-engine approval integration | Pass, nine tests | Actual mask/approval/vault/unmask, cloud SDK mocked. Included in web total. |
| Firebase setup | Pass, nine checks | Provider/debug/init/config mocks; unchanged since last execution. |
| Core/engine typecheck and web production build | Pass | Local source, not proof every platform runs. |
| Actual Nano preview | Pass, exact ten-clause lease | 11,141 ms; 14 sensitive-value expectations absent, five keep terms retained. |
| Edit clearing and operation lock | Pass | Actual Chrome and lifecycle tests; input locked during inference, edits clear preview/approval/results. |
| Partial/blocked/no-source results | Pass within documented scope | Actual provider failures/identity collision plus automated/SSR stale/unknown-source cases. |
| Actual cloud/restoration | Partial | Earlier hosted batch 1/3; names restored correctly in its accepted answer. Exact reconciled lease pass recorded at end. |
| Actual network-off fallback | Source/failure handling pass; content incomplete | DevTools Offline, ERR_INTERNET_DISCONNECTED, zero bytes; actual device badge, 0/1 valid. No invented risk/rewrite. |
| Masked outgoing body | Pass for inspected request | Actual DevTools id/type/masked-text body plus integration tests; not every SDK endpoint or telemetry. |
| Production attestation/billing | Verified | Registered restricted Essentials provider, AI Logic enforced, Spark/no linked billing account. No billing/trial/payment. |
| Responsive/keyboard basics | Pass, bounded browser check | Prior 390×844 no overflow, Tab reaches Mask; not native touch/keyboard evidence. |
| Hosting | Deployed earlier checkpoint | Repository-reconciliation fixes deployed; matching asset verified, no new hosted inference. |
| Native platforms/import/chat/product polish | Incomplete | Ordered gates and owners in PROJECT_EXECUTION.md. |

Static production-path inspection found no application console logging in the
production entry graph. The cloud smoke/negative App Check diagnostics contain
logging/fetches but are not imported by the production entry. Presence of the
Firebase debug-token identifier in a bundle alone is not proof of debug mode:
the production initializer must retain its rejection check. This inspection does
not certify third-party SDK telemetry or every endpoint.

## Open checks before claiming a complete web demo

- [x] Correct issue #23 (offer-letter pronoun masked as party), with focused
  regression and one real Nano preview. Historical model response was not
  captured; the mocked acceptance-path regression reproduces the symptom.
- [x] Correct the observed issue #22 tenant mapping with focused regressions
  and live preview/restoration; exact merged-behavior acceptance tracked separately.
- [x] Recheck chosen fictional demo fixture in desktop Chrome after relevant
  changes. Stop at masked preview for review before any model submission.
- [x] Complete interactive busy/failure/blocked states with reproducible fixtures.
- [x] Verify responsive layout and keyboard/focus behavior (bounded checks above).
- [x] Prepare Hosting target/configuration and production App Check domains/key.
- [x] Deploy only after concrete target is established, then record hosted smoke
  check, source badge, masked payload and local restoration.

### Issue #23 correction — automated checks and live preview passed

A new `mask.test.ts` regression reproduces the observed three `Your` replacements
when the mocked local model reports `Your` as a person/party. Before correction,
all three become party tokens. This proves a sufficient acceptance-path cause,
not that the historical Nano response was captured.

The existing `isGeneric` vocabulary now includes second-person pronouns (`you`,
`your`, `yours`, `yourself`, `yourselves`). This is exact-word filtering using the
existing all-words rule, not a capitalization/prefix heuristic. Names such as
Yuri Petrov, Samuel Osei and Anika Bose remain masked in the regression. Date and
salary are masked; the three original pronoun clauses restore exactly.

After correction, the affected mask/regex/sample suites pass all 65 tests and the
web TypeScript/production build passes again.

A subsequent real desktop Chrome run on the four-paragraph fictional excerpt
passed: status `Gemini Nano ready`; `Masked on device` in 15,142 ms; leak check
passed; three values replaced. `Dear Samuel Osei,` became `Dear [PARTY_A],`,
April 6, 2026 became `[DATE_1]`, and $148,000 became `[AMOUNT_1]`. All three
`Your` phrases remained readable, including `Your employment is at will.`.
The UI stopped at the separate `Approve & analyze` action; no cloud analysis
was initiated. This is one focused actual Nano preview, not a full offer sample,
cloud retest or universal masking claim. GitHub #23 and #22 were subsequently
closed by Likhil's merged fixes; the latest reconciliation is recorded below.

Native Chrome accessibility initially timed out without starting masking. The
newly available direct Chrome extension connection showed the unstarted preview;
one click through that connection started the observed successful masking run.
Use that connection for further checks rather than native keystroke automation.

### Issue #22 correction — focused mapping/restoration passed

Both pattern-only and simulated combined-person model regressions reproduced the
collapsed tenant preamble. `separateCoordinatedNames` now separates a coordinated
span only if every constituent has independent name evidence. Explicitly
recognized organizations and their short forms are protected from splitting.
An uncorroborated span stays opaque with no personal aliases, sets needsReview,
and cannot claim an individual's name through the company-prefix merge path.
Unique titled surnames can reuse an already owned full-person surname variant;
shared surnames remain separate.

The complete engine suite now passes 83 tests; engine typecheck, 24 affected web
lifecycle/integration/helper tests, and web typecheck/production build pass.

One actual Nano preview of preamble + maintenance alias + separate signatures
took 4,856 ms. It used three distinct tokens; both tenants had the same individual
tokens in preamble/signatures, retained `and` and `Tenants`, and Ms. O'Connell
used the landlord token. The fictional masked preview was inspected before one
explicit approve/analyze action. All three returned validated reviews with zero
failures and correct restored identities. Actual source was **on-device**, not
cloud. The cloud-capable SDK selected fallback; no cloud success is claimed.
No inference retry was made. Keep the source diagnosis/real cloud check open.

Remaining identity limitation observed during investigation: an organization
whose exact name consists of the same individual people's names can still
produce alias collisions/expanded restoration (for example a company literally
named `Wei Zhang and Lucia Fernandez LLC` alongside those people). The focused
correction is not general entity resolution. The separate organization regression
preserves `Baker and McKenzie LLP`; do not present it as coverage of name collisions.
The full lease and broader alias/organization ambiguity need additional work
before universal identity claims. Issues #22/#23 are not closed on GitHub.

## Local demo workflow

From repository root, keep Vite running in its own terminal:

```sh
npm run dev --workspace @clause-guard/web -- --host 127.0.0.1 --port 5173 --strictPort
```

Open `http://localhost:5173/` in desktop Chrome. Use the fictional one-clause
fixture below for a short demo; the lease and offer samples are not accepted
until their respective fixes are verified.

```text
Contractor shall indemnify Client for all claims, including claims caused solely by Client's negligence.
```

Mask, review the exact preview, and explicitly approve once. Check the confirmed
source label and either a validated review or an honest failure card. Edit the
input afterward and verify output clears. A preliminary risk is not legal
approval. Do not rerun a failure repeatedly to obtain a green demo.

## GitHub access diagnosis

The connector identifies the authenticated account as `101dhruvvyas`. Reads work;
comment creation and collaborator-permission inspection return HTTP 403,
`Resource not accessible by integration`. This indicates an integration access
restriction, but the exact missing installation permission cannot be inspected.
The signed-in native Chrome fallback exposes browser controls without issue-page
content; the separate in-app browser is signed out. No comment was posted.
The user will ask Likhil for the Android inventory in person if posting remains
unavailable. No reset/reinstallation or wider account permission change was made.

## Subsequent verified cloud setup and current correction

The direct Chrome extension connection became available and resolved the earlier
browser inspection failures. Native accessibility is no longer the preferred
route. The original `127.0.0.1` run emitted only the sanitized error codes
`HTTP status: 403` / `appCheck/fetch-status-error`; it correctly fell back locally.
The separate no-inference development page `appcheck.html` verified token
acquisition on `localhost` with the existing registration. No secrets were shown,
copied or registered, and enforcement was not changed.

One bounded follow-up on `localhost` first masked and inspected the same focused
lease excerpt (4,969 ms), then returned **Analyzed in cloud**, 3/3 validated
reviews, zero failures. Restored landlord and both tenant identities were correct
with no duplicated co-tenant. This supersedes the earlier pending cloud-source
check; it is not a full lease semantic pass.

That actual response proposed adding `(jointly and severally, "Tenants")` to the
preamble. Existing commercial triage missed this vocabulary. A regression using
the observed draft failed before the correction. `commercial-review-v2` now
withholds changed drafts mentioning joint-and-several allocation in source or
proposal, including `joint and several`, `jointly and severally`, and the hyphenated
form. Empty/unchanged wording can pass. All 126 focused web tests and the
production build pass; no additional model run was performed for this guard.
Explanations/questions/risk are not certified by lexical redline triage.

The exact organization/person name collision described above is now blocked
before a vault/approved batch is issued, rather than treated as a successful map.
Both pattern and mocked-model regressions verify this block. The complete engine
suite passes 85 tests and engine typecheck. A subsequent actual Nano preview of
the collision displayed **Blocked before analysis**, the ambiguity reason, and
no Approve action. No inference was sent for that fixture. Broader entity
resolution still needs careful treatment; this is bounded fail-closed handling.

Responsive check: at 390 × 844, document and body widths were both 390 with no
horizontal page overflow; blocked-state content remained available. Tab from the
contract input focused Mask contract. Desktop sizing was restored afterward.
This is a browser breakpoint check, not an iPhone/native keyboard test.

Download controls were reviewed in source (availability, progress, disabled while
busy and error recovery); no model was deleted/redownloaded to exercise them.
Unsupported/pattern-only state was exercised in the in-app browser. Offline
fallback has prior reported airplane/network-off evidence and this session's
actual provider-rejection fallback. Deliberate network-off was not repeated.
Partial/no-source/stale/duplicate outcomes use reproducible automated tests,
not manufactured real provider failures. The matrix records these limits.

Console independently verifies Spark, no linked Cloud Billing account, AI Logic
App Check enforcement and Registered production attestation. Hosting is deployed;
the actual hosted evidence and remaining acceptance limits follow.


## Hosted checkpoint — November 19, 2026

URL: https://clause-guard-hackathon.web.app. Official CLI authenticated with the
user-approved account and confirmed the existing default Hosting site. The
restricted reCAPTCHA Enterprise Essentials provider is registered with 3600-second
TTL and score 0.5; AI Logic stays ENFORCED. Billing was independently rechecked as
unlinked, with Spark displayed. No billing/trial/payment setup occurred.

On the production build, actual desktop Chrome Nano masked the three-clause
lease in 4,505 ms. Both tenant identities were separate and the landlord alias
was stable. After explicit approval, the batch confirmed **Analyzed in cloud**:
1/3 validated, 2/3 unavailable. The returned explanation restored all three names
correctly; original clauses and honest failure cards remained. No complete
three-clause cloud success is claimed for this deployment.

A single-clause diagnostic isolated the unavailable entry/waiver clause with
Chrome DevTools Network recording. The official Firebase AI endpoint returned
HTTP 500 / INTERNAL: “This model is currently experiencing high demand. Spikes
in demand are usually temporary. Please try again later.” This is a concrete
provider availability blocker. The first two batch failures were not captured
individually and are not conclusively assigned that same cause. No repeated cloud
retries were run to manufacture a green result.

The recorded request's user content was exactly the projected clause object:
`id`, `type`, `text`; text used `[PARTY_A]`, with no original name. It contained
application generation settings/system instructions and no vault or ledger.
This is an observed request plus source/integration-test evidence, not a claim
about every network endpoint. Editing the previous batch cleared its preview,
results and approval before the diagnostic mask.

After that 500, the diagnostic honestly returned **On-device preliminary scan**
with restored Ms. O’Connell. Its free-form explanation incorrectly suggested an
indemnity from a waiver. That observed response now has cloud/device regressions:
unsupported indemnity labels in explanations are rejected and shown as needing
review. Source-supported indemnity wording and neutral questions remain allowed.
This is a conservative lexical safeguard; it can withhold valid nuanced commentary
and does not certify all legal reasoning. Both regressions failed before the fix;
118 affected tests, core typecheck and production typecheck/build pass afterward.
The correction is deployed without another live inference attempt.

Remote Config is now limited to the verified free-tier model rather than any
Gemini model name. Kill switches still apply to rejected payloads, and cached
prompt loading remains tested. Any new model requires renewed cost verification.

Remaining release gate: obtain a complete hosted cloud review when provider
capacity returns, without weakening validation, adding paid models or automatic
retries. Native iOS/Android builds and real-device verification remain separate
unfinished deliverables. The hosted browser fallback evidence above is provider
rejection, not a deliberately disconnected network test.


## Repository reconciliation and actual offline check — November 19

Likhil's #26/#27 are merged into main `ea30d63`; local history and prior changes
are preserved. The local implementation now includes his wider pronoun exclusions
and pattern-only titled-surname linking, with our ambiguity/collision blocks kept.
88 engine tests and 9 real-engine integration tests pass. The #10 bare-token
ordinary-prose false positive is fixed with explicit accepted/rejected regressions;
all 144 web tests, core/engine typechecks and production build pass. Bracketed
unknown references and recognizable rewritten labels are still rejected.

Actual Chrome Offline mode: one fictional payment clause was masked and approved
using the updated local app. Network showed ERR_INTERNET_DISCONNECTED and zero
transferred bytes. The actual badge was On-device preliminary scan, with 0/1
validated and a Needs review card rather than an AI risk/rewrite. This is evidence
of fallback and fail-closed validation; successful offline review/restoration for
that fixture remains unverified. Restored No throttling afterward. Editing cleared
preview, approval and results. No separate system-wide network setting changed.

The exact ten-clause public lease preview passed all fourteen sensitive-value and
five keep-term expectations in actual Nano (11,141 ms), including the merged #27
identity/alias behavior. A single reviewed online lease pass follows; do not claim
that the fixture's closed GitHub issue proves cloud semantic acceptance.

The reconciliation changes have now been deployed. The exact release is recorded
in HOSTING_RELEASE.md. Hosted DOM verification loaded `/assets/index-C1aSSzYT.js`,
matching the tested build. No hosted model call was made after this deployment.


### Exact reconciled lease cloud result

One actual reviewed run completed: **Analyzed in cloud**, 4/10 validated
(c1,c2,c4,c9). Preamble c2 restored each landlord/tenant name correctly without
co-tenant duplication. c5 returned HTTP 500; c6,c8,c10 were cancelled at 30.00 s;
c3,c7 returned HTTP 200 but failed validation. Their response bodies still need
inspection to distinguish malformed model answers from application false positives.
No subsequent sample batch/retry was started. This resolves the focused #22
identity retest, not full analyzer acceptance or universal legal reasoning.
The local test tab remains open at the c2 restored answer; normal networking was
restored after the separate offline test. Provider and validation failures remain
visible as Needs review cards, without invented risk or replacement wording.


### November 19 bounded c3/c7 follow-up

A local-only manual diagnostic (`/sample-diagnostic.html` in Vite development)
selects fixed public fixtures before engine masking. Each run requires inspecting
the masked clauses and a separate approval click; no automatic retries, rejected
output logging, or production diagnostic entry is included.

First focused lease run: cloud 0/2; both explanations rejected for indemnity
wording absent from their source. Shared instructions were aligned with that
existing strict guard. One fresh post-change run: **cloud 2/2**, no failures,
correct local restoration, empty redlines. Explanation policy:
`explanation-grounding-v2`; Remote Config source; same approved free-tier model.
This closes focused premises/maintenance acceptance only. Full sample reliability,
remaining fixture cases and successful offline-content acceptance stay open.
149 web tests, core typecheck and production build pass. Both diagnostic pages
and the sample diagnostic module are excluded from the production build.


Focused follow-up, same explanation policy: offer c3/c4/c8 3/3 cloud validated,
all Your forms retained in masking, salary restored correctly, mutual at-will
wording recognized, empty drafts. Freelance signature c9 1/1 cloud validated,
both identities restored, no invented title blank and empty draft. Each was one
separately previewed and approved batch. Neither is a full-sample reliability pass.
Updated hosted build loads index-DuUYRCob.js; page/Nano-ready status verified,
without another hosted model call. Full hosted and offline-content gates stay open.


### November 19 — successful bounded offline roundtrip

Actual Chrome check on localhost, using only public promissory-note c8:
masked name/address preview inspected; DevTools Network visibly set to Offline;
one explicit approval. Cloud generateContent failed with
`net::ERR_INTERNET_DISCONNECTED`, 0 B transferred. SDK confirmed **device**, with
**1/1 validated**, no failures, correct local name/address restoration and empty
redline. Returned medium risk was qualified as preliminary review priority; all
four questions matched the existing allowed guarantee-review questions.

This used the existing application-authored source-quoted guarantee format
(`source-quoted-guarantee-v1`), enforced through response schema and validation.
It closes the bounded successful offline content/restoration check, not general
free-form offline quality or offline cold-start/download/install. The page/model
were ready and Remote Config loaded before network isolation. Earlier free-form
offline 0/1 remains valid evidence and is not overwritten. No code change or
weakened validation was needed. Normal No throttling was restored afterward and
DevTools closed. No new cloud execution, billing change or deployment occurred.

Remaining gate A work: broader fixed-sample cloud acceptance, complete hosted
review and safe source promotion/reconciliation of overlapping PRs.


### November 20 — full lease exposed reference and draft guard gaps

One approved full lease batch, after current no-billing/pricing checks: ten HTTP
200 fetches, cloud 7/10 structurally validated. c2/c4/c7 were rejected for indemnity
wording not present in their source. The seven results are not a quality pass:
c5 wrongly used the deposit amount token as a day count, and c9 referenced party
tokens not present in its own governing-law clause. No provider outage occurred.

The analyzer now sends/accepts only the current clause's tokens, preserving genuine
whole-batch approval and stale/source checks. Six cloud/device regressions across
all output fields failed before correction and passed afterward. One fresh
reviewed c5/c6 batch returned 2/2 cloud validated, with correct five-day grace
period, independent local amounts and no cross-clause references. This limited
result does not close full lease quality or other sample acceptance.

The deposit answer also proposed an added itemization duty. Deterministic
commercial review v3 now includes rent/deposit wording and withholds such changed
drafts, with two replay regressions that failed before the fix. Existing neutral
questions/results remain; no extra cloud call was used for this post-processing.
156 web tests, core typecheck and production build pass. Full samples are manual
local diagnostic selections, not an automatic six-sample retry loop.


### November 20 — held clauses and bounded lease-term format

One explicitly reviewed c2/c4/c7 batch returned cloud 2/3: correct distinct tenant
restoration in c2, correct landlord/contact restoration in c7, c4 withheld. The
recorded c4 response recited a negated generic risk checklist containing indemnity;
the strict source-wording guard remains and still rejects that captured wording.

Only the simple masked lease start/end-date form now selects
`source-quoted-lease-term-v1`: an explicitly application-authored explanation
quotes the clause, frames missing context and preliminary risk, with empty draft
and two allowed neutral questions. Cloud/device schemas constrain it, runtime
checks reject deviations, and other/qualified clauses stay on the normal path.
This is not unrestricted AI legal reasoning or a general hallucination fix.

Initial post-change c4 attempt: page reloaded before observation, inconclusive.
After fixing the test environment with localhost-only acceptance mode (no HMR),
one fresh preview/approval returned **cloud 1/1**, exact local date restoration,
empty redline, two allowed questions and no failures. No automatic retry loop.
174 web tests and typecheck/build pass. Focused passes across separate runs do not
constitute a new full-lease or full six-sample quality pass.

For stable local acceptance: `npm run dev:acceptance --workspace @clause-guard/web`.
Stop an existing task-owned 5173 server first. Open localhost:5173, and manually
reload after every source/config change before masking/reviewing a new version.
Use normal `dev` for hot-reload development. Diagnostics remain out of production.
Preparation errors reveal only fixed categories, never raw spans or SDK replies.


## November 20 full-lease acceptance after bounded term correction

One fresh full public lease was masked through the genuine on-device engine,
reviewed, then explicitly approved once on the local acceptance server (HMR off).
The preview contained ten clauses, separate landlord/two-tenant identities,
masked dates/address/amounts/contacts and needsReview false. Fixture values did
not survive the diagnostic's local checks. The exact approved batch was used.
Current Cloud Billing showed no linked billing account before inference; official
Gemini Developer API pricing still lists standard gemini-3.5-flash-lite input and
output as free. No plan, provider, model, API or payment configuration changed.

Result: SAMPLE_PARTIAL, cloud 6/10; no model_error failures. Configuration source
remote, clause-analysis-v1, commercial-review-v3, explanation-grounding-v2 and
source-quoted-lease-term-v1. No automatic or manual repeat of this batch occurred.

| Clause | Observed result | Content review |
| --- | --- | --- |
| c1 title | Validated, low | Recognizes a header without operative obligations; empty draft. |
| c2 parties | Validated, medium | Correct landlord and both distinct tenants/date restored; joint/several liability asked as unknown in this excerpt; empty draft. |
| c3 premises | Withheld | invalid_response: indemnity wording absent from the source clause. No accepted review. |
| c4 term | Validated, low | Clearly labeled source-based date quotation, both dates restored, two fixed neutral questions and empty draft. |
| c5 rent | Withheld | Same fixed indemnity-guard reason. The rent/grace-period review did not pass this run. |
| c6 deposit | Validated, low | Written deposit amount and 21-day return period restored/preserved; itemization, custody and interest asked as questions; empty draft. |
| c7 maintenance | Validated, medium | Landlord name, phone/email restored; reporting time/method and repair costs treated as unknown; empty draft. |
| c8 pets | Withheld | Same fixed indemnity-guard reason. No accepted review. |
| c9 law | Withheld | Same fixed indemnity-guard reason. No accepted review. |
| c10 signatures | Validated, low | Correct landlord and both tenant identities restored; asks about separate operative terms; empty draft. |

Inspected the diagnostic tab in DevTools after the run: its request table was
empty (recording showed the perform-a-request prompt). Closed DevTools without
reloading or resending. The four rejected raw response bodies are unavailable. The
fixed validator category proves prohibited wording was present, but does not
establish whether each explanation asserted or negated it. Do not assume all
four matched the earlier c4 negated-checklist response. Accepted content was
inspected locally against the public fixture; validation alone is not a legal
accuracy certification.

Full-lease acceptance FAILED and Gate A remains open. Earlier focused passes do
not override these failures. No rejection was relaxed, invalid response replaced,
new fallback format added, hosted inference performed or deployment needed.
The default cloud prompt contains a generic risk-topic list while app-owned
grounding instructions require absent indemnity topics to be omitted. Checklist
echoing is a plausible prompt-design concern, not a verified explanation of
these four individual replies. Next: define a general source-grounded prompt correction using the available
masked c4 checklist replay and current rejection evidence, with
replay tests, preserving the strict validator; do not add a template per sample
clause or repeat full batches just to obtain a pass.


## November 20 source-first v2: full public lease 10/10

Changed the prompt policy after the recorded 6/10 failure, not the validator.
Removed the generic risk-category checklist from shared defaults, introduced
source-first prompts for cloud/device, and advanced ANALYSIS_VERSION to
clause-analysis-v2. A cached/published v1 prompt is now retired to application
defaults; independently read false kill switches remain effective. Local Remote
Config templates are synchronized but no server prompt publication occurred.

178 web tests, core typecheck/production build and nine Firebase checks pass.
Four new migration/provider regressions failed before correction, then passed.
Source-supported high-risk indemnity still passes cloud/device; unsupported
indemnity and the captured negated checklist remain rejected. No approval,
projection, token validation, source pinning or runtime grounding guard changed.

Verified actual Cloud Billing again: no linked account. Official standard
gemini-3.5-flash-lite input/output pricing remains free. Reused the running
localhost-only acceptance server; a redundant start attempt found port 5173
already occupied by that process and did not replace it. Reloaded manually to
load changed code, selected the full public lease, and inspected the fresh
engine-masked preview: all ten clauses, distinct party identities and all fixture
values masked, needsReview false. Opened DevTools Network recording BEFORE
approval, with no throttling. One newly approved post-correction batch returned:
SAMPLE_ROUNDTRIP_COMPLETED, actual cloud, 10/10, failed empty. No retry loop.
Config source defaults, version clause-analysis-v2; commercial-review-v3,
explanation-grounding-v2 and source-quoted-lease-term-v1 remain reported.

| Clause | Review observation |
| --- | --- |
| c1 title | Header only; low, no invented operative terms. |
| c2 parties | Correct landlord/two separate tenants and date restored; asks for contact context. |
| c3 premises | Complete apartment address restored; distinguishes this excerpt from surrounding lease provisions. |
| c4 term | Existing labeled source-based format, correct dates and two neutral allowed questions. |
| c5 rent | Correct $2,150 rent, $75 fee, first-of-month due date and more-than-five-days-late trigger. Wording caveat below. |
| c6 deposit | Correct written amount and 21-day return; deduction/itemization/custody raised as questions. |
| c7 maintenance | Correct landlord phone/email restored; repair response/cost details treated as unspecified in supplied wording. |
| c8 pets | Written-consent restriction recognized; asks about exceptions/request procedure without inventing them. |
| c9 law | Oregon retained; no absent-party tokens introduced; venue raised as a question. |
| c10 signatures | Correct landlord and two tenant identities; joint/several status remains a question. |

All ten redlines are empty. No unsupported indemnity narrative appears. The
rent explanation acknowledges the five-day trigger but also says it lacks grace
period details, then asks whether that trigger serves as the grace period. That
wording is imprecise and remains a content-quality caveat; it is not a wrong
amount/day count or a replacement draft. This checkpoint is 10/10 runtime
validation with inspected content, not a certification that every sentence is
ideal, legally accurate, or complete. Risk ratings are preliminary.

This is one local cloud run on the fixed public lease, not all-six-sample,
general offline, native-device or hosted-content acceptance. The date clause
still uses the previously labeled application-authored format; the new general
policy did not add further fixed answers. Earlier 6/10 and inconclusive runs
remain in this ledger. Gate A still requires remaining samples and hosted review.


## November 20 broader acceptance and stronger content review

Zero-cost prerequisites were rechecked before this increment: actual project
Cloud Billing has no linked account, and standard gemini-3.5-flash-lite input/
output remain free in current official pricing. No billing/model/provider change.
Each fixed public selection was prepared before genuine engine masking, reviewed
and approved once; all actual inference sources below are cloud. No batch retry.

- Rent/deposit c5/c6: 2/2 after timing instruction/guard correction. Correct
  independent values, five-day trigger and 21-day deposit period; no false
  missing-grace-period claim. A waiver/procedure question remains broad.
- Full offer: 11/11 runtime validation, but content FAILED on geography/notice
  overclaims. The United States scope was called undefined and at-will wording
  was treated as waiving notice. After new instructions/guards, a fresh c6/c8
  focused run passed 2/2: nationwide scope stated; notice left unspecified in
  the excerpt. This is not a new full-offer run under the final guards.
- Full freelance: 10/10 runtime validation, all drafts empty. Parties, address,
  amounts, payment-routing fields and tax identifier restore locally; hourly
  fee/project cap, payment-in-full ownership condition and 14-day mutual notice
  are retained. Content caveats: ownership exposure for the creator is loosely
  reasoned, and c9/c10 signature forms are described as executed. No proof of
  actual signing is supplied by these blocks. c6 remains engine-typed payment
  (known upstream classification miss), while its ownership text reaches the
  analyzer unchanged.
- Full promissory note: 9/9, all drafts empty. Principal/interest/installments,
  penalty-free prepayment and ten-day acceleration threshold are preserved.
  Mr. Mendoza remains a distinct masked identity, not silently assigned to a
  same-surname person. Guarantee uses the existing labeled source-based format.
- Full SaaS: 9/10. c7 is withheld for unsupported indemnity wording. Other
  responses preserve EUR annual fee, 1% monthly interest, 99.9% availability,
  5% credit, 36/12-month terms and mutual 90-day nonrenewal notice. Signature
  block c10 again overclaims established execution.

DevTools was recording before the SaaS send. Inspected the existing c7 Response
without another request; its first sentence correctly states the mutual
fees-paid/12-month cap and confidentiality exception. It then says other potential
exclusions such as indemnification, IP infringement and gross negligence are
unspecified and therefore ambiguous. This hypothetical carve-out list is not
supplied by the clause and remains rejected. Only the necessary masked review
wording is used for regression; provider metadata/opaque signatures are excluded.

The offer preview had needsReview true due to conservative masking of a document
title and Employee ID label; it was inspected and explicitly approved without
clearing that flag. All other listed previews had needsReview false. All fixture
values passed the local surviving-value check; no original/vault map was sent.
These results distinguish runtime validation from content quality. They do not
close the broader Gate A or establish general reliability/legal accuracy.

Full NDA completed cloud 10/10 with empty drafts. It recognizes mutual purpose/
permitted disclosure, flags the three-year survival language naming only one
party, preserves notice recipients/contact methods, and retains Delaware law.
The narrower public-information exclusion and asymmetric damages acknowledgment
are discussed without inventing replacement terms. Signature forms again use
execution wording, and some questions repeat information or use a loose role
label (e.g. disclosing party when asking about the other party's survival period).
Those are content caveats, not evidence of perfect reasoning.

Across the five full samples in this increment, runtime validation was 49/50
(offer 11/11, freelance 10/10, note 9/9, SaaS 9/10, NDA 10/10). These runs used
the observed prompt/guard states during the increment; later targeted corrections
must be reported separately, not converted into a new unified full-matrix pass.
All accepted drafts were empty. The earlier lease 10/10 used the preceding
policy and is not a fresh sixth sample run under the final safeguards.

Further correction adds source instructions that hypothetical additional
carve-outs are questions, not proof of ambiguity, and signature forms identify
intended signatories rather than prove execution. A narrow signature-form guard
withholds the observed execution assertions. Counterexamples ensure the newly
added timing/notice checks do not treat negated fee wording as an affirmative
trigger or a missing-notice statement as a waiver. Those controls failed before
correction; original unsupported-indemnity/guarantee validation remains intact.
195 web tests and core/web typechecks pass. No invalid response is rewritten,
and no guard causes automatic retries.


### November 21 continuation: interim ownership and signature status

The first focused freelance c6/c9/c10 run returned 3/3 validation but still had
content overclaims: creator ownership until payment and showing execution in a
signature-form sentence followed by a disclaimer. Further tests reproduced the
problem on both providers. The prompt now states only the payment condition and
asks about unspecified interim rights; lexical checks withhold observed interim-
creator-ownership and signature-execution assertion forms.

A fresh post-correction focused run returned 2/3: ownership correctly leaves
interim rights unspecified; c10 is withheld for asserted execution. c9 still says
its execution by before a disclaimer, so that additional observed phrase is
being covered too. This is NOT a content-quality pass and must not be called a
3/3 success under the final guard. No unchanged rerun was made.

Likhil approved and merged PR #28 into main at 65152ce while this work was local.
His new review asks to retire the exact-sentence lease-term template in favor of
the general v2 path. Follow-up work will preserve this working tree in a separate
branch based on that main, retaining the newer upstream evaluation report.


### November 21 general lease path: 10/10 without the template

After retiring sourceQuotedLeaseTermReview and its special schema/equality
validator, one newly masked/reviewed full public lease completed actual cloud
10/10, failed empty, all redlines empty. Diagnostics report defaults,
clause-analysis-v2, explanation-grounding-v3 and leaseTermReview general-v2.
The date clause now naturally states the actual start/end dates and asks about
renewal/early termination; no application-authored lease explanation is supplied.
Both distinct tenants, landlord/contact alias, apartment, independent amounts
and dates restore correctly. Rent correctly preserves the more-than-five-days
late threshold. No unsupported indemnity explanation or asserted execution
appears. Some questions remain broad/redundant; this is not a legal certificate.

SaaS focused c7/c10 after the final prompt/guard changes returned cloud 2/2.
The cap's mutual fees-paid/12-month basis and confidentiality exception are
correct, and signatories are identified as intended, without proof of execution.
The cap explanation still discusses hypothetical IP/security carve-outs, so
content refinement remains open even though runtime validation passes.

The final freelance focused result stays 2/3, with a signature claim withheld;
an additional accepted phrase its execution by is now rejected by a replay.
No further freelance send was made to chase a green count. This work strengthens
withholding and removes a demo-specific lease path; it does not close the broader
Gate A. Next is uniform final-policy sample/content review and complete hosted
acceptance, preserving these limitations and every earlier result.
