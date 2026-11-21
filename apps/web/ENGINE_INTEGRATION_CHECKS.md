# Engine integration and live sample checks

Engine d7af3b4 (PR #2) is integrated with the cloud analyzer in this branch.
approvalGuard.ts imports the real approval module directly. No optional glob,
approval bypass, or mocked engine registry is used in the application.

Validation: 9 real-engine integration tests (model SDK mocked), 50 analyzer/config
tests, 72 engine tests, and web typecheck/production build pass. This establishes
orchestration and identity protection, not live Gemini/Nano behavior.
The project owner also verified published Remote Config in their Chrome browser.

## Live browser checks

Use this integration branch, not an older downloaded ZIP. Register your own App
Check debug token if using a new browser origin. Start the web dev server.
Open DevTools Console and paste each block separately:

```js
var samplesCheck = await import('/src/sampleRoundtrip.ts');
var samplePreview = await samplesCheck.prepareSample('nda');
console.table(samplePreview.result.clauses);
```

Inspect every clause for remaining private details before continuing. This stage
uses the real local engine; raw fixture text never enters analyze(). It also
blocks if a value listed in the fixture's `mask` expectations survives. That
check is additional coverage, not proof of complete privacy.

After reviewing the masked text, paste:

```js
var sampleAnswer = await samplesCheck.runSample(samplePreview, { reviewed: true });
console.log(sampleAnswer);
```

This sends masked clauses for analysis and can consume one cloud request per
clause. A complete cloud check needs status SAMPLE_ROUNDTRIP_COMPLETED, zero
failures, ranOn cloud, matching clause count, and sensible locally restored text.
SAMPLE_PARTIAL must be investigated; ranOn device is an actual device result and
does not establish a cloud pass. There is no retry loop or automatic six-sample send.

Repeat preparation, review and analysis for freelance, lease, offer-letter,
promissory-note, and saas. Record only sample name, counts, source and failure
reasons in GitHub. Do not post tokens or full console dumps.

In Network, inspect generateContent request payloads. They should contain clause
id/type and masked text, never the original fixture values, vault or docId. When
masking alone, there must be no cloud generation request carrying raw text.

## Offline check

With Nano fully downloaded and available, prepare/review a fresh sample while
online. Turn DevTools Network to Offline, then runSample. Record the actual
source and failures; do not assume PREFER_IN_CLOUD provides working fallback.
Restore No throttling afterwards. Remote Config analysis and fallback flags must
be true. This is a separate check from the six cloud checks.

## Product UI handoff

Sai still owns the product UI approval step. Use one stable docId per opened
document, clear analysis on edits, serialize mask/unmask operations, keep the
exact engine result and approved object, and assert before/after unmasking.
The development sample harness does not implement the product UI.

Chat remains separate: Likhil accepted the proposed interface with atomic
validation/consumption, an AiBridge parameter for maskQuestion, append-only
in-memory question maps, ambiguous-entity rejection and capitalized-word review.
Sai's confirmation and the actual chat engine are pending; no chat send is enabled.
