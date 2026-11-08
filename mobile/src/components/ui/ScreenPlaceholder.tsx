import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useTheme } from '@/lib/theme';
import { useTabBarSpace } from '@/components/navigation/TabBar';

type Props = {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  message: string;
  /** Optional way out, so a placeholder never becomes a dead end. */
  action?: { label: string; to: '/home' | '/trips/new' };
  /** True for placeholder tabs: keeps room for the floating tab bar. */
  insideTabs?: boolean;
};

/**
 * Temporary body for tabs that are not built yet (Activity, Chat, Profile).
 *
 * It keeps the tab navigator and the safe areas honest while the real screens
 * are separate issues, and it is the first thing to delete when they land.
 */
export function ScreenPlaceholder({ icon, title, message, action, insideTabs = false }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const tabBarSpace = useTabBarSpace();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top + 32,
          paddingBottom: insideTabs ? tabBarSpace : insets.bottom + 32,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.surfaceSubtle }]}>
        <Ionicons name={icon} size={30} color={theme.accentText} />
      </View>
      <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
        {title}
      </Text>
      <Text style={[styles.message, { color: theme.textMuted }]}>{message}</Text>
      {action ? (
        <View style={styles.action}>
          <PrimaryButton
            label={action.label}
            variant="outline"
            onPress={() => router.push(action.to)}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    maxWidth: 320,
  },
  action: {
    marginTop: 24,
    alignSelf: 'stretch',
    maxWidth: 320,
  },
});
