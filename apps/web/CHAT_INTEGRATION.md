# Cloud chat adapter — independent implementation checkpoint

**Historical initial checkpoint:** the 296-test/byte-identical bundle results
below describe the initial adapter before the native/UI extension. The current
`CHAT_UI_MOBILE_HANDOFF.md` supersedes its implementation layout and UI handoff:
web/native share `chatDispatch.ts`, `ChatConversation` supplies the UI lifecycle,
and ReviewSession retains the genuine approved batch and closes chat on changes.
The new ReviewSession hook changes the built bundle; it is not deployed. Both
engine integration seams and guards still reject all chat. Current verification
and activation gates are in PROJECT_EXECUTION.md and the GitHub checkpoint.

November 22, 2026. Related: #9, #13 (Likhil's confirmed engine contract), #30.
This implements the independent Cloud AI step authorized by the user while main
review and engine/UI delivery remain pending. It does not enable production chat.

## What is implemented

- `packages/core/src/chat.ts`: readonly context/question/reply contracts, fixed
  sanitized errors, limits, application-owned prompt and strict response validation.
- `src/cloudChat.ts`: `CloudChatBridge(ai).ask(context, question)` and `clear(context)`.
  Use only the existing App-Check-protected `initFirebase().ai` when integration
  is ready. No new Firebase app, provider, API, database or remote chat store.
- `src/chatGuard.ts`: all three guards deliberately throw `not_approved` before
  any configuration/model setup. No ticket issuer, caller-supplied authorizer,
  reviewed-boolean bypass or production test registry exists.

The adapter is not imported by App, WebBridge or the production entry. The built
production JS remains byte-identical to the existing release:
`index-Cr3HSrZw.js`, SHA-256
`a0829eeeab5a552c0eeb0c218260c8af839ecdf1e3a148d8b927656b9ca41bd3`.
No deployment, live inference or cloud configuration change was needed.

## Engine binding required before activation

Likhil confirmed these semantics in #13. Replace chatGuard's fail-closed functions
with direct exports from the actual engine module once delivered; do not implement
an approval registry in the cloud bridge or use document mask() on a question.

1. `prepareChatContext(batch)` registers/freezes a session tied to the current
   document run, including a frozen clauses array and frozen clause objects.
2. `maskQuestion(context, rawQuestion, bridge)` runs locally, reuses unambiguous
   known variants and creates collision-free new tokens in an in-memory,
   append-only session map. It never overwrites the document vault.
3. `approveQuestion(context, draft, {reviewed:true})` requires explicit masked
   preview approval on every question and returns a registered frozen object.
4. `assertChatApproved(context, question)` rejects forged/copied, unreviewed,
   wrong-session, stale and already consumed tickets. The adapter calls it first,
   then again after async configuration.
5. `consumeChatQuestion(context, question)` performs ALL approval checks and
   marks consumed atomically. The adapter calls it immediately before dispatch,
   without an intervening await. A dispatched failed ticket is never replayed.
6. `assertChatCurrent(context, question)` checks identity/session/revision after
   dispatch, permitting the consumed ticket only for response checks/restoration.
7. `unmaskChatReply(context, question, reply)` restores the returned MASKED reply
   locally and checks current revision before/after async work. UI must verify
   the active session before rendering. Restored text never returns to the bridge.

Remasking invalidates old contexts/questions/replies even if the remask fails.
Bridge clear permanently closes that context, drops its masked history and aborts
the pending client operation; UI must release the old context and its restored
messages and obtain a fresh engine context. Engine session maps must be scoped
to the context lifetime; they are not a persistent document vault.

## Request, history and error behavior

Calls use `ONLY_IN_CLOUD`, the existing verified model constant and fixed chat
instructions/schema. Existing analysis availability false flags also block setup;
remote analysis prompts are never used as chat instructions. Config cannot select
an unverified model. Offline chat returns a connection-required error with no
device fallback. There are no tools, automatic lookups or automatic retries.

Each stateless generateContent request explicitly projects only:

