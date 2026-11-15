# Clause Guard

> Working name. Built for the **#BuildHybridAI** hackathon (Firebase AI Logic).

**Read the fine print before you sign it, and keep the contract private.**

Clause Guard is a Chrome extension and web app that reviews contracts before you sign them. It flags risky clauses, explains them in plain English, suggests edits, and lists questions to ask the other side.

The contract's sensitive details never leave your computer. Names, amounts, and dates are masked on your device with Gemini Nano. Only the masked text goes to Gemini in the cloud for legal analysis, and the real details are swapped back in on your device.

**Who it's for:** founders, freelancers, and small businesses reviewing NDAs and service agreements without a lawyer.

**Why hybrid:** the on-device model keeps the contract private. The cloud model has the reasoning power that Nano lacks.

---

## How it works

| Step | What happens | Where |
| --- | --- | --- |
| 1. Load | Upload a PDF or DOCX, or capture the contract from the current page | On device |
| 2. Split | Break the contract into clauses (plain code) | On device |
| 3. Classify | Label each clause type (payment, termination, IP, and so on) with Gemini Nano | On device |
| 4. Mask | Replace sensitive details with placeholders like `[PARTY_A]` and `[AMOUNT_1]`, using regex plus Nano | On device |
| 5. Leak check | Scan the masked text a second time and block the send if anything slipped through | On device |
| 6. Analyze | Gemini returns a risk level, explanation, suggested edit, and questions to ask for each clause | Cloud |
| 7. Unmask | Put the real details back and show a risk heatmap and clause cards | On device |

---

## Security and privacy

Security is the core of the product, not an add-on.

- **Masked before it leaves.** Names, organizations, amounts, dates, emails, and account numbers are replaced on your device before any cloud call.
- **Fail closed.** If the leak check finds anything unmasked, the request is blocked rather than sent.
- **The real values stay local.** The map from placeholders back to real values lives only in your browser (IndexedDB) and is never uploaded.
- **Locked-down cloud access.** Firebase App Check makes sure only our real app can call the cloud model, and the Gemini API key never ships in the app.
- **Privacy ledger.** The app shows exactly what was masked and what was sent, so you can check it yourself.
- **Offline mode.** With no connection, Nano alone flags red-flag clauses and nothing is sent anywhere.

## Where Firebase AI fits

Firebase AI Logic handles both halves of the hybrid setup through one SDK:

- **On-device mode** (`ONLY_ON_DEVICE`) runs Gemini Nano in Chrome for clause classification, masking, and offline red flags.
- **Cloud mode** (`ONLY_IN_CLOUD`) sends masked clauses to Gemini through the Gemini Developer API, using a JSON schema so every answer has the same shape: `{ risk, explanation, redline, questions }`.
- **App Check** protects the cloud endpoint, and **Firebase Hosting** serves the web app.

---

## Tech stack

| Area | Tools |
| --- | --- |
| Frontend | React, Vite |
| Extension | Chrome extension (Manifest V3, side panel), sharing one codebase with the web app |
| On-device AI | Gemini Nano (Chrome built-in AI) through Firebase AI Logic |
| Cloud AI | Gemini (Gemini Developer API) through Firebase AI Logic |
| Security | Firebase App Check, on-device masking and leak check |
| Documents | pdf.js (PDF), mammoth.js (DOCX) |
| Local storage | IndexedDB |
| Hosting | Firebase Hosting |

---

## Team roles (tentative)

| Role | Owns |
| --- | --- |
| **Privacy engine** | Regex and Nano masking, placeholder map, leak check |
| **Cloud AI and Firebase** | Firebase project, AI Logic setup, App Check, cloud prompt and schema, Hosting |
| **Frontend** | Web app UI: risk heatmap, clause cards, privacy ledger, on-device/cloud badge |
| **Extension** | Manifest V3 setup, side panel, capturing contracts from the page |
| **Documents, testing, and demo** | PDF/DOCX extraction, clause splitting, sample contract testing, README, demo video |

---

## Status

In development. Submission due **Nov 30, 2026 at 2 PM PT**.

## License

[MIT](LICENSE)

## Disclaimer

Clause Guard helps you understand a contract. It is not legal advice and does not replace a lawyer.
