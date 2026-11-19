import { StyleSheet, Text, View } from 'react-native';

import { onPhoto, useTheme } from '@/lib/theme';

type Props = {
  label: string;
  /** `accent` when the trip needs the user, `muted` otherwise. */
  tone?: 'accent' | 'muted';
  /** Sits on a photo: glass fill, light text, no shape change to the layout. */
  onPhoto?: boolean;
};

/**
 * Trip state as text plus a dot, never colour alone.
 *
 * The dot is decorative; the label carries the meaning for screen readers and
 * for anyone who cannot separate mint from grey.
 */
export function StatusChip({ label, tone = 'accent', onPhoto: isOnPhoto = false }: Props) {
  const theme = useTheme();

  const dotColor =
    tone === 'accent' ? theme.accent : isOnPhoto ? onPhoto.textMuted : theme.textMuted;
  const textColor = isOnPhoto ? onPhoto.text : tone === 'accent' ? theme.text : theme.textMuted;

  return (
    <View
      style={[
        styles.container,
        isOnPhoto && styles.onPhoto,
        isOnPhoto && {
          backgroundColor: `rgba(${onPhoto.scrimRgb}, 0.55)`,
          borderColor: onPhoto.glassBorder,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text numberOfLines={1} style={[styles.label, { color: textColor }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  onPhoto: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
    flexShrink: 1,
  },
});
