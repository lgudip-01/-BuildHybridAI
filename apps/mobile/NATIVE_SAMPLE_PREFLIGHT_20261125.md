# Independent native sample preflight — November 25, 2026

#60/47e08be has no new owner build result at this checkpoint. #58 SDK review is
also pending. No device/build acceptance gate was advanced by this work.

This test-only follow-up exercises the actual NativeBridge, clause splitter,
masking, encrypted fixture vault, approval, shared native adapter/validation,
unmasking and deletion against all six public repository contracts. The native
plugin is mocked. It returns synthetic source-echo answers with either cloud or
device metadata; those labels are fixtures, not verified inference sources.

## Offline results

| Sample | Required strings absent after masking | Required terms retained |
| --- | ---: | ---: |
| NDA | 9 | 5 |
| Freelance | 15 | 6 |
| Lease | 14 | 5 |
| Offer letter | 10 | 6 |
| Promissory note | 14 | 5 |
| SaaS | 8 | 8 |
| Total per synthetic source | 80 | 35 |

All 12 cases pass (six samples times two metadata sources). They verify:

- Unavailable local model gives zero complete reads and requires explicit review.
  Approval without reviewed=true fails before dispatch.
- Current fixture mask/keep lists are checked case-insensitively. Counts reflect
  today's JSON fixtures, not older 70/34 device-evaluation targets.
- Native input is projected to id/text only and contains none of the fixture's
  required sensitive strings. Source pinning is null initially, then consistent.
- The synthetic replies pass the unchanged validator and are restored through the
  actual local vault with exact token substitution and no leftover placeholders.
- Deleting the vault invalidates the old approved batch before another native call.

Full web suite: 454 tests pass. Web typecheck and production build pass; all 63
production output files match #60's tested build byte-for-byte. Only a test file
and documentation/tracker differ from #60. Engine/native production source,
configuration, dependencies and approval/parser rules do not change. Prior #60
engine/native policy results remain credited; no unnecessary SDK rerun requested.

Run from apps/web after installing locked dependencies:

```sh
../../node_modules/.bin/vitest run src/nativeSamples.preflight.test.ts
```

No real native SDK/plugin, model, provider, network call, Firebase config or raw
user contract is involved. Source-echo replies are intentionally synthetic: this
cannot establish classification accuracy, legal content quality, on-device model
support, real cloud provenance, attestation, quota/cost state or physical phones.

## Next gate

Aarush's one combined SDK build on #60 remains the next native gate. This test-only
follow-up leaves its production source and build output unchanged and does not
require a second SDK matrix. Physical devices and attestation, genuine bounded
sample/content/restoration acceptance after fresh no-cost/App Check checks, main
owner integration and exact-main/hosted validation remain separate. Do not enable
native chat or count this matrix as completed cloud acceptance. No deployment,
main merge, service activation or billing change occurred.
