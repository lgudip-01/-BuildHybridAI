# Genuine chat-engine candidate

November 22–23, 2026. Separate candidate stacked on #34 at 0ab24d8. Prepared to
advance the highest-priority chat dependency without waiting for an unpublished
engine branch. This is an actual privacy-engine implementation, not a bridge-side
approval stand-in. **Production chat seams and guards remain unbound/rejecting.**
No main merge, deployment or cloud inference is included.

## Delivered engine API

`packages/privacy-engine/src/chat.ts` exports:

- `prepareChatContext(batch)` accepts only an exact, current engine-approved
  document batch with its real masking snapshot. It validates limits and freezes
  an explicitly projected masked context. Knowing/copying IDs or TypeScript brands
  cannot register another context or question.
- `maskQuestion(context, raw, bridge)` runs only local pattern/name extraction and
  the on-device pass when available. It never calls document mask(), reads/writes
  the vault, or invokes cloud analysis. Every preview is registered/frozen and has
  frozen `reviewWords` plus `needsReview: true`. No automatic approval.
- `approveQuestion(context, preview, {reviewed:true})` issues one frozen ticket per
  genuine current preview. Wrong-session/copy/stale/unreviewed objects fail.
- `assertChatApproved`, `consumeChatQuestion`, `assertChatCurrent` implement the
  agreed lifecycle. Consumption rechecks all guards and marks used in the same
  synchronous call; consumed tickets cannot authorize another send.
- `unmaskChatReply(context, ticket, reply)` requires consumption and current
  identity/revision, validates source/turn metadata, exact schema/citations and
  turn-specific tokens, leak-checks known raw values, and returns a NEW immutable
  restored display object. It rejects a restored answer fed back in as masked.
- `closeChatContext(context)` drops the context's question maps and invalidates
  outstanding drafts/tickets. It is idempotent for genuine contexts. This cleanup
  addition should be bound together with the seven originally agreed functions.

The actual engine objects are used in `chatEngineIntegration.test.ts`; only the
module binding and provider/config calls are test-local. No test issuer replaces
engine authority there. Separate tests still exercise the real production seams
and prove that they reject before SDK/native dispatch.

## Run snapshot and token rules

Real document mask() now passes its final registry/variant snapshot to seal().
The snapshot is private RAM data, never attached to MaskResult, ApprovedBatch,
context, outgoing payload or the persistent vault. Original variants retain the
ambiguity that entity deduplication deliberately removes. Starting a newer run
removes the old snapshot and synchronously releases registered contexts before
any mask await, even if the new run fails. Existing analysis approvals/masked
output/vault ordering remain unchanged.

Each context copies its own append-only question map. All original token suffixes
are reserved, including PARTY letter suffixes. New person/org values discovered
in QUESTIONS use PERSON/ORG; the local model's party flag cannot establish a
party to the approved document. Known actual document PARTY tokens are reused.
Two genuinely distinct people sharing a first/surname remain distinct; a bare
ambiguous alias blocks. Defined company aliases and uniquely recognized street
prefixes reuse original tokens. Shared-unit street prefixes block rather than
choosing a unit. Full names remain usable.

No token visible in a successful preview is reassigned. Allocation/map changes
are committed synchronously only after local validation; failed previews publish
no partial map/tokens. Out-of-order local completions allocate against the current
map after their awaits. An earlier turn's restoration allowlist is a snapshot of
its contract, question and previously completed validated turns: later/failed
question values cannot silently become references in the earlier answer.

Conservative limits/behavior for owner review:

- At most 512 token values and 64 prepared drafts per context; exceeding a limit
  stops with history_limit and requires a new context. Raw/masked question limit
  remains 2,000 characters. Local status/model work is bounded at 60 seconds; late
  completion cannot change maps. The existing cloud deadline remains 30 seconds.
- Generic NAME entities with no safe person/company classification do not acquire
  guessed personal aliases. Their short fragments block. Lowercase uses of a
  capitalized single-word alias also block/rephrase because it can be an ordinary
  noun/verb. Full names remain case-insensitive. This favors explicit rephrasing
  over silently assigning identity or leaving known name fragments raw.
- New values can be found by the on-device model, but unknown single-word names
  can still be missed. Unreplaced capitalized words are listed for HUMAN review;
  lowercase unknown names cannot be certified by that list. Every question still
  needs review. Neither a valid preview nor these tests prove complete redaction.
- Module-internal approval functions follow the existing trusted engine-module
  boundary; this does not claim protection against malicious same-origin code.

## UI binding remains disabled

`chatEngine.ts` now shares the core preview type and has a fail-closed cleanup
seam. `ChatConversation.close()` attempts both transport and engine cleanup even
if one throws, and always clears display state. Existing close/edit/remask/stale
UI protections remain. After owner review, replace the thin seams/guards with
DIRECT real engine re-exports; do not add a second registry in web/native/UI.

