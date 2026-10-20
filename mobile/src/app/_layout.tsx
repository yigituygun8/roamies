import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Roamies' }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="home" options={{ title: 'Home' }} />
      <Stack.Screen name="trips/new" options={{ title: 'New Trip' }} />
      <Stack.Screen name="trips/[id]/lobby" options={{ title: 'Trip Lobby' }} />
    </Stack>
  );
}
