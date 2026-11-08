import { useEffect } from 'react';
import { Stack, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';

// Keep the native splash on screen until the first frame of the app is ready,
// so the user never sees a flash of an empty screen.
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 300, fade: true });

/**
 * Route roots that require a Supabase session.
 *
 * Every tab lives at its own root (`/home`, `/activity`, `/chat`, `/profile`),
 * the `(tabs)` group is stripped from the URL, so each one is listed here.
 */
const PROTECTED_ROOTS = ['home', 'activity', 'chat', 'profile', 'trips'];

export default function RootLayout() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  // When the session goes away (sign out, revoked token), passive screens such
  // as /home must not stay visible. Public routes are left alone so onboarding
  // and login are never interrupted.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== 'SIGNED_OUT' || session) return;

      const root = pathname.split('/')[1] ?? '';
      if (PROTECTED_ROOTS.includes(root)) {
        router.replace('/welcome');
      }
    });

    return () => data.subscription.unsubscribe();
  }, [pathname, router]);

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="onboarding"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="welcome"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name="login" options={{ title: 'Login' , headerShown: false }} />
      <Stack.Screen name="register" options={{ title: 'Register' , headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="trips/new" options={{ title: 'New Trip' }} />
      <Stack.Screen name="trips/join" options={{ title: 'Join a trip' }} />
      <Stack.Screen name="trips/[id]/lobby" options={{ title: 'Trip Lobby' }} />
    </Stack>
  );
}
