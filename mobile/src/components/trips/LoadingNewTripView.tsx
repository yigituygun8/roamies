import { ActivityIndicator, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { FadeIn } from '@/components/ui/FadeIn';
import { useTheme } from '@/lib/theme';

/**
 * Loading state shown right after submitting the New Trip wizard.
 */
export function LoadingNewTripView() {
  const theme = useTheme();
  const scheme = useColorScheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <FadeIn>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingTitle, { color: theme.text }]}>
            Preparing your trip...
          </Text>
          <Text style={[styles.loadingSubtitle, { color: theme.textMuted }]}>
            Setting everything up for you and your roamies.
          </Text>
        </View>
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  loadingSubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
});