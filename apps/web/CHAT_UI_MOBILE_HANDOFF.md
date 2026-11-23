# Chat UI and native handoff — November 22, 2026

For @aarushgoel1, @saikamsani30 and @lgudip-01. Extends #34; responds to #13,
#17, #30, #35 and #36. Chat is the highest development priority. **No live chat
is enabled.** The missing engine exports and native plugin method are explicit
integration gates, not simulated production implementations.

Current final verification: **333 web + 94 engine tests**, core typecheck and
production typecheck/build pass. The isolated #35/#36 combination passes **346
web tests and production typecheck/build**. No live chat/native-device/main
acceptance is claimed. These supersede the initial counts retained below.

## What the UI can build now

The view does not need to own masking, approval, cloud history or restoration.
`ChatConversation` in `src/chatFlow.ts` is a headless external store:

- `getSnapshot()` and `subscribe(listener)` work with `useSyncExternalStore`.
- `editQuestion(raw)` changes local text and discards an older preview. Editing
  during local masking invalidates its pending completion. Sending locks edits.
- `prepare()` runs local question masking only; it NEVER approves or sends.
- Render `snapshot.preview.text` and `preview.reviewWords`. Every question needs
  its own explicit review/approval button, regardless of `needsReview`.
- `approveAndSend()` is called only by that button. It approves the exact engine
  draft, calls the chosen bridge with the engine ticket, restores locally, checks
  the active revision again, and appends an immutable display-only message.
- `close()` discards text/preview/messages and invalidates pending masking,
  sending or restoration. No completion may reopen a closed conversation.
- States: `editing`, `masking`, `review`, `sending`, `error`, `closed`. Failed sends
  discard the preview/ticket; retry requires preparing and explicitly reviewing
  a NEW question ticket. No automatic retry.

Use the existing review-session instance; do not reconstruct a batch from its
visible clauses. After its explicit document approval and successful current
results, call `session.openChat(chatBridge)`. It retains the exact registered
batch privately. Calling it earlier or after an external remask fails. Repeated
calls reuse the active conversation; changing transport closes the previous one.
`ReviewSession.edit()` and `mask()` automatically close chat before an accepted
change/remask, even when the subsequent mask fails. Call `session.closeChat()`
on view unmount/reset. The document result remains available after closing chat.

Platform selection at the composition root, once activation gates pass:

```ts
// Existing analysis bridge remains unchanged. Never initialize web Firebase on a phone.
const chatBridge = Capacitor.isNativePlatform()
  ? new NativeChatBridge()
  : new CloudChatBridge(existingAppCheckProtectedAI);
const conversation = reviewSession.openChat(chatBridge);
// UI: useSyncExternalStore(conversation.subscribe, conversation.getSnapshot,
//                          conversation.getSnapshot)
```

`openChat()` currently reports `not_approved` because the engine seam fails closed.
Render a clear unavailable/pending-integration state; do not add mock tickets or
answers to the product. `chatFlow.test.ts` provides TEST-ONLY mocked-engine state
examples for developing the view. Those tests are not actual masking or model
acceptance. No App/Workbench markup or redesign styles are replaced by this work.

Messages contain restored local display text and exact clause IDs. Use those IDs
for accessible links to the current clause list. Never pass displayed messages,
raw questions, filenames or restored names back into either bridge. Each bridge
owns its own validated MASKED history; the UI cannot provide a history array.

## Native method Aarush needs to implement

`src/nativeChat.ts` registers the SAME `ClauseGuardAI` Capacitor plugin, without
web Firebase initialization, new providers or document-vault access. Swift and
Kotlin add a stateless `chat` method, distinct from `onDevice` and `analyzeClause`:

```ts
type NativeChatRequest = {
  system: string;        // fixed CHAT_PROMPT from core/chat
  input: string;         // JSON: contract, masked history, masked question only
  schema: object;        // status/answer/citations schema supplied by JS
  model: string;         // shared verified ANALYSIS_MODEL
  cloudOnly: true;
  timeoutMs: number;     // CHAT_LIMITS.timeoutMs = 30000
};
type NativeChatResponse = { text: string; source: 'cloud' };
```

- Add `chat` to the Swift Capacitor method list as well as implementing the method.
- Reject non-cloud requests, unsupported models and malformed/oversized inputs.
  Use the existing App-Check-protected Gemini Developer API configuration. No
  on-device fallback, tools, search, retries or provider-managed conversations.
- Android can reuse the existing `runCloud()` helper from #35: it already sets
  ONLY_IN_CLOUD, the response schema and checks `InferenceSource.IN_CLOUD`.
- iOS can reuse `AnalysisSupport.run(source: "cloud", ...)` after checking its
  actual source verification and App Check setup. Never return cloud merely
  because the request asked for it. Its current task-group timeout requires
  cooperative cancellation; JS also bounds and discards noncooperative completion.
- Return raw JSON text and actual confirmed source only. Shared TypeScript performs
  schema/token/citation validation, one-use consumption, current checks and masked
  history. Native code must not persist provider history or log input/output/errors
  that can echo input. Use fixed errors; no localizedDescription on the raw path.
- A missing native method, missing config, failed App Check or unsupported SDK is
  unavailable. Do not silently substitute another transport or remove enforcement.

