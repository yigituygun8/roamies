# QR Bottom Sheet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the QR card's `Modal`-based sheet on the profile tab with the native `BottomSheet` from `@expo/ui`, so it has a drag handle, swipe-to-dismiss, and correct platform scrim/inset behaviour.

**Architecture:** One screen changes. The sheet's JSX moves from `<Modal transparent animationType="slide">` + hand-rolled backdrop into `<BottomSheet isPresented onDismiss containerColor contentPadding>`, whose children are wrapped in a single `<RNHostView matchContents={{ vertical: true }}>` because the sheet is a native SwiftUI/Compose view. Content, copy, and theme tokens stay identical.

**Tech Stack:** React Native 0.88, Expo SDK 58, `@expo/ui` 58.0.21 (universal components), TypeScript.

**Spec:** `docs/superpowers/specs/2026-11-21-qr-bottomsheet-design.md`

## Global Constraints

- No new dependency. `@expo/ui` is already in `mobile/package.json` at `~58.0.21`.
- Do not touch the sign-out confirmation `Modal`; it stays a centred alert.
- Do not change copy, `qrValue`, share behaviour, or theme tokens.
- No `snapPoints` — the sheet auto-sizes to its content.
- Remove the bottom "Dismiss" button and its divider.
- Keep `useSafeAreaInsets`; only the sheet's use of `insets.bottom` goes away.
- Follow `docs/PROJECT.md`: one issue = one branch = one PR, no unrelated refactors.

## Review Focus

- **Small screens (iPhone SE / compact Android):** content must not clip. The old sheet forced `minHeight: 600`; the new one sizes to content, so a short viewport is the first thing to check.
- **Android hardware back / back gesture:** must dismiss the sheet, not navigate away from the profile tab.
- **`react-native-qrcode-svg` inside `RNHostView`:** the QR must render at 200×200 and stay scannable; a collapsed or stretched host is the most likely native-interop failure.
- **Dark mode:** `containerColor` paints the sheet chrome, but RN children keep their own colours; check text contrast in both schemes.
- **Repeated open/close:** opening the sheet a second time must not leave a stale scrim or an invisible blocking layer.

---

### Task 1: Swap the QR sheet to `@expo/ui` `BottomSheet`

**Files:**
- Modify: `mobile/src/app/(tabs)/profile.tsx` (imports near line 11-24, sheet block at lines 315-390, styles at lines 652-722)

**Interfaces:**
- Consumes: `qrVisible: boolean`, `closeQr: () => void`, `handleShareProfile: () => void`, `qrValue: string`, `user`, `theme` — all already defined in `ProfileScreen` and unchanged.
- Produces: no new exports. `ProfileScreen` keeps its current default export and props.

- [ ] **Step 1: Add the `@expo/ui` import**

After the `react-native-qrcode-svg` import (line 19), add:

```tsx
import { BottomSheet, RNHostView } from '@expo/ui';
```

Keep the `Modal` import — the sign-out dialog still uses it.

- [ ] **Step 2: Replace the QR `Modal` block**

Replace the whole block from the `QR Bottom Sheet` comment through its closing `</Modal>` (lines 315-390) with:

```tsx
      {/* ══════════════════════════════════════════════════════════════════════
          QR Bottom Sheet
      ══════════════════════════════════════════════════════════════════════ */}
      <BottomSheet
        isPresented={qrVisible}
        onDismiss={closeQr}
        containerColor={theme.surfaceLight}
        contentPadding={{ top: 12, bottom: 16, left: 24, right: 24 }}
      >
        {/* Native sheet, RN content: RNHostView measures the RN subtree and
            reports its height to SwiftUI/Compose. It lays out only its first
            child, so everything lives in one View. */}
        <RNHostView matchContents={{ vertical: true }}>
          <View style={styles.qrSheetContent}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>Your Roamie QR</Text>
            <Text style={[styles.sheetSubtitle, { color: theme.textMuted }]}>
              A Roamie in your group scans this to invite you to their trip. You can also share your profile link.
            </Text>

            {/* QR code */}
            <View
              style={[
                styles.qrContainer,
                { backgroundColor: '#FFFFFF', borderColor: theme.borderSubtle },
              ]}
            >
              <QRCode
                value={qrValue}
                size={200}
                color="#161B29"
                backgroundColor="#FFFFFF"
                quietZone={12}
              />
            </View>

            {/* User info below QR */}
            <Text style={[styles.sheetUserName, { color: theme.text }]}>{user.name}</Text>
            <Text style={[styles.sheetUserHandle, { color: theme.accent }]}>{user.username}</Text>

            {/* Action button */}
            <Pressable
              style={[styles.shareButton, { backgroundColor: theme.accent }]}
              onPress={handleShareProfile}
              accessibilityLabel="Share your Roamies profile"
              accessibilityRole="button"
            >
              <Ionicons name="share-outline" size={18} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>Share Profile</Text>
            </Pressable>
          </View>
        </RNHostView>
      </BottomSheet>
```

