# Trip date picker: move from the community picker to `@expo/ui`

Date: 2026-11-22
Status: approved

## Intent

The start/end date fields in the new-trip wizard (`DatesStep` + `DateFieldRow`) used
`@react-native-community/datetimepicker`. On iOS the picker was rendered inline under the
row with `display="compact"`, which produced a second small date field the user had to tap
again, plus a layout jump. Android opened a dialog straight away, so the two platforms
behaved differently and neither matched the app's brand surfaces.

## Goals

- One predictable interaction per platform, both themed with the Roamies palette.
- No new dependencies; the picker surface stays native so we keep system date handling,
  accessibility and locale for free.
- Keep the existing row/card design (icon badge, labels, disabled state) unchanged.

## Non-goals

- A fully custom calendar grid shared by both platforms.
- A combined date-range row. Two rows stay: one field changed at a time, and the field
  being edited is unambiguous.
- Restricting selectable dates so that `start <= end` is enforced by greyed-out days.

## Approaches considered

1. Keep `@react-native-community/datetimepicker` and only fix the iOS display style.
   Cheapest, but leaves Android on an unthemed dialog and an extra native module in the app.
2. Switch to `@expo/ui/community/datetime-picker` (chosen). Same API (`value`,
   `onValueChange`, `minimumDate`, `maximumDate`), already installed and linked because the
   profile QR sheet uses `@expo/ui`. iOS gets a SwiftUI graphical calendar with
   `accentColor` + `themeVariant`; Android gets a Material 3 dialog.
3. Write our own calendar component. Full design control and identical on both platforms,
   but 300-500 lines plus locale, min/max and screen-reader work, and it loses the native
   feel. Rejected.

## Design

- `DateFieldRow` keeps its trigger card exactly as it is and only changes how the picker is
  presented.
  - iOS: a plain RN `Modal` with the app's own dark/light card (surface, hairline border,
    24 px radius), a header with the field label and a close button, the native graphical
    calendar inside, and a "Done" button. The calendar writes to local draft state; "Done"
    commits and closes, backing out keeps the previous value. `accentColor` is
    `theme.accent` and `themeVariant` follows the active colour scheme.
  - Android: `presentation="dialog"`, so the Material 3 dialog opens on mount. Selecting a
    date commits and closes; dismissing closes without a change. Button labels are
    "Set date" / "Cancel".
- `DatesStep` stops passing `minimumDate` / `maximumDate` and instead auto-corrects:
  picking a start date after the current end moves the end to that day, and picking an end
  date before the current start moves the start. There is no error copy and no reachable
  invalid state.
- `@react-native-community/datetimepicker` is removed from `mobile/package.json`.

## Constraints

- Two rows stay; the "No dates decided yet" switch and all card styles are untouched.
- No new dependency may be added.
- Web is unaffected: the `@expo/ui` picker renders `null` there, as the community picker did.
