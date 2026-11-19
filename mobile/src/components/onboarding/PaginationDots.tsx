import { Pressable, StyleSheet, View } from 'react-native';

import { onPhoto, useTheme } from '@/lib/theme';

type Props = {
  count: number;
  activeIndex: number;
  onDotPress?: (index: number) => void;
  /**
   * `onPhoto` keeps the dots visible on a dark scrim (white instead of the
   * brand accent, which is too close to the photo tones).
   */
  variant?: 'default' | 'onPhoto';
};

/**
 * Row of dot indicators for a paged list. The active dot is wider, giving it a
 * pill shape, and the inactive ones fade out.
 */
export function PaginationDots({
  count,
  activeIndex,
  onDotPress,
  variant = 'default',
}: Props) {
  const theme = useTheme();
  const color = variant === 'onPhoto' ? onPhoto.text : theme.accent;

  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, i) => (
        <Pressable
          key={i}
          onPress={() => onDotPress?.(i)}
          accessibilityRole="button"
          accessibilityLabel={`Go to slide ${i + 1}`}
          hitSlop={10} // Increase the touch target size for easier tapping
        >
          <View
            style={[
              styles.dot,
              i === activeIndex ? styles.dotActive : styles.dotInactive,
              {
                backgroundColor: color,
                opacity: i === activeIndex ? 1 : 0.38,
              },
            ]}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 22,
  },
  dotInactive: {
    width: 8,
  },
});
