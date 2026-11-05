import type { ReactNode } from 'react';
import { Image, type ImageProps } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { onPhoto } from '@/lib/theme';
import { Scrim } from './Scrim';

type Props = {
  source: ImageProps['source'];
  children?: ReactNode;
  /** Which part of the photo to keep when it is cropped to the screen. */
  focus?: ImageProps['contentPosition'];
  /** How much of the screen the bottom scrim covers. */
  bottomScrimHeight?: number | `${number}%`;
  /** Flat darkening of the whole photo, so busy areas stay readable. */
  overlay?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Full-bleed photo with the scrims that make white text readable on top.
 *
 * The heavy part of the ramp is baked into the image files themselves (see
 * `mobile/assets/images/CREDITS.md`), because a runtime gradient drawn out of
 * flat bands shows visible stripes on smooth skies. What is left here is a
 * gentle runtime scrim that guarantees legibility when the photo is cropped
 * differently (tablets, landscape) plus a scrim for the status bar area.
 */
export function PhotoHero({
  source,
  children,
  focus = 'center',
  bottomScrimHeight = '60%',
  overlay = 0,
  style,
}: Props) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition={focus}
        transition={250}
        cachePolicy="memory-disk"
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: `rgba(${onPhoto.scrimRgb}, ${overlay})` },
        ]}
      />
      <Scrim height="26%" from={0.25} to={0} position="top" steps={16} />
      <Scrim height={bottomScrimHeight} from={0} to={0.35} curve={1.2} steps={20} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});
