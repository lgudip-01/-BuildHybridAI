# Mobile (Android and iOS)

Capacitor shell around the shared web build (`apps/web`), plus the native `ClauseGuardAI` plugin
(`plugins/clause-guard-ai`) that implements `AiBridge` on each platform. The web app picks
`NativeBridge` when `Capacitor.isNativePlatform()` is true (`apps/web/src/main.tsx`).

## First run

```bash
npm install                       # from the repo root
npm run add:android -w @clause-guard/mobile
npm run add:ios -w @clause-guard/mobile     # needs Xcode
npm run sync -w @clause-guard/mobile        # builds apps/web, copies it into both apps
npm run open:ios -w @clause-guard/mobile
```

Put `google-services.json` in `android/app/` and `GoogleService-Info.plist` in `ios/App/App/`
(both are git-ignored). The #35 branch implements analysis/on-device helpers. Native chat is now a guarded candidate with independent release blocking; see [native chat handoff](plugins/clause-guard-ai/NATIVE_CHAT_HANDOFF.md) for tested scope and still-open full platform builds/device checks.
