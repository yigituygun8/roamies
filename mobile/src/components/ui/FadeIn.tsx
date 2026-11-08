import { useEffect, type ReactNode } from 'react';
import { Animated, Easing } from 'react-native';

import { useAnimatedValue } from '@/lib/useAnimatedValue';
import { useReducedMotion } from '@/lib/useReducedMotion';

type Props = {
  children: ReactNode;
  /** Stagger between blocks, in milliseconds. */
  delay?: number;
  /** Starting offset in points; the content eases up into place. */
  offset?: number;
};

/**
 * Small entrance fade for the home sections.
 *
 * Land in one step, no parallax and no loop. Skipped entirely when the OS asks
 * for reduced motion.
 */
export function FadeIn({ children, delay = 0, offset = 12 }: Props) {
  const reducedMotion = useReducedMotion();
  const progress = useAnimatedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      progress.setValue(1);
      return;
    }

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 320,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();

    return () => animation.stop();
  }, [delay, progress, reducedMotion]);

  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [offset, 0],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}
