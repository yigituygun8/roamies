import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { colors } from '@/lib/theme';

// Keep the native splash on screen until the first frame of the app is ready,
// so the user never sees a flash of an empty screen.
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 300, fade: true });

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Roamies' }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="home" options={{ title: 'Home' }} />
      <Stack.Screen name="trips/new" options={{ title: 'New Trip' }} />
      <Stack.Screen name="trips/[id]/lobby" options={{ title: 'Trip Lobby' }} />
    </Stack>
  );
}
