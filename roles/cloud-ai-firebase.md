# Cloud AI and Firebase

**Owner:** TBD

## What you build

The Firebase backbone for all three platforms, and the cloud analysis that gives Clause Guard its legal reasoning.

1. **Firebase project:** register the web, Android, and iOS apps, and enable AI Logic with the Gemini Developer API.
2. **App Check** on every platform, which the hackathon requires. Use debug tokens during development.
3. **Cloud analysis:** the prompt and JSON schema that turn a masked clause into `{ risk, explanation, redline, questions }`.
4. **Web AI bridge:** the web version of `AiBridge`, using the `firebase/ai` SDK. The Mobile teammate writes the Android and iOS versions, using your prompt and schema.
5. **Hosting and Remote Config:** deploy the web app, and keep prompts and model names in Remote Config.

## Tech stack

| Part | Tool |
| --- | --- |
| AI | Firebase AI Logic (`firebase/ai` on web), Gemini Developer API |
| Hybrid modes | `ONLY_ON_DEVICE` for raw text, `PREFER_IN_CLOUD` for masked analysis |
| Security | App Check: reCAPTCHA Enterprise (web), Play Integrity (Android), App Attest (iOS), debug providers for development |
| Config | Firebase Remote Config (prompts, model names, feature flags) |
| Hosting | Firebase Hosting |
| Language | TypeScript |

## Architecture

```
MaskedClause[] (CleanText only)
        │
        ▼
AiBridge.analyze()  ── web: firebase/ai  │  Android/iOS: native plugin (Mobile teammate)
        │
        ├─ mode PREFER_IN_CLOUD
        │     online  → Gemini (cloud), with the full prompt and JSON schema
        │     offline → on-device model, with a shorter red-flags-only prompt
        │
        ├─ App Check token attached to every call
        ▼
validate the JSON ──► reject unknown placeholders ──► Analysis[] + ranOn: 'cloud' | 'device'
```

**Response schema (one per clause):**

```json
{
  "clauseId": "string",
  "risk": "low | medium | high",
  "explanation": "string",
  "redline": "string",
  "questions": ["string"]
}
```

## What teammates get from you

- `firebase.ts`: one shared Firebase setup used by the web app and the extension
- The web `AiBridge` (`onDeviceStatus`, `onDevice`, `analyze`)
- The prompts and schema in Remote Config, so the Android and iOS bridges use the same ones
- `ranOn`, so the UI can show the on-device or cloud badge

## Milestones

- **Nov 16:** Firebase project with all three apps registered, App Check debug tokens working, a first cloud call from the web
- **Nov 20:** analysis prompt and schema tuned on masked sample clauses
- **Nov 22:** web `AiBridge` done, prompts moved to Remote Config
- **Nov 27:** web app deployed on Firebase Hosting

## Traps

- `analyze()` must only accept `CleanText`, so raw text can't be sent by mistake.
- The cloud model may make up placeholders like `[PARTY_C]`. Flag them, and never unmask them.
- App Check in a Chrome extension is harder than on a normal web page. Plan for the debug provider there, which the hackathon accepts.
- Check that `PREFER_IN_CLOUD` really falls back to the device when offline, on each platform, before the demo depends on it.
- The rules require Firebase AI Logic to be imported *and called* in the code, not just named in the README.
