import { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { ListViewToken as ViewToken } from '@react-native/virtualized-lists';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { markOnboardingSeen } from '@/lib/onboarding';
import { onPhoto } from '@/lib/theme';
import { OnboardingSlide } from '@/components/onboarding/OnboardingSlide';
import { PaginationDots } from '@/components/onboarding/PaginationDots';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

// ---------------------------------------------------------------------------
// Slide data
// ---------------------------------------------------------------------------

type Slide = {
  id: string;
  image: number;
  icon: 'compass-outline' | 'swap-horizontal' | 'sparkles-outline';
  eyebrow: string;
  title: string;
  description: string;
};

const SLIDES: Slide[] = [
  {
    id: '1',
    image: require('@/assets/images/onboarding/plan.jpg'),
    icon: 'compass-outline',
    eyebrow: 'Trip planning, sorted',
    title: 'PLAN IT\nTOGETHER.',
    description: 'Create a trip, invite your friends and agree on a city in seconds.',
  },
  {
    id: '2',
    image: require('@/assets/images/onboarding/swipe.jpg'),
    icon: 'swap-horizontal',
    eyebrow: 'The fun part',
    title: 'SWIPE THE\nCITY.',
    description: 'Yes or no on sights, food and activities. Everyone gets a say, no arguing.',
  },
  {
    id: '3',
    image: require('@/assets/images/onboarding/fair.jpg'),
    icon: 'sparkles-outline',
    eyebrow: 'Nobody left out',
    title: 'ONE PLAN\nFOR ALL.',
    description:
      'Our fairness algorithm turns every vote into a route the whole group can live with.',
  },
];

// Defined outside the component — never recreated, never accessed as
// ref.current during render (satisfies react-hooks/refs rule).
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 50 } as const;

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/**
 * First-launch onboarding screen.
 *
 * Shows three full-bleed photo slides in a horizontal FlatList (pagingEnabled)
 * with the dots and the Continue button floating on top of the photo. Swipe,
 * dot or button all advance the list; on the last slide the button becomes
 * Get Started.
 *
 * Both Skip and Get Started call `finish()`, which persists the
 * `hasSeenOnboarding` flag and replaces the route with /welcome, so the user
 * cannot swipe back to this screen.
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const isLast = activeIndex === SLIDES.length - 1;

  // Space reserved at the bottom of every slide for the dots and the button.
  const bottomSpace = insets.bottom + 132;

  // getItemLayout lets scrollToIndex work without a layout-measurement delay.
  const getItemLayout = useCallback(
    (_: ArrayLike<Slide> | null | undefined, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width],
  );

  // Track the visible page so dots and button label stay in sync.
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  // Persist the flag and navigate away — used by both Skip and Get Started.
  const finish = useCallback(async () => {
    await markOnboardingSeen();
    router.replace('/welcome');
  }, [router]);

  const goNext = useCallback(() => {
    if (isLast) {
      finish();
    } else {
      listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  }, [activeIndex, isLast, finish]);

  const goToSlide = useCallback((index: number) => {
    listRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Slides */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OnboardingSlide
            image={item.image}
            icon={item.icon}
            eyebrow={item.eyebrow}
            title={item.title}
            description={item.description}
            width={width}
            height={height}
            bottomSpace={bottomSpace}
          />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        style={StyleSheet.absoluteFill}
      />

      {/* Skip button — hidden on the last slide, which has Get Started */}
      <View pointerEvents="box-none" style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        {!isLast && (
          <Pressable
            onPress={finish}
            style={({ pressed }) => [styles.skipPill, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            hitSlop={8}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>

      {/* Dots + primary action, floating over the photo */}
      <View
        pointerEvents="box-none"
        style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}
      >
        <PaginationDots
          count={SLIDES.length}
          activeIndex={activeIndex}
          onDotPress={goToSlide}
          variant="onPhoto"
        />
        <PrimaryButton
          label={isLast ? 'Get Started' : 'Continue'}
          onPress={goNext}
          variant="light"
          fullWidth
          marginBottom={0}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: onPhoto.ink,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  skipPill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: onPhoto.glassFill,
    borderWidth: 1,
    borderColor: onPhoto.glassBorder,
  },
  skipText: {
    color: onPhoto.text,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  pressed: {
    opacity: 0.75,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
});
