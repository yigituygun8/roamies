import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Scrim } from '@/components/ui/Scrim';
import type { Trip } from '@/types/trip';

/** Brand navy. Deliberately theme-independent: the fallback always needs white text. */
const FALLBACK_BASE = '#0B1220';

type Props = {
  trip: Trip;
  /** Size of the fallback city initial; cards use a smaller one than the hero. */
  initialSize?: number;
};

/**
 * Cover photo, or the brand-gradient fallback with the city initial.
 *
 * Fills its parent (which sets the height and clips the corners); text drawn
 * on top lives in the card, not here, so the same cover works for both the
 * hero and the compact card.
 */
export function TripCover({ trip, initialSize = 64 }: Props) {
  if (trip.cover) {
    return (
      <Image
        source={trip.cover}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={250}
        cachePolicy="memory-disk"
        accessible={false}
      />
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.fallback, { backgroundColor: FALLBACK_BASE }]}>
      {/* Navy to mint, so white text stays readable on top in both themes. */}
      <Scrim
        height="100%"
        from={0.6}
        to={0}
        color="9, 226, 161"
        curve={1.5}
        steps={30}
        position="bottom"
      />
      <Text style={[styles.initial, { fontSize: initialSize }]}>
        {trip.city.slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: '#FFFFFF',
    fontWeight: '800',
    opacity: 0.92,
    letterSpacing: -2,
  },
});
