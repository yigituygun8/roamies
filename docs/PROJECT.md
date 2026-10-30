# Roamies: Project Guide

The single shared guide for the team and for AI agents. If something here is wrong or outdated, fix it in the same PR that changes the code.

Contents: [1. What we are building](#1-what-we-are-building) | [2. Tech stack and structure](#2-tech-stack-and-structure) | [3. Conventions](#3-conventions) | [4. Data and API contract](#4-data-and-api-contract) | [5. Open questions](#5-open-questions) | [6. Decision log](#6-decision-log) | [7. Rules for AI agents](#7-rules-for-ai-agents)

## 1. What we are building

Roamies is a group trip planning app. Members of a group swipe yes or no on places (sights, food, activities) in a destination city. The system combines everyone's votes with a fairness-aware strategy, orders the chosen places into a sensible route, and an LLM explains the plan in plain language.

First version scope: one city, about 50 curated places, swipe voting, group aggregation, route ordering, AI explanation. Out of scope for now: live data feeds, payments, booking, continuous location tracking.

Course context: Semester Project (SEM1PR_INT2PT), FH Oberösterreich, Hagenberg, WS26/27. See the shared proposal document for the full proposal and evaluation plan.

## 2. Tech stack and structure

| Layer | Choice | Why |
|---|---|---|
| Mobile app | React Native (Expo) + TypeScript | Team decision, native feel, swipe gestures. Uses Development Builds (`expo-dev-client`). |
| Backend | FastAPI (Python) | Fairness algorithm and LLM calls live in Python |
| Database, auth, realtime | Supabase (PostgreSQL) | Hosted, auth and realtime included |
| LLM | Groq API or Gemini (to be decided) | Behind a small interface in `backend/app/services/llm.py` so the provider can be swapped |
| Maps | react-native-maps or MapLibre with OpenStreetMap tiles (to be decided) | Check Expo compatibility and API key requirements |
| Hosting | Local-first for now | To be decided later, check free-tier limits before choosing |

### How the parts work together

- **Supabase** handles login, the database, and realtime updates (for example showing who has finished voting).
- **FastAPI** is the "brain": fairness algorithm, route ordering, LLM call. It keeps API keys on the server.
- The **app** talks to Supabase directly for auth, reading places, writing votes, and realtime. It calls FastAPI only to generate a plan, sending the Supabase access token in the `Authorization` header.
- The fairness algorithm chooses the places. The LLM only explains the result. LLM output is always validated against known place ids.

### Repository layout

```
roamies/
├── data/
│   └── places.json              # Curated place dataset (source of truth in git)
├── scripts/
│   └── load_places.py           # Script to load data/places.json into Supabase
├── supabase/
│   └── migrations/              # Database migration SQL files
├── mobile/                      # Expo + React Native + TypeScript
│   ├── src/
│   │   ├── app/                 # Expo Router file-based screens
│   │   │   ├── _layout.tsx      # Root Stack navigation
│   │   │   ├── index.tsx        # Splash / onboarding
│   │   │   ├── login.tsx        # Login
│   │   │   ├── home.tsx         # Home dashboard
│   │   │   └── trips/
│   │   │       ├── new.tsx      # Create trip
│   │   │       └── [id]/lobby.tsx # Trip voting lobby
│   │   ├── components/          # Reusable UI components
│   │   ├── lib/
│   │   │   ├── supabase.ts      # Supabase client (AsyncStorage persistence)
│   │   │   └── api.ts           # apiFetch helper (attaches Supabase Bearer token)
│   │   └── types/
│   │       └── place.ts         # Place and PlaceCategory definitions
│   ├── .env.example
│   └── tsconfig.json            # Path alias: `@/*` maps to `./src/*`
└── backend/                     # FastAPI (Python)
    ├── app/
    │   ├── core/
    │   │   └── config.py        # Settings (pydantic-settings) & env config
    │   ├── routers/
    │   │   └── health.py        # /health endpoint
    │   ├── schemas/             # Pydantic models (CamelModel for camelCase JSON)
    │   │   ├── base.py
    │   │   └── place.py
    │   └── services/            # Pure domain logic functions
    │       ├── fairness.py      # Fairness aggregation (deterministic, no LLM)
    │       ├── routing.py       # Route ordering (distance-based)
    │       └── llm.py           # LLM plan explanation (validates place IDs)
    ├── tests/
    │   └── test_health.py       # pytest test suite
    ├── pytest.ini               # Sets pythonpath = .
    ├── requirements.txt
    └── .env.example
```

## 3. Conventions

**Naming**
- All JSON field names that cross the network are camelCase (`placeId`, `openingHours`).
- Python code and database columns use snake_case. The conversion happens at the boundary: Pydantic models use a camelCase alias (`CamelModel`), and the app converts Supabase rows once in one place.
- Place `id` is a readable slug such as `vie-albertina`.

**Git**
- Branches: `main` (stable, demo and hand-in versions), `dev` (integration, default branch), short-lived `feature/...`, `fix/...`, `docs/...` created from `dev`.
- Feature branch → PR into `dev` (squash merge). `dev` → `main` by PR every week or at each milestone (merge commit, not squash).
- One issue = one branch = one pull request, linked with `Closes #N`.
- No direct pushes to `main` or `dev`. Every change needs at least one review.

**Secrets**
- Real values live only in local `.env` files, which are never committed. `.env.example` files list the variable names with empty values.
- The Supabase **service role key** is for the backend and local scripts only. It never goes into `mobile/`.
- Row Level Security (RLS) must be enabled on every Supabase table. The anon key in the app is only safe because of RLS.

**Code**
- Backend data shapes are Pydantic classes in `backend/app/schemas/`. Logic is plain functions in `backend/app/services/`.
- Add or update tests for any logic you change (backend: pytest).

**API contract rule**
- When the contract changes, change this file first, then the code, and mention it in the PR.

## 4. Data and API contract

### Place data format (draft, team to confirm)

`data/places.json` is a JSON array. It is the source of truth in git and is loaded into the Supabase `places` table.

```json
{
  "id": "vie-albertina",
  "city": "Vienna",
  "name": "Albertina",
  "category": "museum",
  "lat": 48.2047,
  "lng": 16.3685,
  "openingHours": "Mo-Su 10:00-18:00",
  "description": "Art museum with a large collection of graphic art.",
  "imageUrl": null,
  "imageCredit": null
}
```

- `category` is one of: `museum`, `landmark`, `food`, `park`, `viewpoint`, `activity`. Do not invent new values without updating this file.
- Missing data is `null`, never an empty string.
- `openingHours` is display text only for now. Parsing it is out of scope for the first version.
- Images need a recorded source and license in `imageCredit`.
- Place data from OpenStreetMap must credit "© OpenStreetMap contributors".

### Supabase tables (draft)

`places`: `id text primary key`, `city`, `name`, `category`, `lat`, `lng`, `opening_hours`, `description`, `image_url`, `image_credit`. RLS: any signed-in user can read, nobody can write from the app.

Still to design in separate issues: `trips`, `trip_members`, `votes`, and user-added places (see open questions).

### FastAPI endpoints (draft)

`GET /health`
- Response 200: `{ "status": "ok" }`

`POST /trips/{tripId}/plan`
- Header: `Authorization: Bearer <Supabase access token>`
- Body: none for now
- Response 200:

```json
{
  "tripId": "t_123",
  "stops": [
    { "placeId": "vie-albertina", "order": 1, "reason": "Liked by 3 of 4 members" }
  ],
  "explanation": "Plain language summary of the plan."
}
```

- Errors: `401` invalid or missing token, `404` unknown trip, `409` not enough votes yet.

Add one section per new endpoint in the same format (request, response, errors).

## 5. Open questions

- **User-added places:** members may add their own activities to a trip, and these should appear in other members' swipes. Where do they live (same `places` table with a trip reference, or a separate table), and who may add?
- **LLM provider:** Groq or Gemini, and what are the free-tier limits?
- **Maps library and tile source:** which one works with Expo, and does it need an API key?
- **Place data source:** OpenStreetMap often lacks reviews, ratings, and descriptions. Where do we get them, and under which license?
- **Supabase setup:** cloud project or local, and how does the whole team share it?
- **Hosting:** where does FastAPI run for user tests? A phone needs to reach it.
- **Auth method:** email and password, or guest login with a nickname for easier user testing.

## 6. Decision log

Add a row whenever we choose a technology, change direction, or solve a notable problem. This is the raw material for the reflective report.

| Date | Decision or problem | Why |
|---|---|---|
| 2026-10-19 | Stack: React Native (Expo), Supabase, FastAPI | Team decision. Supabase covers auth, database, realtime. FastAPI hosts the algorithm and LLM calls. |
| 2026-10-20 | Expo SDK 58 + `src/` layout + `expo-dev-client` | Default Expo SDK 58 scaffolds under `src/` with `@/*` alias. Adopted development builds (`expo-dev-client`) over Expo Go due to SDK compatibility. Supabase client works with native URL support (no polyfill required). |
| 2026-10-30 | Splash intro video: baked background instead of transparency | iOS only plays transparent video as HEVC with alpha in a `.mov`, which cannot be encoded reliably on Windows. Because the splash background is a single flat colour, the animation is rendered on `#080C22` and shipped as H.264 `.mp4` with `expo-video`. The colour lives in `mobile/src/lib/theme.ts`, `app.json` and the video file, so all three must stay in sync. |
| 2026-10-30 | Splash video must be re-timed from raw frames, not composited with `overlay` | The WebM master has 1 ms-quantised timestamps. Merging it with a 30 fps background through ffmpeg `overlay` duplicated every third frame at uneven intervals, which reads as judder on device. Decoding the source frames and resampling them in code (premultiplied alpha, 60 fps) removed it. Lesson: verify video output with raw frame-by-frame diffs, not with `tblend`. |

## 7. Rules for AI agents

- Read this file before every task.
- Do only what the assigned issue describes. No unrelated refactors.
- Ask before adding a new dependency.
- Never write secrets into any file. Never touch `.env` files with real values.
- LLM output must be structured JSON and validated. Place ids must be checked against the dataset, never trust invented places.
- Keep the fairness algorithm deterministic and tested. The LLM never chooses places.
- Follow the conventions in section 3, including camelCase JSON at the network boundary.
- If the API contract has to change, update section 4 in the same change and say so in the PR description.
- Add or update tests for any logic you change.
- Explain your changes in plain language in the PR, so a human reviewer can understand them.
