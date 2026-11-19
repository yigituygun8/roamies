import { useState } from 'react';
import { Animated } from 'react-native';

/**
 * One `Animated.Value` for the lifetime of the component.
 *
 * `useRef(new Animated.Value()).current` is the usual recipe, but the React
 * Compiler lint rules reject reading a ref during render and the value is
 * needed by the first render's style. A lazy `useState` initialiser has the
 * same single-instance guarantee without the lint error.
 */
export function useAnimatedValue(initial: number): Animated.Value {
  const [value] = useState(() => new Animated.Value(initial));
  return value;
}
