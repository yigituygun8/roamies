import { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/lib/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Scrim } from '@/components/ui/Scrim';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  showBackButton?: boolean;
};

/**
 * Shared shell for the login and register forms.
 *
 * A photo band sits at the top, the form lives on a sheet that overlaps the
 * photo by a few points (the classic bottom-sheet curve), and everything below
 * scrolls so the keyboard never hides a field.
 */
export function AuthLayout({ title, subtitle, showBackButton = false, children }: AuthLayoutProps) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.photo}>
          <Image
            source={require('@/assets/images/loginBackground/loginHero.jpg')}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
          />
          <Scrim height="45%" from={0} to={0.6} />
          <Scrim height="22%" from={0.5} to={0} position="top" />

          {showBackButton && (
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                { top: insets.top + 8 },
                pressed && styles.pressed,
              ]}
              onPress={() => router.replace("/welcome")} 
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </Pressable>
          )}
        </View>

        <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>

          <View style={styles.form}>{children}</View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  photo: {
    height: 300,
    width: '100%',
    overflow: 'hidden',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 12, 34, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  pressed: {
    opacity: 0.7,
  },
  sheet: {
    flex: 1,
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  form: {
    gap: 16,
  },
});
