# Redesigned Workbench + functional chat integration

Isolated branch, stacked on #44 / 1a21116. Main, original checkouts and author
branches are preserved. This integration reconciles:

- #36 redesign at 628c44e: App delegates the tool to Workbench, with motion/theme.
- #33 import at 1a6b334 plus reviewed corrections from de3bc38: preserve bare
  numeric lines and hyphenated email text, keep signatures together, reject late
  file imports after editor/review changes, clear input for repeat selection.
- #41 progress at 42dfdcc: optional count-only engine callback and live status.
- #42 controls at 16b6f00: manual masks, local reveal/undo, actual clause sources.
- #43 deletion at a9f8149: per-document vault ordering and approval invalidation.

## Integration corrections

The released direct chat approval, per-question review, citation targets, safe
provider/quota errors and native release stop are retained. Shared web UI only;
no new native binary/SDK acceptance is claimed.

A manual revision is a new engine run. Its private in-memory chat snapshot must
include manual PRIVATE values plus original known-party aliases. The snapshot is
sealed by the engine, never exposed through public results or persisted for chat.
Undo rebuilds from the original checked preview; removed manual entries are
removed from the vault. Ordinary automatic masks cannot be undone by this UI.
Explicit document/question approval is required again after revisions.

Manual controls remain available after chat/result approval. Any accepted
revision closes chat synchronously and clears its previous outcome. In-flight
provider replies are discarded. Delete closes chat before storage awaits, revokes
engine authority through deleteVault, cancels a pending import, and clears manual
choices after successful deletion. Storage failure retains the document identity
and manual protections for a retry. Deletion leaves other document vaults and the
shared encryption key intact. New documents receive a fresh identity.

Manual controls clear their text/token/local-reveal state on preview replacement,
so an accepted mask does not leave its old add field blocking approval. The landing
copy now asks for preview review instead of promising perfect masking or phone-only
storage on the web.

## Verification

- 395 web tests, 163 engine tests and core/engine typechecks pass.
- Production web build passes; the pre-existing >500 kB main-chunk advisory remains.
- Four real-engine/mock-provider integration regressions cover manual-value chat
  restoration, stale tickets/undo aliases, edits during cloud dispatch, deletion
  during dispatch and isolation/cleared choices for the next document.
- Browser: actual Chrome Nano mask reported clause progress; bluebird became
  PRIVATE_1, local reveal left the outgoing preview unchanged, the question preview
  reused PRIVATE_1 and PARTY_A, and undo removed the prepared chat and approval.
  No cloud request was approved during this local browser sequence.
- Desktop and actual 430px DevTools viewport checked. At 430px, document width was
  430px, chat width 387px and question width 345px: no horizontal overflow. The
  browser viewport API initially failed to resize; only the actual DevTools check
  is counted. Device emulation/DevTools were then turned off.
- Browser deletion confirmation is covered by the real-engine synthetic DOM test;
  no real user document was deleted. Automated source/provenance tests remain.

Publishing/deployment checkpoints follow. No payment/billing/API/IAM/App Check
changes, new providers, automatic retries or native chat enablement.

## Release follow-up

The complete tested source was published as dcb2a3c in #45, stacked on #44.
Hosting deployment succeeded. A new tab initially reused the prior root HTML;
a normal reload loaded the redesign. Add an explicit no-cache header for `/`
as well as index.html; hashed assets retain their immutable caching. No security
headers or App Check protections are weakened. Final hosted acceptance follows.

## Completed hosted acceptance

PR: https://github.com/lgudip-01/-BuildHybridAI/pull/45 . Runtime/config source
044ad59 exactly matches the tested local source; deployment completed around
15:59 Eastern November 23. Public app: https://clause-guard-hackathon.web.app .
No billing account was freshly confirmed in Console before deployment; Spark and
Gemini 3.5 Flash-Lite free pricing were rechecked at https://firebase.google.com/pricing
and https://aistudio.google.com/docs/pricing#gemini-3.5-flash-lite . No changes to
billing, APIs, credentials, IAM or App Check.

Production browser checks: imported synthetic nda.docx locally, yielding the
expected 10 clauses. A separate Lucia/bluebird/Example Services/$250/30-day fixture
was masked with real Nano; bluebird was manually masked as PRIVATE_1 and explicitly
approved for chat. The question preview replaced Lucia with PARTY_A. Exactly one
explicitly approved cloud question returned the correct code, parties, amount and
deadline with actual cloud source; details restored locally. Citation #chat-source-c1
resolved to the approved text with PARTY_A/PRIVATE_1/PARTY_B/AMOUNT_1 placeholders.
Undoing PRIVATE_1 then removed the restored conversation and required new approval.
No real user document was deleted; no automatic retries or model switching. This
is bounded functional acceptance, not general legal accuracy/privacy certification.

Public root response was independently verified HTTP 200, Cache-Control:no-cache,
X-Content-Type-Options:nosniff and existing Referrer-Policy/HSTS. The production
output contains 63 static files, with no local diagnostic entry or environment file.
The initial stale-tab cache observation and viewport-tool failure remain above.
