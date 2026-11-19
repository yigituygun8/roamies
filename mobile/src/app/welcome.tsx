import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { PhotoHero } from '@/components/ui/PhotoHero';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { onPhoto } from '@/lib/theme';

/**
 * Welcome / auth choice screen, shown once the user has seen the onboarding.
 *
 * It is the fork in the road: photo hero, a short brand statement, the email
 * Login / Register choice and the Google shortcut. There is no email vs. phone
 * split; the actual forms live in /login and /register.
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <PhotoHero source={require('@/assets/images/auth/welcome.jpg')} bottomScrimHeight="78%">
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.content,
              { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
            ]}
          >
            <Image
              source={require('@/assets/images/roamies-wordmark.png')}
              style={styles.wordmark}
              contentFit="contain"
              accessibilityLabel="Roamies"
            />

            <View style={styles.bottomGroup}>
              <View style={styles.copy}>
                <Text style={styles.eyebrow}>Your group trip starts here</Text>
                <Text accessibilityRole="header" style={styles.title}>
                  MEET.{'\n'}PLAN.{'\n'}ROAM.
                </Text>
                <Text style={styles.subtitle}>
                  Log in to pick up where your group left off, or create an account in a few seconds.
                </Text>
              </View>

              <View style={styles.actions}>
                <PrimaryButton
                  label="Login"
                  icon="log-in-outline"
                  variant="light"
                  fullWidth
                  marginBottom={12}
                  onPress={() => router.push('/login')}
                />
                <PrimaryButton
                  label="Register"
                  icon="person-add-outline"
                  variant="ghost"
                  fullWidth
                  marginBottom={16}
                  onPress={() => router.push('/register')}
                />

                <OAuthButtons variant="ghost" />
              </View>
            </View>
          </View>
        </ScrollView>
      </PhotoHero>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: onPhoto.ink,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  wordmark: {
    width: 148,
    aspectRatio: 3.616,
  },
  bottomGroup: {
    gap: 28,
    paddingBottom: 4,
  },
  copy: {
    paddingBottom: 0,
  },
  eyebrow: {
    color: onPhoto.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  title: {
    color: onPhoto.text,
    fontSize: 46,
    lineHeight: 47,
    fontWeight: '800',
    letterSpacing: -1.4,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 18,
  },
  subtitle: {
    color: onPhoto.textMuted,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 16,
    maxWidth: 320,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 12,
  },
  actions: {
    width: '100%',
  },
});
