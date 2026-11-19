import { useEffect } from 'react';
import { Animated, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { useAnimatedValue } from '@/lib/useAnimatedValue';
import { useTheme } from '@/lib/theme';
import { useReducedMotion } from '@/lib/useReducedMotion';

type Props = {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * A single placeholder block.
 *
 * Card skeletons are built out of these (see `NextUpCardSkeleton` and
 * `TripCardSkeleton`) so the loading state always matches the real card's
 * measurements instead of drifting from a second layout.
 *
 * The pulse is skipped when the OS asks for reduced motion; the block then
 * stays at a flat, readable opacity.
 */
export function Skeleton({ width = '100%', height = 14, radius = 8, style }: Props) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const opacity = useAnimatedValue(0.6);

  useEffect(() => {
    if (reducedMotion) {
      opacity.setValue(0.8);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.55, duration: 750, useNativeDriver: true }),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [opacity, reducedMotion]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: theme.surfaceSubtle,
          opacity,
        },
        style,
      ]}
    />
  );
}
