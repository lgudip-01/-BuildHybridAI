# Privacy engine

**Owner:** Likhil Gudipati

## What you build

The shared TypeScript code that makes sure no sensitive detail reaches the cloud. It runs the same way on web, Android, and iOS.

**Input:** clauses from the document splitter. **Output:** masked clauses that passed the leak check, ready for the cloud.

1. **Find** sensitive details. Pattern matching catches amounts, dates, emails, phone numbers, and account numbers. The on-device model catches people, organizations, and addresses.
2. **Mask** them with placeholders that stay the same across the whole contract (`Acme Corp` is `[ORG_1]` everywhere it appears).
3. **Store** the placeholder map, encrypted, on the device only.
4. **Leak check** the masked text, and block the send if anything sensitive is still there.
5. **Unmask** the cloud's answer by swapping placeholders back for the real values.
6. **Classify** each clause type on device, while the raw text is already in your hands.

## Tech stack

| Part | Tool |
| --- | --- |
| Language | TypeScript (in `packages/privacy-engine/src/`) |
| On-device AI | `AiBridge.onDevice()` (Gemini Nano 4 on Chrome and Android, Apple Foundation Models on iOS, all in `ONLY_ON_DEVICE` mode) |
| Structured output | A JSON schema on the on-device call, so it returns a list of entities |
| Pattern matching | Plain regex |
| Local storage | IndexedDB through the `idb` wrapper (it works inside the mobile WebViews too) |
| Encryption | Web Crypto AES-GCM with a non-extractable key |
| Tests | Vitest, using the sample contracts and expected masks in `samples/` |

## Architecture

```
clauses[] ──► 1. Regex pass ─────┐
          └─► 2. On-device pass ─┤   (AiBridge.onDevice, ONLY_ON_DEVICE)
                                 ▼
                     3. Merge + resolve overlaps
                        (longest match wins; regex wins on numbers and dates)
                                 ▼
                     4. Assign placeholders ──► Vault (IndexedDB, encrypted)
                        [PARTY_A] [ORG_1]         { "[ORG_1]": "Acme Corp", ... }
                        [AMOUNT_1] [DATE_1]
                                 ▼
                     5. Replace text (last match first, so positions stay valid)
                                 ▼
                     6. Leak check
                        • rerun regex on the masked text
                        • search for every real value from the vault
                        • any hit → BLOCK and show the user
                                 ▼
                     MaskedClause[] (CleanText) ──► AiBridge.analyze()
                                 ▼
cloud result ──► 7. Unmask: replace only known placeholders, ignore made-up ones
```

**Files:**
- `regex.ts`: pattern matching
- `onDevice.ts`: the model's entity pass, and clause classification
- `merge.ts`: combining matches and resolving overlaps
- `placeholders.ts`: assigning placeholders
- `vault.ts`: the encrypted local map
- `leakCheck.ts`: the leak check, and the only code that can create `CleanText`
- `mask.ts`: runs steps 1 to 6
- `unmask.ts`: step 7

## What teammates get from you

- `mask(docId, clauses, bridge) → MaskResult`, which feeds the cloud call and the privacy ledger. If `needsReview` is true, the UI must get the user's approval before sending.
- `unmask(docId, results) → Analysis[]`, which feeds the UI
- `classify(bridge, clauses) → ClauseType[]`, which runs on device

## When there's no on-device model

Use regex plus a check for capitalized phrases (likely names). Then **require** the user to review and approve the masked text before it's sent. Never fall back to the cloud for masking.

## Milestones

- **Nov 16:** regex pass and placeholders working on one sample contract, with tests
- **Nov 20:** on-device entity pass, merging, vault, and leak check
- **Nov 22:** `mask` and `unmask` done against a mocked bridge
- **Nov 25:** tested on the real bridge on all three platforms

## Traps

- The model tells you *what* the names are, but your code must find *every place* they appear, including "Acme's", "ACME", and the short form "Acme".
- Leave generic roles like "the Company" and "the Client" unmasked. The cloud model needs them to understand the clause.
- On-device context windows are small. Send one clause per call, and split long clauses.
- Gemini Nano 4 and Apple Foundation Models will answer differently. Test the same prompt on both.
- Never pass raw text to anything except `onDevice()`. The `CleanText` type enforces this.
