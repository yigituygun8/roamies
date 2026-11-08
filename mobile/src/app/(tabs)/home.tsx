import { ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { CreateTripCard } from '@/components/home/CreateTripCard';
import { EmptyState } from '@/components/home/EmptyState';
import { HomeHeader } from '@/components/home/HomeHeader';
import { HomeSkeleton } from '@/components/home/HomeSkeleton';
import { NextUpCard } from '@/components/home/NextUpCard';
import { TripCard } from '@/components/home/TripCard';
import { useTabBarSpace } from '@/components/navigation/TabBar';
import { FadeIn } from '@/components/ui/FadeIn';
import { InlineBanner } from '@/components/ui/InlineBanner';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useTheme } from '@/lib/theme';
import { useTrips } from '@/lib/trips';

/**
 * Trips tab — the hub after login.
 *
 * Answers three questions in order: what needs me now (one hero), how are the
 * other trips doing (compact cards), how do I start another one (create row).
 * The data comes from `useTrips`, which is mock-backed for now.
 */
export default function HomeScreen() {
  const theme = useTheme();
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const { status, trips, nextUp, user, retry } = useTrips();

  const otherTrips = nextUp ? trips.filter((trip) => trip.id !== nextUp.id) : trips;
  const isEmpty = status === 'ready' && trips.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: tabBarSpace },
        ]}
      >
        <HomeHeader user={user} />

        {status === 'error' ? (
          <InlineBanner
            tone="error"
            message="We could not load your trips. Check your connection and try again."
            actionLabel="Retry"
            onAction={retry}
          />
        ) : null}

        {status === 'loading' ? <HomeSkeleton /> : null}

        {isEmpty ? (
          <FadeIn>
            <EmptyState />
          </FadeIn>
        ) : null}

        {status === 'ready' && nextUp ? (
          <>
            <FadeIn>
              <NextUpCard trip={nextUp} />
            </FadeIn>

            {otherTrips.length > 0 ? (
              <FadeIn delay={80}>
                {/* No "See all" link yet: the full trips screen does not exist. */}
                <View style={styles.section}>
                  <SectionHeader title="Your trips" />
                  <View style={styles.grid}>
                    {otherTrips.map((trip) => (
                      <TripCard key={trip.id} trip={trip} style={styles.gridItem} />
                    ))}
                  </View>
                </View>
              </FadeIn>
            ) : null}

            <FadeIn delay={120}>
              <View style={styles.createRow}>
                <CreateTripCard />
              </View>
            </FadeIn>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 28,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  gridItem: {
    width: '48%',
  },
  createRow: {
    marginTop: 20,
  },
});
