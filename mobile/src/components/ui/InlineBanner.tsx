import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/lib/theme';

type Props = {
  tone?: 'info' | 'error';
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * Inline banner for invites and failures.
 *
 * It sits above the list instead of replacing it, so the user keeps whatever
 * content loaded and gets a retry next to the message.
 */
export function InlineBanner({ tone = 'info', message, actionLabel, onAction }: Props) {
  const theme = useTheme();
  const isError = tone === 'error';
  const color = isError ? theme.danger : theme.accentText;

  return (
    <View
      accessibilityRole={isError ? 'alert' : 'text'}
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.borderSubtle,
        },
      ]}
    >
      <Ionicons
        name={isError ? 'cloud-offline-outline' : 'information-circle-outline'}
        size={20}
        color={color}
      />
      <Text style={[styles.message, { color: theme.text }]}>{message}</Text>

      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={10}
        >
          <Text style={[styles.action, { color }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  message: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  action: {
    fontSize: 13,
    fontWeight: '700',
  },
});
