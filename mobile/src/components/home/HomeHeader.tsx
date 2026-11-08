import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { onPhoto, useTheme } from '@/lib/theme';
import type { CurrentUser } from '@/types/trip';

type Props = {
  user: CurrentUser;
  /** Injectable for tests and so the header does not tick mid-render. */
  now?: Date;
};

/**
 * Date, greeting and the shortcut to the profile tab.
 *
 * The name is mock data for now (there is no profile table yet); the shape is
 * the same `CurrentUser` the account screen will provide later.
 */
export function HomeHeader({ user, now = new Date() }: Props) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={[styles.date, { color: theme.textMuted }]}>{formatDate(now)}</Text>
        <Text accessibilityRole="header" style={[styles.greeting, { color: theme.text }]}>
          {`${getGreeting(now)},\n${user.name}.`}
        </Text>
      </View>

      <Pressable
        onPress={() => router.push('/profile')}
        accessibilityRole="button"
        accessibilityLabel={`Open your profile, ${user.name}`}
        hitSlop={8}
        style={({ pressed }) => [
          styles.avatar,
          { backgroundColor: theme.accent, transform: [{ scale: pressed ? 0.96 : 1 }] },
        ]}
      >
        <Text style={styles.initials}>{user.initials}</Text>
      </Pressable>
    </View>
  );
}

/** "THURSDAY, 6 NOVEMBER" in the user's own locale formatting, uppercased. */
function formatDate(date: Date): string {
  return date
    .toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })
    .toUpperCase();
}

function getGreeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
  },
  copy: {
    flex: 1,
  },
  date: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.9,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  initials: {
    // Dark ink on the mint fill, per the contrast rule in the design doc.
    color: onPhoto.ink,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