The shared `ApprovedChatDispatcher` now owns the web/native lifecycle so they
cannot diverge on projection, guards, deadlines, serialization, limits or history.
Transport setup is synchronous after config. The final engine consumption and
actual native/SDK dispatch have no await gap. Wrapper instances share state for
one Firebase app/native plugin and context identity. Clear permanently closes
that context in the bridge. JS timeout/clear cannot recall already dispatched
server work; a late native result is discarded, not evidence no inference ran.

Native config currently uses the shared static defaults, matching #35. Web Remote
Config is not read on mobile. Before activation, explicitly verify the current
no-billing/model availability policy for phones; do not describe web kill switches
as remotely controlling this native path. No cloud use is authorized merely by
this adapter compiling.

## Engine delivery required from Likhil

Bind `src/chatEngine.ts` and `src/chatGuard.ts` directly to the real engine exports
confirmed in #13. All current functions deliberately throw `not_approved`; there
is NO production registry, issuer, boolean bypass or injectable authorizer here.

The concrete preview UI shape proposed here is `MaskedQuestionDraft` plus frozen
`reviewWords: readonly string[]` and `needsReview: boolean`. Confirm these field
names or adapt the thin seam to the actual engine type. The review-word list is
what #13 requested for unreplaced capitalized words; it is not implemented by the
cloud/UI layer. `ambiguous_entity` now has a fixed sanitized error message.

The actual engine must retain per-run variants, reject ambiguous short forms,
reuse known entity tokens, allocate new collision-free append-only tokens, keep
question maps separate from the persistent vault (including external native keys),
freeze/register contexts/drafts/tickets, atomically recheck/consume once, invalidate
on remask even if it fails, and restore into a NEW display reply with current checks.
Use the existing CHAT_INTEGRATION.md acceptance matrix. Do not call document
`mask()` on a question or build an issuer in the UI/bridge to unblock the view.

## Verification and remaining gates

Completed local tests use mocked provider/native calls and TEST-ONLY engine
stand-ins. Separate real-boundary tests prove both transports and all engine
seams reject forged inputs before setup/dispatch. Existing web lifecycle cases
continue to run against the shared dispatcher. UI cases include per-turn approval,
edit/close races, failed tickets, immutable display history, stale restoration,
exact batch handoff and closing before failed remasks. No live model/device proof
is inferred from these checks. Final counts/build results are recorded in the
execution tracker and GitHub checkpoint after verification.

Still required, in order:

1. Real engine exports and owner-reviewed binding; actual known/new/ambiguous-name
   and partial-address masking tests, including external-key/vault separation.
2. Native Swift/Kotlin `chat` implementation, builds and actual source/attestation
   proof; UI view binding with accessible review/citations/reset/error states.
3. Current no-linked-billing account/free-model policy verification before ANY
   inference. Native apps/configs alone do not establish App Check readiness.
4. Inspect actual outgoing payload/history and all six sample questions plus
   missing-context probes, follow-ups, offline, stale/clear and injection variants.
5. Owner-reviewed integration into main, then current main/hosted/phone acceptance.
   Neither #31 branch scores nor mocked chat tests satisfy main or native checks.

## Requests handled from the new repo activity

- #17: Android/iOS app.clauseguard registrations created, both SDK config files
  downloaded/validated outside Git; private delivery awaits Aarush's address/channel.
  Spark and no linked Cloud Billing account verified before registration. No IAM,
  App Check enforcement, debug token, Analytics, billing or model call change.
- #35 at 6cf643e: 191 web + 94 engine tests, web typecheck/build pass. One-clause
  native request shape accepted. Full SDK error descriptions on the iOS raw-text
  path were flagged to the author; real native builds/device evidence remain open.
- #36 at 628c44e: App-to-Workbench split accounted for. Flagged absolute privacy
  claims and reduced-motion smooth-scroll fallback in source review. No visual,
  native or combined-main acceptance claimed. Teammate branches remain untouched.

Initial local verification, before the final stale-history correction: **331 web + 94 engine tests**, core typecheck and web
production typecheck/build pass. This adds 35 web cases to the initial 296-test
chat branch. A disposable integration checkout combining this source commit
1ed7bea with #35 at 6cf643e and #36 at 628c44e merges cleanly and passes **344 web
tests and production typecheck/build**. These are local combined-branch checks,
not main/native/browser acceptance; #32/#33 are not in that combination. The
redesign build emits a >500 kB chunk advisory; no budget limit was suppressed.
All local source branches/worktrees and previous failure evidence are preserved.

Final review correction after the first compatibility pass: a new regression
reproduced retention of an earlier restored message when external remasking made
local question preparation stale (old controller at 1ed7bea: phase error, old
message retained; required: closed, empty messages/question). The shared failure
path now closes/clears on stale or wrong-session errors, including during reply
restoration. Cleanup exceptions cannot retain display data or surface raw SDK
errors. The original failing test log is retained locally at
/private/tmp/clauseguard-chat-stale-history-before.log. Tests also cover a throwing
cleanup. These corrections supersede the earlier 331/344 counts; final counts
are reported in the publication checkpoint and execution tracker below.
