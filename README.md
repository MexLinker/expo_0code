<h1 align="center">MyApp — React Native (Expo Router)</h1>

> have fun there!

> Production-ready mobile starter based on the Obytes Starter, with React Query, theming, i18n, and a configurable data tab for a Word Search server.

## Overview

MyApp is an Expo (React Native) project using Expo Router, @tanstack/react-query, NativeWind, and Zustand. It includes:

- Dynamic API base URL override persisted with MMKV
- Data tab to list and search rows from a Word Search REST server
- Theming and localization
- Auth scaffolding and examples

## Prerequisites

- `Node.js` (LTS)
- `pnpm`
- React Native dev environment (Android SDK / Xcode where applicable)
- macOS/Linux: `watchman`
- Optional: `EAS CLI` for cloud builds

## Getting Started

Clone and install dependencies:

```sh
pnpm install
```

Run development:

- Web: `pnpm web` (opens `http://localhost:8081/`)
- Android: `pnpm android`
- iOS: `pnpm ios`

## Environment Configuration

Environment variables are loaded from `.env.<APP_ENV>` via `src/lib/env.js` / `env.js`:

- `APP_ENV=development` → `.env.development`
- `APP_ENV=staging` → `.env.staging`
- `APP_ENV=production` → `.env.production`

Key variables:

- `API_URL` — default base URL used by Axios client

## Dynamic API Base URL (Data Tab)

- Navigate to the `Data` tab.
- Enter `IP / Host` and `Port` (e.g., `121.4.251.254` and `5035`).
- Click `Save & Test` to persist and validate the base URL.
- Pick a `Table` and search by lemma, or browse rows when the search box is empty.

Implementation details:

- Storage: `react-native-mmkv` via `src/lib/storage.tsx`
- Axios client: `src/api/common/client.tsx`
- Base URL management: `src/api/common/base-url.tsx`
- Word Search hooks: `src/api/wordsearch/*`

## Scripts

- `pnpm web` — Run web preview
- `pnpm android` — Run Android app
- `pnpm ios` — Run iOS app
- `pnpm test` — Run unit tests
- `pnpm check-all` — Lint, type-check, translations lint, tests

## Building

### EAS Cloud Build (Recommended)

```sh
npm i -g eas-cli
eas login
pnpm build:production:android   # build a production AAB (store-ready)
pnpm build:staging:android      # build a staging APK (internal testing)
```

EAS will manage signing (when configured) and provide a download URL.

### Local Gradle Build

```sh
APP_ENV=production ./android/gradlew assembleRelease -p ./android   # APK
APP_ENV=production ./android/gradlew bundleRelease -p ./android     # AAB
```

Artifacts:

- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

Install APK on a device/emulator:

```sh
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Project Structure

- `src/app` — Expo Router entry points and screens
- `src/api` — Axios client, React Query provider, and endpoint hooks
- `src/components` — UI components
- `src/lib` — environment loader, storage, state, and utilities
- `android`, `ios` — native projects

## Testing & Quality

- Tests: `pnpm test`, `pnpm test:watch`
- Lint: `pnpm lint`
- Type-check: `pnpm type-check`
- All: `pnpm check-all`

## Git Setup (Optional)

Initialize and push:

```sh
git init
git add -A
git commit -m "Initial import"
git branch -M main
git remote add origin <your_repo_url>
git push -u origin main
```

## Credits

Based on the [Obytes Starter](https://starter.obytes.com).

---

Happy building! If you run into issues, check `package.json` scripts, `env.js`, and the Android/iOS build logs.
