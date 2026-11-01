import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/lib/theme';

type Props = {
  count: number;
  activeIndex: number;
  onDotPress?: (index: number) => void;
};

/**
 * Row of dot indicators for a paged list. The active dot uses the brand
 * accent colour and is slightly wider to give a pill shape.
 */
export function PaginationDots({ count, activeIndex, onDotPress }: Props) {
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
            style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]}
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
    width: 20,
    backgroundColor: colors.accent,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.text,
    opacity: 0.3,
  },
});
