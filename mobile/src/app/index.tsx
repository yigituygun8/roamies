import { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

import { colors } from '@/lib/theme';

/**
 * Splash / intro screen.
 *
 * Plays the brand animation once (5 s, no loop) and then goes to the login
 * screen. The animation ends on a held logo frame, so leaving on `playToEnd`
 * keeps the transition seamless.
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

  const goNext = useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    router.replace('/login');
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
