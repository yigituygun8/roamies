# Profile Tab — What Changed & Why

> This is a living note for the team. Update it when you extend these features.

---

## What we built

We redesigned the profile screen from a draft into something functional. Here's the before/after at a glance:

| Before | After |
|--------|-------|
| "Accessibility Settings" button (stub) | ❌ Removed |
| "Notifications" button (stub) | ✅ Real toggle switch |
| No dark mode control | ✅ Real toggle switch |
| QR row opened a text popup | ✅ Full bottom sheet with real scannable QR |
| Theme always followed system | ✅ User can override in-app |

---

## Dark Mode toggle

**How it works:**
React Native has a built-in `Appearance` API that lets you say *"pretend this app is in dark mode"* without touching the phone's system settings. We use that.

```
User flips toggle
  → Appearance.setColorScheme('dark')   ← tells React Native to use dark theme
  → AsyncStorage.setItem(...)           ← saves the choice
  → every useColorScheme() call fires   ← all screens re-render with dark tokens
```

On next app launch, `_layout.tsx` reads the saved preference and applies it again before anything renders.

**Files touched:**
- `src/lib/theme-override.ts` — NEW: `applyPersistedTheme()` and `setThemeOverride()`
- `src/app/_layout.tsx` — calls `applyPersistedTheme()` on startup
- `src/app/(tabs)/profile.tsx` — the toggle switch UI

No other screen needed changes. They already use `useTheme()` which reads `useColorScheme()`.

---

## Notifications toggle

**How it works (now):**
The toggle is UI-only. It saves `true` or `false` to AsyncStorage and shows the right state when you re-open the app. No actual OS permission is requested yet.

**How push notifications work (for context):**
1. The app asks the OS for permission → OS gives back a **device token** (a unique string for this phone + app)
2. The token gets stored in the backend (Supabase table: `push_tokens` or similar)
3. When something happens (trip invite, vote reminder), the backend sends a push to that token via Apple/Google's servers

This is a future issue. When you're ready, you'll add `expo-notifications`, request permission on first toggle, store the token in Supabase, and wire up backend events.

**Files touched:**
- `src/app/(tabs)/profile.tsx` — the toggle switch UI + AsyncStorage persistence

---

## Your Roamie QR

**What the QR encodes:**
```
roamies://user/<user_id>
```
Right now it uses a placeholder ID (`demo-placeholder-id`). When auth is wired to this screen, replace `PLACEHOLDER_USER_ID` in `profile.tsx` with the result of `supabase.auth.getUser()`.

The `user_id` is the Supabase `auth.users.id` UUID — the same value already used in `trip_members.user_id` and `votes.user_id`.

**How the invite flow will work (future — trip detail screen):**
```
Julia opens Profile → shows QR
Trip creator on trips/[id]/lobby → taps "Scan to invite"
Camera opens → scans Julia's QR → reads roamies://user/julia-uuid
App knows trip_id from the URL param → inserts trip_members(trip_id, user_id=julia-uuid)
```

The scanning camera goes on the trip lobby screen, **not** on a general "scan" screen. This way the trip context is always clear and you never need a "pick which trip to invite Julia to" list.

**New packages added:**
- `react-native-svg` — SVG renderer (peer dependency of the QR lib)
- `react-native-qrcode-svg` — renders a real scannable QR from any string

Both require a Dev Build rebuild to work on device.

**Files touched:**
- `src/app/(tabs)/profile.tsx` — QR bottom sheet, `Share.share()` button

---

## File map

```
mobile/src/
├── lib/
│   ├── theme.ts              (unchanged) lightMode/darkMode tokens
│   └── theme-override.ts     (NEW) applyPersistedTheme, setThemeOverride
└── app/
    ├── _layout.tsx           (patched) calls applyPersistedTheme on startup
    └── (tabs)/
        └── profile.tsx       (rewritten) toggles + QR sheet
```

---

## What's next (not in this branch)

| Feature | Where it goes |
|---------|--------------|
| Scan to invite (camera on trip lobby) | `feature/new-trip` or `feature/trip-detail` |
| Real `user_id` from Supabase auth | When auth is wired to profile screen |
| Account Details / Edit Profile screen | New screen `profile/edit.tsx` |
| Push notifications (real) | New issue: `expo-notifications` + backend |
| Trip share QR (Link / Code / QR on new trip) | `feature/new-trip` |