```text
contract: [{id, optional type, masked text}]
history: [masked user question, validated masked assistant content, ...]
question: {masked text}
```

No docId, sessionId, revision, turnId, source filename, ledger, vault, raw question,
restored messages or arbitrary extra object properties are projected. Local reply
metadata comes from the engine objects, never from model JSON. Histories are
identity-bound in-memory weak maps shared across bridge wrappers for one Firebase
app; callers cannot supply/replace history. Returned content/citations are frozen
and separate from stored history. Only successfully validated question/answer pairs
are appended, together. Failed questions do not expand a future token allowlist.

Limits: 40 clauses/60,000 contract characters, 6,000 characters per clause,
2,000 per masked question, eight completed turns, 20,000 history characters,
6,000 per answer and ten distinct exact clause citations. The 30-second operation
deadline covers configuration and provider work, attempts cancellation, and
discards late completion. A dispatched server request cannot be recalled; a
timeout is not evidence the provider performed no work. Limits stop the turn;
history is never silently truncated or persisted remotely.

Replies require exactly status/answer/citations. `answered` needs a known clause
citation; `insufficient_context` may have none. Unknown IDs, extra fields, empty/
oversized data, invented/broken placeholders and unconfirmed/noncloud execution
are rejected. The token allowlist comes only from the actual projected context,
validated masked history and current masked question. Exact reference/citation
membership does not prove semantic accuracy, correct roles or citation entailment.

## Verification completed

58 new tests across cloudChat.test.ts and chatGuard.test.ts; 296 total web tests
pass. Core typecheck and web production typecheck/build pass. The real production
guard is tested separately and cannot authorize a forged ticket or set up a model.
Other chat tests use a private TEST-ONLY simulated engine registry and mocked
config/provider responses; they do not prove actual question masking or live chat.

Covered: copied/unreviewed/raw/wrong-session/stale inputs, remask during config
or model setup, atomic consumption/replay, stale resolve/reject, cross-wrapper
concurrency, clear during config/inference, timeout including ignored cancellation,
late replies, metadata canaries/projection, immutable masked history, failed-turn
exclusion, new tokens across follow-ups, turn/character limits, disabled/unverified
model config, offline transitions, no confirmed source, strict response/citation/
token checks, and fixed errors without raw SDK text/causes.

## Six-sample live acceptance plan — NOT executed

After real engine/UI binding, inspect every masked preview and outgoing payload;
use the public fixtures only. Expected facts below guide content review rather
than supplying model answers. Clause IDs refer to the existing plain-text split.
Recheck IDs if importing through #33's section splitter.

| Sample | Initial question | Expected source/content | Missing-context probe |
| --- | --- | --- | --- |
| Lease | What happens when rent is more than five days late? | c5: stated late threshold and fee; exact restored amounts | Which bank account receives rent? |
| NDA | How long do Northwind's obligations survive? | c4: named party, three years after termination; preserve reasonable-care standard | What monetary damages cap is stated? |
| Freelance | When does the Client own the work product? | c6: work-for-hire and payment-in-full condition; do not invent interim ownership | Which arbitration venue is specified? |
| Offer | Is the annual bonus guaranteed? | c4: eligibility/up-to 15%, not a guaranteed award | What is the option exercise price? |
| SaaS | What is the liability cap and its exception? | c7: mutual fees-paid/12-month cap, confidentiality exception | Where is the data center located? |
| Note | May the borrower prepay without penalty? | c6: permission for all/part, anytime, no penalty | What exact maturity date is stated? |

For each: follow up using the same context; verify exact citations and local
restoration. Test full names, Lucia-style first names, partial addresses, ambiguous
Mendoza variants, a new sensitive question value and prompt injection. Ambiguity
must block rather than silently select a person. Test remask/clear while pending,
offline errors and unsupported browsers. Verify no raw value in sent history.

Activation remains blocked until these REAL engine/payload/UI checks pass and
current model pricing plus actual project no-billing/App Check state are verified.
Sai's UI lifecycle confirmation and engine delivery remain tracked in #13/#30.
No payment, trial, billing account or billable service is authorized.
