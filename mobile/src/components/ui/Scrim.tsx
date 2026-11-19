import { StyleSheet, View } from 'react-native';

import { onPhoto } from '@/lib/theme';

type Props = {
  /**
   * Height of the scrim band. Percent strings are relative to the parent, so
   * the scrim can be pinned inside a full-screen photo.
   */
  height: number | `${number}%`;
  /** Opacity at the edge that touches the screen border. */
  from?: number;
  /** Opacity at the edge that faces the middle of the screen. */
  to?: number;
  /** Base colour as an `r, g, b` triplet (no `rgb()` wrapper). */
  color?: string;
  /** 1 = linear, > 1 keeps the outer edge transparent for longer. */
  curve?: number;
  /** Bands are cheap Views; more bands means a smoother ramp. */
  steps?: number;
  position?: 'top' | 'bottom';
};

/**
 * A flat, dependency-free vertical gradient.
 *
 * `expo-linear-gradient` is not installed and adding a native module would
 * force a new dev-client build, so the ramp is drawn with a stack of thin
 * Views whose opacity follows `curve`. It is only used as a scrim over
 * photos, where the banding is invisible in practice.
 */
export function Scrim({
  height,
  from = 0,
  to = 1,
  color = onPhoto.scrimRgb,
  curve = 1.5,
  steps = 40,
  position = 'bottom',
}: Props) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        position === 'top' ? styles.top : styles.bottom,
        { height },
      ]}
    >
      {Array.from({ length: steps }, (_, i) => {
        // Sample the middle of each band so the ramp starts and ends softly.
        const t = (i + 0.5) / steps;
        const alpha = from + (to - from) * Math.pow(t, curve);
        return (
          <View
            key={i}
            style={{
              flex: 1,
              backgroundColor: `rgba(${color}, ${alpha.toFixed(3)})`,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
  },
});
