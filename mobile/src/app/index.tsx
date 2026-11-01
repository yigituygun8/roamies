import { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

import { colors } from '@/lib/theme';
import { hasSeenOnboarding } from '@/lib/onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Splash / intro screen.
 *
 * Plays the brand animation once (5 s, no loop) and then navigates to
 * onboarding (first launch) or login (returning user). The animation ends on
 * a held logo frame, so leaving on `playToEnd` keeps the transition seamless.
 *
 * `hasNavigated` is set to true before the async flag read so that a
 * simultaneous `playToEnd` + tap cannot trigger two navigations.
 *
 * Later, the gate for leaving this screen will also wait for the app to be
 * ready (fonts, Supabase session), so the intro time is not wasted time.
 */
export default function IndexScreen() {
  const router = useRouter();
  const hasNavigated = useRef(false);

  const player = useVideoPlayer(require('../../assets/videos/splash.mp4'), (p) => {
    p.loop = false;
    p.muted = true;
    p.play();
  });

  const goNext = useCallback(async () => {
    await AsyncStorage.removeItem('hasSeenOnboarding'); // TODO: remove this line after testing. This is for testing purposes only, to reset the onboarding flag on each app launch.
    
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    const seen = await hasSeenOnboarding();
    router.replace(seen ? '/login' : '/onboarding');
  }, [router]);

  useEventListener(player, 'playToEnd', goNext);

  // Never trap the user on the splash if the video fails to load or play.
  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'error') {
      goNext();
    }
  });

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={goNext}
        accessibilityRole="button"
        accessibilityLabel="Skip intro"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  video: {
    width: '100%',
    aspectRatio: 1,
  },
});
