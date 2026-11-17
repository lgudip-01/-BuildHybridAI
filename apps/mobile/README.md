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
(both are git-ignored). Native methods are skeletons: every `TODO` is still to be implemented.
