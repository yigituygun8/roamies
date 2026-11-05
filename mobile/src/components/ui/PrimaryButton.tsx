import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { onPhoto, useTheme } from '@/lib/theme';

export type ButtonVariant = 'accent' | 'light' | 'ghost' | 'outline';

type Props = {
  label: string;
  onPress: () => void;
  /**
   * - `accent`: brand mint fill (default, works on normal surfaces)
   * - `light`: white fill, for the bottom of a photo screen
   * - `ghost`: translucent glass, secondary action on a photo
   * - `outline`: hairline outline, secondary action on a normal surface
   */
  variant?: ButtonVariant;
  icon?: ComponentProps<typeof Ionicons>['name'];
  fullWidth?: boolean;
  disabled?: boolean;
  /** Shows a spinner and blocks presses while an async action runs. */
  loading?: boolean;
  marginBottom?: number;
  accessibilityLabel?: string;
};

/**
 * Full-width pill button used for primary and secondary actions.
 *
 * Variants exist so the same component can sit on a photo (light/ghost) and on
 * a form card (accent/outline) without duplicating layout code.
 */
export function PrimaryButton({
  label,
  onPress,
  variant = 'accent',
  icon,
  fullWidth = false,
  disabled = false,
  loading = false,
  marginBottom = 5,
  accessibilityLabel,
}: Props) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const surface = {
    accent: {
      backgroundColor: theme.accent,
      borderWidth: 0,
      color: onPhoto.ink,
    },
    light: {
      backgroundColor: '#FFFFFF',
      borderWidth: 0,
      color: onPhoto.ink,
    },
    ghost: {
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.34)',
      color: onPhoto.text,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.borderSubtle,
      color: theme.text,
    },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        fullWidth && styles.fullWidth,
        variant === 'light' && styles.elevated,
        {
          backgroundColor: surface.backgroundColor,
          borderWidth: surface.borderWidth,
          borderColor: 'borderColor' in surface ? surface.borderColor : undefined,
          marginBottom,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={surface.color} />
        ) : (
          icon && <Ionicons name={icon} size={19} color={surface.color} />
        )}
        <Text style={[styles.label, { color: surface.color }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  fullWidth: {
    width: '100%',
    alignSelf: 'stretch',
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
