import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** AsyncStorage key for the user's chosen theme preference. */
export const THEME_OVERRIDE_KEY = '@roamies/theme_override';

/**
 * Call once at app startup (in _layout.tsx) to restore the user's saved
 * theme preference before the first render settles.
 *
 * Uses React Native's `Appearance.setColorScheme()` to override the
 * system colour scheme inside the app without touching phone settings.
 * Because every screen calls `useTheme()` → `useColorScheme()`, all
 * screens pick up the change automatically — zero extra refactoring needed.
 */
export async function applyPersistedTheme(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(THEME_OVERRIDE_KEY);
    if (saved === 'dark') Appearance.setColorScheme('dark');
    else if (saved === 'light') Appearance.setColorScheme('light');
    // null / anything else → follow the OS (no override)
  } catch {
    // AsyncStorage read failure is non-fatal; fall back to system theme
  }
}

/**
 * Persist and immediately apply a theme choice.
 * Calling this triggers a re-render on every screen via `useColorScheme()`.
 */
export async function setThemeOverride(value: 'dark' | 'light'): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_OVERRIDE_KEY, value);
    Appearance.setColorScheme(value);
  } catch {
    // Persist failure is non-fatal; Appearance change already applied
  }
}
