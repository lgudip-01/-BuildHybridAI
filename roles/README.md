# Roles

Pick a role, put your name in the roles table in the [main README](../README.md), and tell the team. Everything here is tentative, so suggest changes.

| Role | Overview | Name |
| --- | --- | --- |
| Privacy engine | [privacy-engine.md](privacy-engine.md) | Likhil Gudipati |
| Cloud AI and Firebase | [cloud-ai-firebase.md](cloud-ai-firebase.md) | Dhruv |
| Web app and extension | [web-and-extension.md](web-and-extension.md) | Sai Nagadheeraj Kamsani |
| Mobile (Android and iOS) | [mobile.md](mobile.md) | TBD |
| Documents, testing, and demo | [documents-testing-demo.md](documents-testing-demo.md) | TBD |

---

## How the pieces connect

```
                 ┌──────────────── shared TypeScript + React ────────────────┐
 contract file   │                                                           │
 or web page ──► │ Documents ──► Privacy engine ──► AI bridge ──► Privacy    │ ──► UI
                 │ (extract,     (mask, leak        (cloud call)   engine     │  (heatmap,
                 │  split)        check)                           (unmask)   │   cards,
                 └───────────────────────┬───────────────────────────────────┘   ledger)
                                         │ on-device calls
                     ┌───────────────────┼────────────────────┐
                     ▼                   ▼                    ▼
               Web: firebase/ai   Android: Kotlin plugin   iOS: Swift plugin
               (Gemini Nano 4)    (Gemini Nano 4)          (Apple Foundation Models)
                     └──── all through Firebase AI Logic + App Check ────┘
```

Everything except the AI bridge is written once and runs on all three platforms.

## Shared contracts

Agree on these first so everyone can build against mocks from day one. They live in `packages/core/src/types.ts`.

```ts
type Clause = { id: string; index: number; heading?: string; text: string };

type ClauseType =
  | 'payment' | 'termination' | 'confidentiality' | 'ip' | 'liability'
  | 'indemnity' | 'non_compete' | 'governing_law' | 'other';

type EntityKind =
  | 'PARTY' | 'PERSON' | 'ORG' | 'NAME' | 'ADDRESS'
  | 'AMOUNT' | 'DATE' | 'EMAIL' | 'PHONE' | 'ACCOUNT';

// Text that passed the leak check. Only the privacy engine can create one,
// and the cloud call only accepts this type, so raw text can't be sent by mistake.
type CleanText = string & { readonly __brand: 'leakChecked' };

type MaskedClause = { id: string; type?: ClauseType; text: CleanText };

type LedgerEntry = { placeholder: string; kind: EntityKind; clauseIds: string[] }; // never the real value

type MaskResult =
  // needsReview: masked without the on-device model, so the user must approve before sending
  | { ok: true; clauses: MaskedClause[]; ledger: LedgerEntry[]; needsReview: boolean }
  | { ok: false; leaks: { clauseId: string; snippet: string; reason: string }[] };

type Analysis = {
  clauseId: string;
  risk: 'low' | 'medium' | 'high';
  explanation: string;
  redline: string;
  questions: string[];
};

interface AiBridge {
  onDeviceStatus(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
  onDevice(prompt: string, schema?: object): Promise<string>;                // ONLY_ON_DEVICE
  analyze(clauses: MaskedClause[]): Promise<{ results: Analysis[]; ranOn: 'cloud' | 'device' }>; // PREFER_IN_CLOUD
}
```

**Privacy engine entry points** (in `packages/privacy-engine/src/`):

```ts
mask(docId: string, clauses: Clause[], bridge: AiBridge): Promise<MaskResult>   // mask.ts
unmask(docId: string, results: Analysis[]): Promise<Analysis[]>                  // unmask.ts
classify(bridge: AiBridge, clauses: Clause[]): Promise<ClauseType[]>             // onDevice.ts
```

## Repo layout

```
packages/core/            Shared TypeScript: types and documents
packages/privacy-engine/  Masking, leak check, vault, unmasking (Privacy engine role)
packages/ui/              Shared React components
apps/web/                 Vite web app (also the build that Capacitor wraps)
apps/extension/           Chrome extension (Manifest V3 side panel)
apps/mobile/              Capacitor project: android/ and ios/ plus the native AI bridge plugin
samples/                  Public sample contracts and their expected masks
```

## Timeline

| Dates | Goal |
| --- | --- |
| Nov 14 to 16 | Setup: Firebase project, repo scaffold, confirm the on-device model runs on every test device |
| Nov 17 to 22 | Build your part against the shared contracts, using mocks for the others |
| Nov 23 to 25 | Connect everything on web first, then Android and iOS |
| Nov 26 to 28 | Polish, test on sample contracts, fix masking misses |
| Nov 29 | Record the demo and submit (hard deadline Nov 30, 2 PM PT) |

## Hardware the team needs

- **Web:** desktop Chrome where Gemini Nano runs (check `chrome://on-device-internals`).
- **Android:** a phone that supports Gemini Nano. Check Google's supported device list.
- **iOS:** a Mac with Xcode to build, and an iPhone with Apple Intelligence on iOS 26 or later.
