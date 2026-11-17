# Clause Guard

> Working name. Built for the **#BuildHybridAI 2026** hackathon (Firebase AI Logic).

**Read the fine print before you sign it, and keep the contract private.**

Clause Guard reviews contracts before you sign them, on the web, in Chrome, and on Android and iOS. It flags risky clauses, explains them in plain English, suggests edits, and lists questions to ask the other side.

The contract's sensitive details never leave your device. Names, amounts, and dates are masked by the AI model built into your browser or phone. Only the masked text goes to Gemini in the cloud for legal analysis, and the real details are swapped back in on your device.

**Who it's for:** founders, freelancers, and small businesses reviewing NDAs and service agreements without a lawyer.

**Why hybrid:** the on-device model keeps the contract private. The cloud model has the reasoning power the on-device model lacks.

---

## Platforms

| Platform | App | On-device model | Cloud model |
| --- | --- | --- | --- |
| **Web** (Chrome desktop) | Web app and Chrome extension (side panel) | Gemini Nano 4 | Gemini |
| **Android** | Mobile app | Gemini Nano 4 | Gemini |
| **iOS** | Mobile app | Apple Foundation Models | Gemini |

All three run their AI through **Firebase AI Logic**. They share one React interface and one privacy engine. Only a thin AI bridge is written separately for each platform.

**No on-device model?** (an older phone, or a browser without one) Clause Guard still masks with pattern matching. It then shows you the masked text to approve before anything is sent, and it never sends the raw contract.

---

## How it works

| Step | What happens | Where |
| --- | --- | --- |
| 1. Load | Upload a PDF or DOCX, capture the contract from a web page (extension), or share a file into the app (mobile) | On device |
| 2. Split | Break the contract into clauses (plain code) | On device |
| 3. Classify | Label each clause type (payment, termination, IP, and so on) | On device |
| 4. Mask | Replace sensitive details with placeholders like `[PARTY_A]` and `[AMOUNT_1]`, using pattern matching plus the on-device model | On device |
| 5. Leak check | Scan the masked text a second time and block the send if anything slipped through | On device |
| 6. Analyze | Gemini returns a risk level, explanation, suggested edit, and questions to ask for each clause | Cloud (on device when offline) |
| 7. Unmask | Put the real details back and show a risk heatmap and clause cards | On device |

---

## Security and privacy

Security is the core of the product, not an add-on.

- **Masked before it leaves.** Names, organizations, amounts, dates, emails, and account numbers are replaced on your device before any cloud call.
- **The raw contract can't reach the cloud by accident.** Raw text only goes to on-device-only calls (`ONLY_ON_DEVICE`). It never uses a mode that can quietly fall back to the cloud.
- **Fail closed.** If the leak check finds anything unmasked, the request is blocked rather than sent.
- **The real values stay local.** The map from placeholders back to real values is encrypted and stored only on your device. It is never uploaded.
- **Locked-down cloud access.** Firebase App Check makes sure only our real apps can call the cloud model. It uses reCAPTCHA Enterprise on web, Play Integrity on Android, and App Attest on iOS. The Gemini API key never ships in the app.
- **Privacy ledger.** The app shows exactly what was masked and what was sent, so you can check it yourself.
- **Offline mode.** With no connection, the on-device model flags red-flag clauses and nothing is sent anywhere.

## Where Firebase AI fits

Firebase AI Logic's hybrid inference runs every AI call, with a mode chosen for each job:

| Job | Mode | Why |
| --- | --- | --- |
| Find names and organizations, classify clauses | `ONLY_ON_DEVICE` | It sees the raw contract, so it must never go to the cloud |
| Risk analysis | `PREFER_IN_CLOUD` | The text is already masked. Online it gets Gemini's reasoning, and offline it falls back to the on-device model |

The cloud answer follows a JSON schema, so every clause comes back in the same shape: `{ risk, explanation, redline, questions }`. **App Check** protects every call, and **Firebase Hosting** serves the web app. **Remote Config** (planned) holds the prompts and model names, so they can be tuned without shipping a new app.

---

## Tech stack

| Area | Tools |
| --- | --- |
| Language | TypeScript (shared code), Kotlin (Android bridge), Swift (iOS bridge) |
| Interface | React and Vite, one UI for the web app, the extension side panel, and both mobile apps |
| Extension | Chrome extension (Manifest V3, side panel) |
| Mobile | Capacitor, which wraps the shared React app as an Android app and an iOS app |
| AI | Firebase AI Logic SDKs for Web, Android, and iOS (hybrid inference) |
| On-device models | Gemini Nano 4 (Chrome and Android), Apple Foundation Models (iOS) |
| Cloud model | Gemini (Gemini Developer API) |
| Security | Firebase App Check, on-device masking and leak check, Web Crypto encryption |
| Documents | pdf.js (PDF), mammoth.js (DOCX) |
| Local storage | IndexedDB |
| Hosting and config | Firebase Hosting, Firebase Remote Config |

---

## Team roles (tentative)

Each role has a one-page overview in [`roles/`](roles/). Read them and pick one.

| Role | Name | Owns |
| --- | --- | --- |
| [**Privacy engine**](roles/privacy-engine.md) | Likhil Gudipati | Pattern and on-device masking, placeholder map, leak check, unmasking |
| [**Cloud AI and Firebase**](roles/cloud-ai-firebase.md) | Dhruv Vyas | Firebase project, AI Logic and App Check on all platforms, cloud prompt and schema, Hosting |
| [**Web app and extension**](roles/web-and-extension.md) | Sai Nagadheeraj Kamsani | Shared React UI, Chrome extension, first-run and offline screens |
| [**Mobile (Android and iOS)**](roles/mobile.md) | Aarush Goel | Capacitor apps, native AI bridges in Kotlin and Swift, testing on real phones |
| [**Documents, testing, and demo**](roles/documents-testing-demo.md) | TBD | PDF/DOCX extraction, clause splitting, sample contracts, demo video, submission |

---

## Status

In development. Submission due **Nov 30, 2026 at 2 PM PT**.

## License

[MIT](LICENSE)

## Disclaimer

Clause Guard helps you understand a contract. It is not legal advice and does not replace a lawyer.
