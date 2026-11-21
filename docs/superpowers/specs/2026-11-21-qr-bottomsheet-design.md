# QR sheet: `Modal` → `@expo/ui` `BottomSheet`

Date: 2026-11-21
Status: approved
Scope: small change, one file

## Intent

The "Your Roamie QR" card on the profile tab opens a bottom sheet built from React
Native's `Modal` with `animationType="slide"`. It looks like a sheet but behaves like
a full-screen overlay: no swipe-to-dismiss, no drag handle, and on Android the whole
screen (backdrop included) slides, which breaks the sheet illusion. The QR card is
something people hold up for a friend to scan, so it should feel like a native sheet.

We replace it with the universal `BottomSheet` from `@expo/ui`, which maps to a SwiftUI
sheet on iOS and a Material 3 `ModalBottomSheet` on Android.

## Goals

- Native sheet behaviour: drag handle, swipe down to dismiss, tap backdrop to dismiss.
- Correct scrim and home-indicator inset handling on both platforms.
- Keep the current content, copy, and theme tokens unchanged.
- No new dependency, no API contract change.

## Non-goals

- The sign-out confirmation stays a centred `Modal`. It is an alert, not a sheet.
- No redesign of the QR card or of the sheet's contents.
- No new route / deep link for the QR (a `presentation: 'formSheet'` route was
  considered and rejected: extra routing and params for no gain here).

## Approaches considered

1. **Keep `Modal`.** Zero work, but keeps every defect above.
2. **`@expo/ui` universal `BottomSheet` + `RNHostView`** (chosen). Native on both
   platforms, package already installed at `~58.0.21`, API (`isPresented` /
   `onDismiss`) matches the existing `qrVisible` state one-to-one.
3. **`expo-router` route with `presentation: 'formSheet'`.** Keeps RN content (no
   `RNHostView` boundary) and gives deep links, but needs a new route, param passing,
   and typed-route changes for a single sheet. Rejected as overkill.

## Decision

Use approach 2 in `mobile/src/app/(tabs)/profile.tsx` only.

- `BottomSheet` gets `isPresented={qrVisible}`, `onDismiss={closeQr}`,
  `containerColor={theme.surfaceLight}`, `contentPadding={{ top: 12, bottom: 16 }}`.
- No `snapPoints` on iOS: the sheet auto-sizes to its content. Android's Material 3
  sheet has no content-sized mode, and without a snap point it opens half-height with
  the Share button below the fold, so Android passes `snapPoints={['full']}` (the only
  value that skips partial expansion) and the content block is centred vertically.
- All sheet content is wrapped in a single `<View>` which is wrapped in
  `<RNHostView matchContents>` — `RNHostView` lays out only its first child.
- The bottom "Dismiss" button and its divider are removed; the drag handle, backdrop
  tap, and Android back press cover dismissal. "Share Profile" stays.

## Constraints

- `RNHostView` is a hard boundary: everything inside it is plain React Native again, so
  the existing styles and `useTheme()` tokens keep working.
- `@expo/ui` is native. The dev client must have been built after `@expo/ui` was added,
  otherwise a rebuild is needed.
- `react-native-qrcode-svg` renders inside `RNHostView`; its measurement must be
  verified on a real device, not assumed.
- The sheet no longer needs `insets.bottom`; `useSafeAreaInsets` stays for the
  screen's top padding only.

## Verification

- `npx tsc --noEmit` and `npm run lint` clean.
- iOS + Android: sheet opens, QR fully visible, Share opens the share sheet, swipe
  down / backdrop tap / Android back all dismiss it, dark mode colours correct.
- Small screen (e.g. iPhone SE size): content not clipped.
