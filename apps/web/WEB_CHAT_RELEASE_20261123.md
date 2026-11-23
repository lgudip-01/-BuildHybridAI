# Functional web chat — November 23, 2026

## Verified behavior

Web chat is enabled with the existing Firebase AI Logic Gemini Developer API,
`gemini-3.5-flash-lite`, and enforced App Check. No automatic retries, model
switching, paid fallback, billing linkage, API enablement or enforcement change.
The project was rechecked November 23 around 15:06 Eastern: Spark $0 and no
linked billing account. Developer API enabled; Agent Platform/Vertex disabled.
Pricing references: https://firebase.google.com/pricing and
https://ai.google.dev/gemini-api/docs/pricing . Free quotas can stop service;
HTTP 429 pauses cloud chat for that Firebase app for the page lifetime.

After masking, choose **Approve for chat** without running clause analysis.
This creates a genuine approved engine batch, not a fabricated analysis result.
Each question still requires its own exact masked preview and **Approve & send
question**. The approved document, masked question and masked conversation history
are projected into the request. Details are restored only locally. Document
edits invalidate chat. Chat-only answers link to approved masked source clauses;
analysis-result chat keeps its existing result-card links.

Review words are highlighted at every occurrence without modifying the exact
approved text or breaking placeholders. Stale/closed document recovery explains
that masking and approval must be repeated. Provider HTTP 5xx and quota errors
use fixed safe messages. SDK status is read from `AIError.customErrorData.status`;
unit regressions use actual Firebase AIError objects, without exposing messages.

## Acceptance and limits

- 355 web tests, 158 privacy-engine tests, production typecheck/build passed.
- Real local Chrome Nano masking + real cloud chat succeeded for lease, NDA,
  freelance, offer letter, SaaS and promissory note synthetic repository samples.
- Normal product flow separately answered the synthetic Lucia/$250/30-day
  question and its source link resolved to the approved masked clause.
- Missing-information probes returned insufficient context for bank details,
  damages cap, data-center location and an exact note maturity date.
- Ambiguous Mendoza was rejected locally with no extra SDK generation request.
  Full street prefix and new Avery/$300 values were masked before approved sends.
- Actual SDK generation body evidence is in WEB_CHAT_LIVE_EVIDENCE_20261123.json.
  All 18 captured payload snapshots passed the contract/history/question
  projection allowlist and contained none of the fixtures' expected masked raw
  values. Some snapshots repeat earlier history turns; this is not 18 unique calls
  and not all-endpoint privacy certification. Normal product proof is UI-only.
- Preserve failures: initial freelance ownership returned model_error before
  HTTP observation was added; later freelance venue and offer bonus returned
  HTTP 500 INTERNAL. A single explicit 3.1 comparison also returned HTTP 500;
  the final model is restored to 3.5, with no runtime fallback. After a multi-hour
  gap, successful product/SaaS/note checks and one fresh independently reviewed
  freelance/offer question succeeded. This does not establish general reliability
  or diagnose a provider-wide outage.
- Conservative masking overreaches: an offer document title is NAME_1; the
  question span “If Avery Chen” became NAME_1 and restored awkwardly in its
  answer. Human preview remains necessary; no universal masking/accuracy claim.
- The diagnostic HTML/fetch observer is localhost DEV-only and excluded from
  the default production build. It records body fields/status/model only,
  never headers, query strings, credentials, tokens or arbitrary endpoints.

## Source provenance and preserved work

This is stacked on #39 (ba2d858), with real engine #37 and binding #38 ancestry.
It adopts reviewed #32 masking coverage/provenance corrections from the isolated
full integration de3bc38, including URL/IP/handle types and rule-based checks.
It does not replace #32 or merge main. #33 imports, #36 redesign and Sai's
42dfdcc masking-progress work remain preserved for separate adoption.

Native chat is intentionally separate: #40 supplies candidate Swift/Kotlin
methods, but the JavaScript native release stop is retained and main hides the
mobile chat entry point. Full Xcode/Android SDK builds, native App Check and real
phone verification remain required. Do not describe this web release as native
chat acceptance. No teammate branch or original project folder was overwritten.

## Next checks

Publish exact tested source; deploy Hosting only to clause-guard-hackathon;
verify one real synthetic chat answer and source link on the hosted production
origin with enforced App Check. Record the resulting revision in the PR. Then
adapt the verified flow into Sai/Aarush's latest UI without discarding their work,
and complete native device build/testing when toolchains are available.

## Deployment acceptance

Published runtime tree 78b0bb21fad28e5fbed5743df59b0a4ea1c4bb05 exactly matches
the tested runtime files. PR: https://github.com/lgudip-01/-BuildHybridAI/pull/44 .
Hosting-only deployment completed November 23, around 15:30 Eastern.
https://clause-guard-hackathon.web.app returned an actual cloud answer to the
synthetic Lucia question: $250 to Example Services LLC within 30 days. Its
#chat-source-c1 link resolves to the approved masked clause, containing only
PARTY_A/PARTY_B/AMOUNT_1 placeholders. Production App Check remained enforced.
The diagnostic is absent from the 59-file static production output.

Sai's newly opened #41/#42/#43 were inspected. Next integration covers progress,
manual mask/reveal/undo, confirmed clause sources and deletion. Manual edits or
deletion must synchronously invalidate chat/question approvals; deletion clears
per-document review choices. These features are not part of this deployment.
