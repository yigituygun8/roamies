import { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Pressable,
  Switch,
  Share,
  Platform,
  useColorScheme,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageProps } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import { BottomSheet, RNHostView } from '@expo/ui';

import { FadeIn } from '@/components/ui/FadeIn';
import { useTabBarSpace } from '@/components/navigation/TabBar';
import { onPhoto, useTheme } from '@/lib/theme';
import { setThemeOverride } from '@/lib/theme-override';

// ─── Constants ────────────────────────────────────────────────────────────────

const NOTIFICATIONS_KEY = '@roamies/notifications_enabled';

// Placeholder until Supabase auth is wired to this screen.
// Replace with supabase.auth.getUser() result when auth is connected.
const PLACEHOLDER_USER_ID = 'demo-placeholder-id';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  name: string;
  username: string;
  email: string;
  avatar: ImageProps['source'] | null;
  id: string;
}

interface SignOutModalState {
  visible: boolean;
  onConfirm?: () => void;
}

// ─── Main screen ──────────────────────────────────────────────────────────────

/**
 * Profile tab — user info, QR identity card, preference toggles, sign out.
 *
 * Dark Mode toggle: uses Appearance.setColorScheme() to override the system
 * theme inside the app. Choice is persisted in AsyncStorage so it survives
 * restarts. Because every screen reads useTheme() → useColorScheme(), zero
 * other screens need changing.
 *
 * Notifications toggle: UI-only for now (AsyncStorage flag). OS permission +
 * backend push logic is a future issue.
 *
 * QR code: encodes `roamies://user/<user_id>`. The scanning camera lives on
 * the trip detail screen (trips/[id]/lobby) where the trip context is known,
 * so the scan unambiguously adds this user to that specific trip.
 */
