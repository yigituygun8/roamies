import { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

import { useTheme } from '@/lib/theme';
import { hasSeenOnboarding } from '@/lib/onboarding';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Splash / intro screen.
 *
 * Plays the brand animation once (5 s, no loop) and then navigates to home for a
 * signed-in user, or onboarding (first launch) / welcome (returning user)
 * otherwise. The animation ends on a held logo frame, so leaving on `playToEnd`
 * keeps the transition seamless.
 *
 * `hasNavigated` is set before the async reads so that a simultaneous
 * `playToEnd` + tap cannot trigger two navigations.
 */
export default function IndexScreen() {
  const theme = useTheme();
  const router = useRouter();
  const hasNavigated = useRef(false);

  const player = useVideoPlayer(require('../../assets/videos/splash.mp4'), (p) => {
    p.loop = false;
    p.muted = true;
    p.play();
  });

  const goNext = useCallback(async () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    const { data } = await supabase.auth.getSession();
    if (data.session) {
      console.log('Redirecting to home');
      router.replace('/home');
      return;
    }

    await AsyncStorage.removeItem('hasSeenOnboarding'); // Remove this line to keep the onboarding flag persistent
    const seen = await hasSeenOnboarding();
    console.log('hasSeenOnboarding', seen);
    router.replace(seen ? '/welcome' : '/onboarding');
  }, [router]);

  useEventListener(player, 'playToEnd', goNext);

  // Never trap the user on the splash if the video fails to load or play.
  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'error') {
      goNext();
    }
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
  },
  video: {
    width: '100%',
    aspectRatio: 1,
  },
});
