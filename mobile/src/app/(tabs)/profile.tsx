import { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Text, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import type { ImageProps } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FadeIn } from '@/components/ui/FadeIn';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { SettingGroup, SettingRow, SettingToggle } from '@/components/ui/SettingRow';
import { useTabBarSpace } from '@/components/navigation/TabBar';
import { ProfileHeaderCard } from '@/components/profile/ProfileHeaderCard';
import { PersonaPreviewCard } from '@/components/profile/PersonaPreviewCard';
import { QrCard } from '@/components/profile/QrCard';
import { QrBottomSheet } from '@/components/profile/QrBottomSheet';
import { SignOutButton } from '@/components/profile/SignOutButton';

import { useTheme } from '@/lib/theme';
import { setThemeOverride } from '@/lib/theme-override';
import { fetchProfile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import type { TravelStyle, DietaryPreference } from '@/types/profile';

const NOTIFICATIONS_KEY = '@roamies/notifications_enabled';
const PLACEHOLDER_USER_ID = 'demo-placeholder-id';

interface ProfileUserState {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: ImageProps['source'] | null;
  travelStyle: TravelStyle | null;
  dietaryPreferences: DietaryPreference[];
}

/**
 * Profile tab — orchestrates user info, QR identity card, preferences, and sign out.
 */
export default function ProfileScreen() {
  const theme = useTheme();
  const scheme = useColorScheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();

  // ── User state ────────────────────────────────────────────────────────────
  const [user, setUser] = useState<ProfileUserState>({
    name: 'Julia Yu',
    username: '@juliayu',
    email: 'julia.yu@roamies.app',
    avatar: null,
    id: PLACEHOLDER_USER_ID,
    travelStyle: 'culture',
    dietaryPreferences: ['vegetarian'],
  });

  // Reload profile whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function syncUser() {
        try {
          let currentUserId = PLACEHOLDER_USER_ID;
          let currentEmail = 'julia.yu@roamies.app';

          try {
            const { data } = await supabase.auth.getUser();
            if (data?.user) {
              currentUserId = data.user.id;
              if (data.user.email) currentEmail = data.user.email;
            }
          } catch {
            // Auth not connected or offline, use defaults
          }

          const profile = await fetchProfile(currentUserId, currentEmail);
          if (active) {
            setUser({
              id: profile.id,
              name: profile.fullName || 'Julia Yu',
              username: profile.username
                ? profile.username.startsWith('@')
                  ? profile.username
                  : `@${profile.username}`
                : '@juliayu',
              email: profile.email || 'julia.yu@roamies.app',
              avatar: profile.avatarUrl ? { uri: profile.avatarUrl } : null,
              travelStyle: profile.travelStyle,
              dietaryPreferences: profile.dietaryPreferences || [],
            });
          }
        } catch {
          // ignore error
        }
      }

      syncUser();
      return () => {
        active = false;
      };
    }, [])
  );

  // ── Dark mode toggle ───────────────────────────────────────────────────────
  const [isDarkMode, setIsDarkMode] = useState(scheme === 'dark');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDarkMode(scheme === 'dark');
    }, 0);
    return () => clearTimeout(timer);
  }, [scheme]);

  const handleDarkModeToggle = useCallback((value: boolean) => {
    setIsDarkMode(value);
    setThemeOverride(value ? 'dark' : 'light');
  }, []);

  // ── Notifications toggle ───────────────────────────────────────────────────
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(NOTIFICATIONS_KEY).then((v) => {
      setNotificationsEnabled(v === 'true');
    });
  }, []);

  const handleNotificationsToggle = useCallback((value: boolean) => {
    setNotificationsEnabled(value);
    AsyncStorage.setItem(NOTIFICATIONS_KEY, value ? 'true' : 'false');
  }, []);

  // ── QR bottom sheet state ──────────────────────────────────────────────────
  const [qrVisible, setQrVisible] = useState(false);

  // ── Sign out modal state ───────────────────────────────────────────────────
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);

  const handleSignOutConfirm = useCallback(() => {
    setSignOutModalVisible(false);
    // TODO: replace with await supabase.auth.signOut();
    router.replace('/login');
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: tabBarSpace },
        ]}
      >
        {/* ── Screen title ── */}
        <FadeIn>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.screenTitle, { color: theme.text }]}>Profile</Text>
          </View>
        </FadeIn>

        {/* ── User info card ── */}
        <FadeIn delay={60}>
          <ProfileHeaderCard
            name={user.name}
            username={user.username}
            email={user.email}
            avatar={user.avatar}
          />
        </FadeIn>

        {/* ── Travel Persona & Dietary Preferences Card ── */}
        <FadeIn delay={80}>
          <PersonaPreviewCard
            travelStyle={user.travelStyle}
            dietaryPreferences={user.dietaryPreferences}
            onPress={() => router.push('/profile/edit')}
          />
        </FadeIn>

        {/* ── Your Roamie QR card ── */}
        <FadeIn delay={100}>
          <QrCard onPress={() => setQrVisible(true)} />
        </FadeIn>

        {/* ── Preferences & Settings ── */}
        <FadeIn delay={140}>
          <SettingGroup title="Preferences & Settings">
            <SettingRow
              icon="person-circle-outline"
              title="Account Details"
              subtitle="Manage personal info and security"
              onPress={() => router.push('/profile/edit')}
            />
            <SettingToggle
              icon={isDarkMode ? 'moon' : 'moon-outline'}
              title="Dark Mode"
              subtitle="Override the system appearance"
              value={isDarkMode}
              onValueChange={handleDarkModeToggle}
            />
            <SettingToggle
              icon={notificationsEnabled ? 'notifications' : 'notifications-outline'}
              title="Notifications"
              subtitle="Trip invites and group reminders"
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
            />
          </SettingGroup>
        </FadeIn>

        {/* ── Sign Out ── */}
        <FadeIn delay={180}>
          <SignOutButton onPress={() => setSignOutModalVisible(true)} />
        </FadeIn>
      </ScrollView>

      {/* ── Modals & Sheets ── */}
      <QrBottomSheet
        visible={qrVisible}
        onClose={() => setQrVisible(false)}
        userId={user.id}
        name={user.name}
        username={user.username}
      />

      <ConfirmModal
        visible={signOutModalVisible}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmLabel="Sign Out"
        isDestructive
        onCancel={() => setSignOutModalVisible(false)}
        onConfirm={handleSignOutConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  headerTitleContainer: {
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
});
