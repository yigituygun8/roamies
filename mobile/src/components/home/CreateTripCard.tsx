import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { onPhoto, useTheme } from '@/lib/theme';

/** Full-width "start a new trip" row at the bottom of the trip list. */
export function CreateTripCard() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/trips/new')}
      accessibilityRole="button"
      accessibilityLabel="Plan a new trip"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.borderSubtle,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: theme.accent }]}>
        <Ionicons name="add" size={20} color={onPhoto.ink} />
      </View>

      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.text }]}>Plan a new trip</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Pick a city and invite the group
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 72,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
