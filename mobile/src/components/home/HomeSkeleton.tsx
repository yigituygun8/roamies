import { StyleSheet, View } from 'react-native';

import { NextUpCardSkeleton } from '@/components/home/NextUpCard';
import { TripCardSkeleton } from '@/components/home/TripCard';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Loading state for the trips screen.
 *
 * Mirrors the populated layout: header, hero, two compact cards. It is not a
 * separate design, so it cannot drift away from the real screen.
 */
export function HomeSkeleton() {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading your trips"
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Skeleton width={150} height={11} />
          <Skeleton width={230} height={30} />
          <Skeleton width={170} height={30} />
        </View>
        <Skeleton width={46} height={46} radius={23} />
      </View>

      <NextUpCardSkeleton />

      <View style={styles.sectionTitle}>
        <Skeleton width={110} height={18} />
      </View>

      <View style={styles.grid}>
        <TripCardSkeleton style={styles.gridItem} />
        <TripCardSkeleton style={styles.gridItem} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
  },
  headerCopy: {
    flex: 1,
    gap: 10,
  },
  sectionTitle: {
    marginTop: 28,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
  },
});