export default function ProfileScreen() {
  const theme = useTheme();
  const scheme = useColorScheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();

  // ── User state (placeholder until Supabase auth is wired up) ──────────────
  const [user] = useState<UserProfile>({
    name: 'Julia Yu',
    username: '@juliayu',
    email: 'julia.yu@roamies.app',
    avatar: null,
    id: PLACEHOLDER_USER_ID,
  });

  // ── Dark mode toggle ───────────────────────────────────────────────────────
  // Initialise from the current colour scheme (which may already be overridden
  // by applyPersistedTheme() that ran in _layout.tsx on startup).
  const [isDarkMode, setIsDarkMode] = useState(scheme === 'dark');

  // Keep the toggle in sync if the system scheme changes externally.
  useEffect(() => {
    async function updateDarkMode() {
      setIsDarkMode(scheme === 'dark');
    }
    updateDarkMode();
  }, [scheme, setIsDarkMode]);

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

  // ── QR bottom sheet ────────────────────────────────────────────────────────
  const [qrVisible, setQrVisible] = useState(false);

  const openQr = useCallback(() => {
    setQrVisible(true);
  }, []);

  const closeQr = useCallback(() => {
    setQrVisible(false);
  }, []);

  const qrValue = `roamies://user/${user.id}`;

  const handleShareProfile = useCallback(async () => {
    try {
      await Share.share({
        message: `Join me on Roamies! ${qrValue}`,
        title: `${user.name} on Roamies`,
      });
    } catch {
      // User dismissed the share sheet — not an error
    }
  }, [qrValue, user.name]);

  // ── Sign out modal ─────────────────────────────────────────────────────────
  const [signOutModal, setSignOutModal] = useState<SignOutModalState>({
    visible: false,
  });

  const handleSignOutPress = useCallback(() => {
    setSignOutModal({
      visible: true,
      onConfirm: () => {
        setSignOutModal({ visible: false });
        // TODO: replace with await supabase.auth.signOut();
        router.replace('/login');
      },
    });
  }, [router]);

  // ─────────────────────────────────────────────────────────────────────────

  const getInitials = (fullName: string) =>
    fullName
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

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
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: theme.surfaceLight,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            {user.avatar ? (
              <Image source={user.avatar} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: theme.accent }]}>
                <Text style={styles.avatarInitials}>{getInitials(user.name)}</Text>
              </View>
            )}

            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
              <Text style={[styles.userHandle, { color: theme.accent }]}>{user.username}</Text>
              <Text style={[styles.userEmail, { color: theme.textMuted }]}>{user.email}</Text>
            </View>
          </View>
        </FadeIn>

        {/* ── Your Roamie QR card ── */}
        <FadeIn delay={100}>
          <Pressable
            style={[
              styles.qrCard,
              {
                backgroundColor: theme.surfaceLight,
                borderColor: theme.borderSubtle,
              },
            ]}
            onPress={openQr}
            accessibilityLabel="Show your Roamie QR code"
            accessibilityRole="button"
          >
            <View style={styles.qrInfo}>
              <View style={[styles.qrIconContainer, { backgroundColor: theme.surfaceSubtle }]}>
                <Ionicons name="qr-code-outline" size={24} color={theme.accent} />
              </View>
              <View>
                <Text style={[styles.qrTitle, { color: theme.text }]}>Your Roamie QR</Text>
                <Text style={[styles.qrSubtitle, { color: theme.textMuted }]}>
                  Tap to show card · others scan to invite you
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </Pressable>
        </FadeIn>

        {/* ── Preferences & Settings ── */}
        <FadeIn delay={140}>
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>
              Preferences &amp; Settings
            </Text>

            <View
              style={[
                styles.menuGroup,
                {
                  backgroundColor: theme.surfaceLight,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              {/* Account Details — nav row */}
              <NavRow
                icon="person-circle-outline"
                title="Account Details"
                subtitle="Manage personal info and security"
                onPress={() => {
                  // TODO: navigate to Edit Profile screen when built
                  // router.push('/profile/edit');
                }}
                theme={theme}
              />

              <View style={[styles.separator, { backgroundColor: theme.borderSubtle }]} />

              {/* Dark Mode — toggle */}
              <ToggleRow
                icon={isDarkMode ? 'moon' : 'moon-outline'}
                title="Dark Mode"
                subtitle="Override the system appearance"
                value={isDarkMode}
                onValueChange={handleDarkModeToggle}
                theme={theme}
              />

              <View style={[styles.separator, { backgroundColor: theme.borderSubtle }]} />

              {/* Notifications — toggle */}
              <ToggleRow
                icon={notificationsEnabled ? 'notifications' : 'notifications-outline'}
                title="Notifications"
                subtitle="Trip invites and group reminders"
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                theme={theme}
              />
            </View>
          </View>
        </FadeIn>

        {/* ── Sign Out ── */}
        <FadeIn delay={180}>
          <View style={styles.signOutSection}>
            <Pressable
              style={[
                styles.signOutButton,
                {
                  backgroundColor: theme.surfaceLight,
                  borderColor: theme.borderSubtle,
                },
              ]}
              onPress={handleSignOutPress}
              accessibilityLabel="Sign out"
              accessibilityRole="button"
            >
              <Ionicons name="log-out-outline" size={20} color="#FF5A5F" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          </View>
        </FadeIn>
      </ScrollView>

      {/* ══════════════════════════════════════════════════════════════════════
          QR Bottom Sheet
      ══════════════════════════════════════════════════════════════════════ */}
      <BottomSheet
        isPresented={qrVisible}
        onDismiss={closeQr}
        containerColor={theme.surfaceLight}
        // Android's Material 3 sheet has no content-sized mode: without a snap
        // point it opens half-height and leaves the Share button below the fold.
        // 'full' is the only value that skips partial expansion. iOS sizes to
        // content when snapPoints is omitted, which is the nicer look there.
        snapPoints={Platform.OS === 'android' ? ['full'] : undefined}
        contentPadding={{ top: 12, bottom: 16, left: 24, right: 24 }}
      >
        {/* Native sheet, RN content: RNHostView measures the RN subtree and
            reports its height to SwiftUI/Compose. It lays out only its first
            child, so everything lives in one View. */}
        <RNHostView matchContents={{ vertical: true }}>
          <View
            style={[styles.qrSheetContent, Platform.OS === 'android' && styles.qrSheetContentFill]}
          >
            <Text style={[styles.sheetTitle, { color: theme.text }]}>Your Roamie QR</Text>
            <Text style={[styles.sheetSubtitle, { color: theme.textMuted }]}>
              A Roamie in your group scans this to invite you to their trip. You can also share your profile link.
            </Text>

            {/* QR code */}
            <View
              style={[
                styles.qrContainer,
                { backgroundColor: '#FFFFFF', borderColor: theme.borderSubtle, borderWidth: 2 },
              ]}
            >
              <QRCode
                value={qrValue}
                size={200}
                color="#161B29"
                backgroundColor="#FFFFFF"
                quietZone={12}
              />
            </View>

            {/* User info below QR */}
            <Text style={[styles.sheetUserName, { color: theme.text }]}>{user.name}</Text>
            <Text style={[styles.sheetUserHandle, { color: theme.accentText }]}>
              {user.username}
            </Text>

            {/* Action button */}
            <Pressable
              style={[styles.shareButton, { backgroundColor: theme.accent }]}
              onPress={handleShareProfile}
              accessibilityLabel="Share your Roamies profile"
              accessibilityRole="button"
            >
              <Ionicons name="share-outline" size={18} color={onPhoto.ink} />
              <Text style={styles.shareButtonText}>Share Profile</Text>
            </Pressable>
          </View>
        </RNHostView>
      </BottomSheet>

      {/* ══════════════════════════════════════════════════════════════════════
          Sign Out Confirmation Modal
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={signOutModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setSignOutModal({ visible: false })}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.surfaceLight,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>Sign Out</Text>
            <Text style={[styles.modalMessage, { color: theme.textMuted }]}>
              Are you sure you want to sign out of your account?
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.borderSubtle }]}
                onPress={() => setSignOutModal({ visible: false })}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, { backgroundColor: '#FF5A5F' }]}
                onPress={signOutModal.onConfirm}
              >
                <Text style={styles.confirmButtonText}>Sign Out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NavRowProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}

/** Tappable row that navigates somewhere (Account Details etc.). */
function NavRow({ icon, title, subtitle, onPress, theme }: NavRowProps) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress} accessibilityRole="button">
      <View style={[styles.menuIconContainer, { backgroundColor: theme.surfaceSubtle }]}>
        <Ionicons name={icon as any} size={20} color={theme.accent} />
      </View>
      <View style={styles.menuTextContent}>
        <Text style={[styles.menuTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.menuSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
    </Pressable>
  );
}

interface ToggleRowProps {
  icon: string;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  theme: ReturnType<typeof useTheme>;
}

/** Row with an inline Switch toggle (Dark Mode, Notifications). */
function ToggleRow({ icon, title, subtitle, value, onValueChange, theme }: ToggleRowProps) {
  return (
    <View style={styles.menuItem} accessibilityRole="none">
      <View style={[styles.menuIconContainer, { backgroundColor: theme.surfaceSubtle }]}>
        <Ionicons name={icon as any} size={20} color={theme.accent} />
      </View>
      <View style={styles.menuTextContent}>
        <Text style={[styles.menuTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.menuSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.borderSubtle, true: theme.accent }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={theme.borderSubtle}
        accessibilityLabel={title}
        accessibilityRole="switch"
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  // ── Header ──
  headerTitleContainer: {
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  // ── Profile card ──
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  userHandle: {
    fontSize: 14,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  // ── QR row card ──
  qrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  qrInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  qrIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  qrSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  // ── Settings section ──
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
  },
  menuGroup: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  separator: {
    height: 1,
    marginLeft: 68,
  },
  // ── Sign out ──
  signOutSection: {
    marginTop: 4,
    marginBottom: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  signOutText: {
    color: '#FF5A5F',
    fontSize: 16,
    fontWeight: '600',
  },
  // ── QR Bottom Sheet ──
  qrSheetContent: {
    alignItems: 'center',
  },
  /** Android's sheet is always full height, so centre the block instead of
   *  leaving it pinned under the drag handle. */
  qrSheetContentFill: {
    flex: 1,
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 16,
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  qrContainer: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  sheetUserName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  sheetUserHandle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 24,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 14,
    marginBottom: 20,
  },
  shareButtonText: {
    color: onPhoto.ink,
    fontSize: 15,
    fontWeight: '600',
  },
  // ── Sign Out Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
