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