Differences from the old block, all intentional: no backdrop `Pressable`, no "Dismiss" button, no `insets.bottom` padding, no `minHeight`. The drag handle, backdrop tap, and Android back press dismiss the sheet.

- [ ] **Step 3: Update the sheet styles**

In `StyleSheet.create`, replace the `qrBackdrop` and `qrSheet` entries with:

```tsx
  qrSheetContent: {
    alignItems: 'center',
  },
```

Delete the `dismissDivider`, `dismissButton`, and `dismissText` entries. Leave `sheetTitle`, `sheetSubtitle`, `qrContainer`, `sheetUserName`, `sheetUserHandle`, `shareButton`, `shareButtonText` untouched.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit` (from `mobile/`)
Expected: no output, exit code 0. In particular no "Cannot find module '@expo/ui'" and no unused-style errors.

- [ ] **Step 5: Lint**

Run: `npm run lint` (from `mobile/`)
Expected: no new warnings or errors. `insets` must still be used (screen top padding) or the lint run will flag it.

- [ ] **Step 6: Commit**

```bash
git add mobile/src/app/\(tabs\)/profile.tsx docs/superpowers/specs/2026-11-21-qr-bottomsheet-design.md docs/superpowers/plans/2026-11-21-qr-bottomsheet.md
git commit -m "feat(profile): show QR card in a native bottom sheet"
```

---

### Task 2: On-device verification (human-run, no code expected)

**Files:** none, unless a check fails — then a follow-up fix in `mobile/src/app/(tabs)/profile.tsx`.

**Interfaces:**
- Consumes: the sheet built in Task 1.
- Produces: a verified sheet, or a documented fallback change.

There is no automated UI test suite in `mobile/` (per `docs/PROJECT.md`, tests live in the backend), so these checks are manual. The implementer cannot run them; hand this task to the human partner with the app open on a device.

- [ ] **Step 1: Rebuild the dev client if needed**

If the installed dev client predates `@expo/ui`, run `npx expo run:ios` / `npx expo run:android` once. Symptom of a stale build: the sheet never appears, or `@expo/ui` throws "native module not found".

- [ ] **Step 2: Check the sheet on iOS**

Open Profile → tap "Your Roamie QR". Expect: sheet slides up with a drag handle, QR fully visible and square, name/handle/Share button all readable, no clipped edges. Swipe down → closes. Reopen → tap the dark backdrop → closes.

- [ ] **Step 3: Check the sheet on Android**

Same open/dismiss checks, plus: hardware back / back gesture closes the sheet and stays on the Profile tab. Confirm the QR is not stretched or zero-height.

- [ ] **Step 4: Check dark mode**

Toggle Dark Mode on the profile tab, reopen the sheet. Expect the sheet chrome to use `theme.surfaceLight` and all text to stay readable. Note: `react-native-qrcode-svg` keeps its white background by design (scannability), which is expected.

- [ ] **Step 5: Check a small screen**

If an iPhone SE-class device or simulator is available, confirm nothing is clipped at the bottom. If it is, add `snapPoints={[{ fraction: 0.85 }]}` to `<BottomSheet>` on iOS only (Android already passes `['full']`; `{fraction}` and `{height}` are iOS/web-only and would re-enable Android's partial expansion) and repeat Steps 2-4.

- [ ] **Step 6: Commit only if Step 5 changed code**

```bash
git add mobile/src/app/\(tabs\)/profile.tsx
git commit -m "fix(profile): size QR bottom sheet for small screens"
```
