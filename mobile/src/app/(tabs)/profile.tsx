import { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable, useColorScheme, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageProps } from 'expo-image';

import { FadeIn } from '@/components/ui/FadeIn';
import { useTabBarSpace } from '@/components/navigation/TabBar';
import { useTheme } from '@/lib/theme';

interface UserProfile {
  name: string;
  username: string;
  email: string;
  avatar: ImageProps['source'] | null;
}

interface CustomModalState {
  visible: boolean;
  title: string;
  message: string;
  isConfirm?: boolean;
  onConfirm?: () => void;
}

/**
 * Profile tab — displays user account info, associated QR code,
 * preferences, and sign out options using themed custom modals.
 */
export default function ProfileScreen() {
  const theme = useTheme();
  const scheme = useColorScheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();

  // User profile state
  const [user] = useState<UserProfile>({
    name: 'Julia Yu',
    username: '@juliayu',
    email: 'julia.yu@roamies.app',
    avatar: null,
  });

  // Custom themed modal state
  const [modalConfig, setModalConfig] = useState<CustomModalState>({
    visible: false,
    title: '',
    message: '',
    isConfirm: false,
  });

  // Helper function to generate initials from name (e.g., "Julia Yu" -> "JY")
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOutPress = () => {
    setModalConfig({
      visible: true,
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of your account?',
      isConfirm: true,
      onConfirm: () => {
        setModalConfig((prev) => ({ ...prev, visible: false }));
        // TODO: Replace with await supabase.auth.signOut();
        router.replace('/login');
      },
    });
  };

  const showInfoModal = (title: string, message: string) => {
    setModalConfig({
      visible: true,
      title,
      message,
      isConfirm: false,
    });
  };

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
        {/* Screen Title */}
        <FadeIn>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.screenTitle, { color: theme.text }]}>Profile</Text>
          </View>
        </FadeIn>

        {/* User Info Card with Initials Fallback Circle */}
        <FadeIn delay={60}>
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: theme.surfaceLight ?? '#161B29',
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

        {/* QR Code Associated Card */}
        <FadeIn delay={100}>
          <Pressable
            style={[
              styles.qrCard,
              {
                backgroundColor: theme.surfaceLight ?? '#161B29',
                borderColor: theme.borderSubtle,
              },
            ]}
            onPress={() => showInfoModal('Your Roamie QR', 'Your personal QR code for quick trip sharing and adding friends.')}
          >
            <View style={styles.qrInfo}>
              <View style={[styles.qrIconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
                <Ionicons name="qr-code-outline" size={24} color={theme.accent} />
              </View>
              <View>
                <Text style={[styles.qrTitle, { color: theme.text }]}>Your Roamie QR</Text>
                <Text style={[styles.qrSubtitle, { color: theme.textMuted }]}>Tap to show card and share profile</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </Pressable>
        </FadeIn>

        {/* Settings & Preferences Section */}
        <FadeIn delay={140}>
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>Preferences & Settings</Text>
            
            <View
              style={[
                styles.menuGroup,
                {
                  backgroundColor: theme.surfaceLight ?? '#161B29',
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <MenuItem
                icon="person-circle-outline"
                title="Account Details"
                subtitle="Manage personal info and security"
                onPress={() => showInfoModal('Account Details', 'Account management options coming soon.')}
                theme={theme}
              />
              <View style={[styles.separator, { backgroundColor: theme.borderSubtle }]} />
              <MenuItem
                icon="accessibility-outline"
                title="Accessibility Settings"
                subtitle="High contrast, text scaling & haptics"
                onPress={() => showInfoModal('Accessibility Settings', 'Accessibility options coming soon.')}
                theme={theme}
              />
              <View style={[styles.separator, { backgroundColor: theme.borderSubtle }]} />
              <MenuItem
                icon="notifications-outline"
                title="Notifications"
                subtitle="Trip invites and group reminders"
                onPress={() => showInfoModal('Notifications', 'Notification settings coming soon.')}
                theme={theme}
              />
            </View>
          </View>
        </FadeIn>

        {/* Sign Out Section */}
        <FadeIn delay={180}>
          <View style={styles.signOutSection}>
            <Pressable
              style={[
                styles.signOutButton,
                {
                  backgroundColor: theme.surfaceLight ?? '#161B29',
                  borderColor: theme.borderSubtle,
                },
              ]}
              onPress={handleSignOutPress}
            >
              <Ionicons name="log-out-outline" size={20} color="#FF5A5F" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          </View>
        </FadeIn>
      </ScrollView>

      {/* Themed Custom Modal Popup */}
      <Modal
        visible={modalConfig.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalConfig((prev) => ({ ...prev, visible: false }))}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.surfaceLight ?? '#161B29',
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>{modalConfig.title}</Text>
            <Text style={[styles.modalMessage, { color: theme.textMuted }]}>{modalConfig.message}</Text>

            <View style={styles.modalActions}>
              {modalConfig.isConfirm && (
                <Pressable
                  style={[styles.modalButton, styles.cancelButton, { borderColor: theme.borderSubtle }]}
                  onPress={() => setModalConfig((prev) => ({ ...prev, visible: false }))}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
                </Pressable>
              )}

              <Pressable
                style={[styles.modalButton, { backgroundColor: theme.accent }]}
                onPress={modalConfig.onConfirm || (() => setModalConfig((prev) => ({ ...prev, visible: false })))}
              >
                <Text style={styles.confirmButtonText}>
                  {modalConfig.isConfirm ? 'Sign Out' : 'Got it'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/**
 * Reusable menu item row component for settings
 */
function MenuItem({ icon, title, subtitle, onPress, theme }: any) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
        <Ionicons name={icon} size={20} color={theme.accent} />
      </View>
      <View style={styles.menuTextContent}>
        <Text style={[styles.menuTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.menuSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
    </Pressable>
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
  // Custom Modal Styles matching the app's aesthetic
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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