# Roamies

A group trip planning app. Friends swipe yes or no on places in a city, and the app builds a fair itinerary from everyone's votes. Built for the Semester Project (SEM1PR_INT2PT) at FH Oberösterreich, Hagenberg, WS26/27.

## Repository layout

| Folder | What it is |
|---|---|
| `mobile/` | React Native (Expo) app, TypeScript |
| `backend/` | FastAPI backend: fairness algorithm, route ordering, LLM explanation |
| `supabase/` | Database migrations |
| `data/` | Curated place dataset (`places.json`) |
| `scripts/` | Helper scripts, for example loading places into the database |
| `docs/PROJECT.md` | Conventions, API contract, decisions. Read this first. |

## Getting started

Copy each `.env.example` to `.env` in its folder and fill in the values (ask the team for the project keys, never commit them).

### Mobile app

```bash
cd mobile
npm install
```

This project uses **development builds** instead of Expo Go (Expo Go no longer keeps up with current SDKs). A dev build is your own debug app with hot reload and QR code scanning — same workflow, but compiled with your project's dependencies.

**First time — build and install on your device:**

```bash
# Android (physical device or emulator, works on Windows/Mac/Linux)
npx expo run:android

# iOS (simulator or physical device, Mac only)
npx expo run:ios
```

This compiles the native app and installs it on your device. You only need to rebuild when native dependencies change (rare).

**Day-to-day — start the JS bundler:**

```bash
npx expo start
```

Scan the QR code with your phone's camera. It opens in your installed dev build (not Expo Go).

**No Mac for iOS?** Use EAS Build to compile in the cloud and install via TestFlight:

```bash
npx eas build --profile development --platform ios
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
fastapi dev app/main.py        # start the dev server on port 8000
pytest                         # run the tests
```

> **Tip:** A physical phone cannot reach `localhost`. Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to your computer's LAN IP, for example `http://192.168.1.20:8000`.

## Working together

One issue, one branch, one pull request, no direct pushes to `main`. See `docs/PROJECT.md` for the full conventions.
