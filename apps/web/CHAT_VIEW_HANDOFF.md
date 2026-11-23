# Product chat view candidate — November 23, 2026

Stacked on #38 at 5af24e9. ReviewChat now connects the actual ChatConversation
lifecycle to a shared React panel. App renders it only for current document
results and a supplied ChatBridge. ReviewSession.openChat still requires the
exact genuine approved batch; no new UI approval registry exists.

## Behavior

- Opening is explicit. Typing never sends or approves. A question is limited to
  2,000 characters and must be masked locally before its approval action appears.
- The preview shows exact masked text and every reviewWords warning from the
  engine. An edit removes the preview/approval action and requires fresh masking.
- Only the explicit per-question action invokes approveAndSend. The unconditional
  production release stop from #38 remains intact. A safe error says no question
  was sent; no answer, source badge or automatic retry is invented.
- Close clears the controller, and accepted document edits/remasks/imports close
  it through ReviewSession. Component unmount calls closeChat. Stale completions
  remain guarded by the existing controller and engine.
- Valid restored answers render as escaped text, with insufficient-context wording
  and supplied clause anchors. Restored display history never becomes transport
  input. Drafts/history are not persisted, logged or placed in URLs.
- main.tsx shares the existing initialized protected web AI between WebBridge and
  CloudChatBridge. Phones instantiate NativeBridge/NativeChatBridge without web
  Firebase initialization. Constructors do not dispatch chat. Native plugin chat
  implementation and real phone evidence remain required.

## Verified evidence and limits

348 web tests pass in the thin branch, including seven new view cases. These use
actual event handlers, real ReviewSession/ChatConversation/engine authority and
production outbound stop. A separate display-only malicious-text fixture checks
escaping and supplied citation anchors; it is not a model answer.
The web production typecheck/build passes. Engine source is unchanged from #38.

Full isolated redesign/import/mobile combination at e43d254: 391 web tests and
web production typecheck/build pass. The existing engine baseline remains 158
passing tests from the prior integration; no engine change in this increment.
The >500 kB bundle advisory remains (593.76 kB main chunk minified).

Local Chrome UI fixture: explicit open, genuine known-name masking (Lucia becomes
[PERSON_1]), per-question approval, actual release_pending rendering, then contract
edit removes the draft/view. At a 430×932 CSS viewport there is no horizontal
page overflow (scrollWidth 430). Desktop and narrow layouts were inspected. The
fixture uses synthetic unavailable document analysis and pattern-only masking,
with real chat engine/controller/dispatcher; it does NOT initialize Firebase or
call a model. Config/provider counters both remain zero. This is not live AI,
network-capture certification, iPhone hardware or Android evidence. Local-only
fixture files are untracked and excluded from publication/default build input.
Screenshots are retained locally as clauseguard-chat-view-preview-mobile-20261123.jpg
and clauseguard-chat-view-blocked-mobile-20261123.jpg. The loopback server was stopped.

## Redesign adoption

The thin branch wires App.tsx from #38. When adopting #36 plus the previous
CHAT_WORKBENCH_RESOLUTION.patch, keep its page wrapper instead of copying the
thin App over it. Add the shared ReviewChat source/test, main.tsx bridge wiring
and scoped CSS from this PR; apply CHAT_VIEW_WORKBENCH.patch for the App/Workbench
prop forwarding and results-only mount. The patch was reverse-checked against
our isolated integration. Full combined source remains LOCAL ONLY, not published
as a replacement for author branches. All primary/teammate work is preserved.

## Next gates

Owner review/adoption of the engine, bindings and view; native Swift/Kotlin chat
methods; current no-billing/provider/App Check verification; bounded live
payload/answer/privacy acceptance; actual phones/demo. Release activation is a
separate reviewed change. Do not remove the unconditional outbound stop or fake
successful answers to demonstrate this candidate. No cloud call, activation,
deployment, payment, billing, IAM or enforcement change in this increment.
