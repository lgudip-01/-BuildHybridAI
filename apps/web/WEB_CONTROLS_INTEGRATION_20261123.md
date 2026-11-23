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
