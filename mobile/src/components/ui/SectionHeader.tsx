import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/lib/theme';

type Props = {
  /** Plain string, or a fragment when a word needs emphasis. */
  title: ReactNode;
  /** Optional trailing link; omit it when there is nowhere to go yet. */
  actionLabel?: string;
  onPressAction?: () => void;
};

/** Section title with an optional "See all" link. */
export function SectionHeader({ title, actionLabel, onPressAction }: Props) {
  const theme = useTheme();
  const showAction = Boolean(actionLabel && onPressAction);

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
        {title}
      </Text>

      {showAction ? (
        <Pressable
          onPress={onPressAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={12}
          style={styles.action}
        >
          <Text style={[styles.actionLabel, { color: theme.textMuted }]}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: 44,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
