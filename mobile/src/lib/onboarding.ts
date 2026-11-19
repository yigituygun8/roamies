import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'hasSeenOnboarding';

/**
 * Returns true if the user has already completed or skipped onboarding.
 * On read error, returns true so the user is never trapped in a loop.
 */
export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === 'true';
  } catch {
    // If we cannot read, do not trap the user in onboarding.
    return true;
  }
}

/**
 * Persists the flag so onboarding is not shown again.
 * Write errors are silently ignored — not critical.
 */
export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, 'true');
  } catch {
    // Not critical, ignore.
  }
}