The ordinary App/Workbench still does not render a chat view or initialize a chat
transport. Aarush/Sai can build the view against the existing controller; native
Swift/Kotlin chat methods remain a separate missing implementation. See
CHAT_UI_MOBILE_HANDOFF.md for that concrete contract. No mocked model answer is
added to production.

## Automated verification

Final corrected candidate: **140 engine tests (46 new), 340 web tests (seven new
real-engine integration cases)**; engine/core typechecks and web production
typecheck/build pass. Existing real-boundary fail-closed tests remain. The local
HTML diagnostic is absent from the production build output. No test bypass or
assertion was removed to make a redaction pass.

New coverage includes real batch/context/draft/ticket identity, explicit review,
one-use consume, wrong sessions, failed/external remasks, close/late completion,
known/new/shared/Unicode aliases, same-question repeated names, counter reservation,
draft/token bounds, external-key operation with NO vault load/save during chat,
turn-scoped restoration, raw-response leakage, failed-turn exclusion and real
UI/bridge projection with mocked SDK dispatch.

Failure evidence retained:

1. First engine suite: 36 passed/two failed. A broad coordinated phrase replaced
   both borrowers with one new NAME token; a newly introduced first name later in
   the same question failed the leak gate. Corrected by protecting known full
   identities and a staged alias pass after all new full identities are registered.
2. Actual Nano initially labeled Sam/Ada as new PARTY_E/F from question wording.
   A separate regression reproduced person/org party promotion (43 passed/one
   failed). Normalizing new question entities to PERSON/ORG corrects it; document
   PARTY identities remain unchanged. Pre-correction source/test commit b0a4a22
   and browser evidence are retained. This is a semantic label correction, not a
   claim that an unmasked name was sent to a provider.
3. Early test-only literal typing errors were corrected before final typechecks.

Local logs: /private/tmp/clauseguard-chat-engine-first-tests.log,
/private/tmp/clauseguard-chat-engine-party-before.log,
/private/tmp/clauseguard-chat-engine-browser-initial.json. The initial diagnostic
included a static cloudRequests:0 field; it was NOT a captured network measurement
and has been removed. The current counters count actual Prompt API attempts,
completions and failures only. The local diagnostic contains no Firebase/provider
transport at all; it never starts a model download and only uses availability
`available`. Official API references:
https://developer.chrome.com/docs/ai/prompt-api and
https://developer.chrome.com/docs/ai/get-started .

## Remaining release gates

This branch inherits #34's current pattern library. The additional card-expiry/
security-code, URL/IP/handle and other masking work in #32 is NOT duplicated or
adopted here, and its previously reported review-flag correction remains open.
Do not infer coverage of those PII classes from the synthetic person/address
checks. Review/adopt/retest the corrected pattern branch before activation.

Owner review of snapshot/alias rules and the new cleanup/limits; direct engine
binding; real outgoing payload and full six-sample privacy/answer/follow-up checks;
Aarush's native chat methods and UI view; current no-billing/model/App Check
verification before ANY cloud inference; actual phone evidence; reviewed main
integration and current main/hosted acceptance. #32/#33 fixes/adoption remain
separate. This candidate is not main/native/cloud answer acceptance.

## Corrected local browser matrix — November 23, 12:00 AM Eastern

Frozen engine source d2ac4ec: all eight fixed synthetic cases reached the expected
outcome in a single corrected run. Two document and seven question Prompt API
calls completed (nine attempted, nine completed, zero failed); the invented token
was rejected before model setup. This is direct Chrome on-device execution, not
a cloud answer. The document preview was inspected before explicit local approval.
The new-name ticket was consumed once and replay rejected without any provider
dispatch. The context was closed and the agent-owned local server stopped.

| Case | Observed corrected outcome |
| --- | --- |
| Known person/company | Lucia → PARTY_A, Northwind → PARTY_B |
| New full/first name | Sam Ortega and Sam → PERSON_1, both occurrences |
| New first name | Ada → PERSON_2 |
| Shared surname | Mendoza blocked with ambiguous_entity |
| Distinct full names | Rafael Mendoza → PARTY_C; Isabel Mendoza → PARTY_D |
| Partial street | 42 Elm Street → ADDRESS_1 |
| Injection text | Instruction text stays data; known identities are masked |
| Invented placeholder | PERSON_999 blocked with unknown_placeholder |

Exact initial/corrected previews, counters, source commit and digest are in
CHAT_ENGINE_BROWSER_EVIDENCE.json. The initial run's PARTY_E/F issue and its
correction remain visible. This is bounded synthetic privacy/authority evidence;
it is not a full six-sample answer matrix or complete-PII/citation/phone proof.

A separate disposable combination of this candidate with #35 (6cf643e) and #36
(628c44e) merges cleanly and passes **353 web tests and production typecheck/build**.
The redesign's >500 kB chunk advisory is retained. This is local TypeScript/web
compatibility, not a Swift/Kotlin build, phone or main acceptance; #32/#33 and their
pending corrections are deliberately excluded from that combination.
