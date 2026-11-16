# Mobile (Android and iOS)

**Owner:** TBD (whoever has a Mac should own iOS, so this role can split in two)

## What you build

The Android and iOS apps. They wrap the shared React UI, and each needs a small native bridge, because a mobile WebView can't reach the phone's on-device model.

1. **Capacitor apps** for Android and iOS that load the shared web build.
2. **A native AI bridge plugin**, written once in Kotlin and once in Swift, that implements `AiBridge` with the Firebase AI Logic native SDKs:
   - **Android:** Gemini Nano 4 on device, Gemini in the cloud
   - **iOS:** Apple Foundation Models on device, Gemini in the cloud
3. **Native App Check:** Play Integrity on Android and App Attest on iOS, with debug providers for development.
4. **Getting contracts in:** a document picker, plus "Share to Clause Guard" and "Open with" from email and Files.
5. **Testing on real phones** on both platforms.

## Tech stack

| Part | Tool |
| --- | --- |
| Shell | Capacitor (in `apps/mobile/`) |
| Android | Kotlin, Firebase AI Logic Android SDK with its on-device add-on (Gemini Nano 4 through ML Kit) |
| iOS | Swift, Firebase AI Logic iOS SDK with Apple Foundation Models |
| Security | App Check (Play Integrity, App Attest) |
| Tools | Android Studio, Xcode (Mac required) |

## Architecture

```
shared React UI + packages/core + privacy-engine  (inside the Capacitor WebView)
            │
            │  AiBridge calls go through a Capacitor plugin: "ClauseGuardAI"
            ▼
   ┌────────────────────┬─────────────────────────┐
   │ Android (Kotlin)   │ iOS (Swift)             │
   │ Firebase AI Logic  │ Firebase AI Logic       │
   │  onDevice → Nano 4 │  onDevice → Apple FM    │
   │  analyze → Gemini  │  analyze → Gemini       │
   │ App Check: Play    │ App Check: App Attest   │
   │  Integrity         │                         │
   └────────────────────┴─────────────────────────┘
```

**Plugin methods** (they match `AiBridge`, so the shared code doesn't care which platform it's on):
- `onDeviceStatus()`
- `onDevice({ prompt, schema })`, in `ONLY_ON_DEVICE` mode
- `analyze({ clauses })`, in `PREFER_IN_CLOUD` mode, returning `ranOn`

Use the prompts and schema from Remote Config, so they match the web exactly.

## What teammates get from you

- Working Android and iOS builds of the full app
- The plugin, so the privacy engine and cloud analysis run on phones
- Phone footage for the demo video

## Milestones

- **Nov 16:** confirm on-device models run on your test phones, and the Capacitor shell opens the web build on both
- **Nov 20:** the plugin's `onDevice` call works on Android and iOS
- **Nov 23:** `analyze` and App Check work on both
- **Nov 26:** file import and sharing, and the full flow working on both phones

## Traps

- **Confirm the hardware on day one.** Android needs a phone that supports Gemini Nano. iOS needs a Mac, Xcode, and an iPhone with Apple Intelligence on iOS 26 or later.
- The model downloads in the background on first launch. The first-run screen must handle "downloading."
- Apple Foundation Models has a small context window. Send one clause per call.
- Raw text crosses into native code only for `onDevice`. `analyze` must only receive `CleanText`.
- Getting a test build onto an iPhone needs an Apple developer account. Sort it out early.
