import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/lib/theme';

type Props = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

/**
 * Full-width accent-coloured button used for primary actions (Next, Get
 * Started, etc.). Reusable across screens.
 */
export function PrimaryButton({ label, onPress, accessibilityLabel }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
    marginBottom: 32,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  label: {
    color: colors.background,
    fontSize: 17,
    fontWeight: '700',
  },
});
