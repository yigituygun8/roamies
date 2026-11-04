import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/lib/theme';

type Props = {
  label: string;
  onPress: () => void;
  marginBottom?: number;
  accessibilityLabel?: string;
};

/**
 * Full-width accent-coloured button used for primary actions (Next, Get
 * Started, etc.). Reusable across screens.
 */
export function PrimaryButton({ label, onPress, marginBottom = 5, accessibilityLabel }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, {backgroundColor: theme.accent, marginBottom: marginBottom}, pressed && styles.buttonPressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Text style={[styles.label, {color: theme.text}]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
  },
});
