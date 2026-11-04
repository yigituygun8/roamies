import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { ListViewToken as ViewToken } from '@react-native/virtualized-lists';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/lib/theme';
import { markOnboardingSeen } from '@/lib/onboarding';
import { OnboardingSlide } from '@/components/onboarding/OnboardingSlide';
import { PaginationDots } from '@/components/PaginationDots';
import { PrimaryButton } from '@/components/PrimaryButton';

// ---------------------------------------------------------------------------
// Slide data
// ---------------------------------------------------------------------------

type Slide = {
  id: string;
  emoji: string;
  title: string;
  description: string;
};

const SLIDES: Slide[] = [
  {
    id: '1',
    emoji: '🧭',
    title: 'Plan trips together',
    description: 'Create a trip and invite your friends in seconds.',
  },
  {
    id: '2',
    emoji: '👈👉',
    title: 'Swipe on places',
    description:
      'Say yes or no to sights, food and activities in your destination.',
  },
  {
    id: '3',
    emoji: '🗺️',
    title: 'Get a fair plan',
    description:
      "We combine everyone's votes into one route that works for the whole group.",
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
 * Shows three slides in a horizontal FlatList (pagingEnabled). The user can
 * swipe or tap Next / Get Started to advance. Skip is shown on the top-right
 * on all slides except the last one.
 *
 * Both Skip and Get Started call `finish()`, which persists the
 * `hasSeenOnboarding` flag and navigates to /login with router.replace so
 * the user cannot swipe back to this screen.
 */
export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const isLast = activeIndex === SLIDES.length - 1;

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
    router.replace('/login');
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
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Skip button — hidden on the last slide */}
      <View style={styles.skipRow}>
        {!isLast && (
          <Pressable
            onPress={finish}
            style={({ pressed }) => [styles.skipPill, { backgroundColor: theme.surfaceSubtle, borderColor: theme.borderSubtle }, pressed && styles.skipPillPressed]}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            hitSlop={8}
          >
            <Text style={[styles.skipText, { color: theme.text }]}>Skip</Text>
          </Pressable>
        )}
      </View>

      {/* Slides */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OnboardingSlide
            emoji={item.emoji}
            title={item.title}
            description={item.description}
            width={width}
          />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        style={styles.list}
      />

      {/* Dot indicators */}
      <PaginationDots count={SLIDES.length} activeIndex={activeIndex} onDotPress={goToSlide} />

      {/* Next / Get Started button */}
      <PrimaryButton
        label={isLast ? 'Get Started' : 'Next'}
        onPress={goNext}
        marginBottom={35}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  skipRow: {
    width: '100%',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
    minHeight: 44,
  },
  skipPill: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  skipPillPressed: {
    opacity: 0.8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  list: {
    flex: 1,
  },
});
