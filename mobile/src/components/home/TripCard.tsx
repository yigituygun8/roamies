import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { TripCover } from '@/components/home/TripCover';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusChip } from '@/components/ui/StatusChip';
import { useTheme } from '@/lib/theme';
import { getTripStatusView } from '@/lib/trips';
import type { Trip } from '@/types/trip';

const COVER_HEIGHT = 104;

type Props = {
  trip: Trip;
  /** The grid decides how wide a card is; the card only owns its internals. */
  style?: StyleProp<ViewStyle>;
};

/**
 * Compact card for every trip that is not the hero.
 *
 * Reads as a summary, not a second call to action: thumbnail, city, dates, the
 * group, and the same status copy as the hero.
 */
export function TripCard({ trip, style }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const status = getTripStatusView(trip);
  const dates = trip.dateLabel ?? 'Dates to be decided';

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/trips/[id]/lobby', params: { id: trip.id } })
      }
      accessibilityRole="button"
      accessibilityLabel={`${trip.city}, ${dates}, ${status.heroChip}. Open trip.`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.borderSubtle,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      <View style={styles.cover}>
        <TripCover trip={trip} initialSize={28} />
      </View>

      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.city, { color: theme.text }]}>
          {trip.city}
        </Text>
        <Text numberOfLines={1} style={[styles.dates, { color: theme.textMuted }]}>
          {dates}
        </Text>

        <View style={styles.footerRow}>
          <AvatarStack members={trip.members} size={22} />
          <View style={styles.chip}>
            <StatusChip label={status.cardChip} tone={status.tone} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/** Same footprint as `TripCard`, for the loading state. */
export function TripCardSkeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.borderSubtle },
        style,
      ]}
    >
      <Skeleton width="100%" height={COVER_HEIGHT} radius={0} />
      <View style={styles.body}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="50%" height={12} style={styles.skeletonDates} />
        <View style={styles.footerRow}>
          <Skeleton width={58} height={22} radius={11} />
          <Skeleton width={62} height={12} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  cover: {
    height: COVER_HEIGHT,
  },
  body: {
    padding: 12,
  },
  city: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  dates: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    flexShrink: 1,
  },
  skeletonDates: {
    marginTop: 6,
  },
});
