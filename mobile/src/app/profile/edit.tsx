import { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/lib/theme';
import { TextField } from '@/components/ui/TextField';
import { InlineBanner } from '@/components/ui/InlineBanner';
import { AvatarPicker } from '@/components/profile/AvatarPicker';
import { TravelStyleChips, DietaryChips } from '@/components/profile/PreferenceChips';
import { fetchProfile, saveProfile, uploadAvatarImage } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import type { UserProfile, TravelStyle, DietaryPreference } from '@/types/profile';

export default function AccountDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{ tone: 'info' | 'error'; text: string } | null>(null);

  // Profile Form State
  const [userId, setUserId] = useState<string>('demo-placeholder-id');
  const [email, setEmail] = useState<string>('julia.yu@roamies.app');
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [homeCity, setHomeCity] = useState<string>('');
  const [travelStyle, setTravelStyle] = useState<TravelStyle | null>(null);
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>(['none']);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Initial copy to detect dirty changes
  const [initialProfile, setInitialProfile] = useState<UserProfile | null>(null);

  // Form errors
  const [errors, setErrors] = useState<{ fullName?: string; username?: string }>({});

  // Password Update State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Fetch initial profile
  useEffect(() => {
    let active = true;

    async function loadData() {
      setIsLoading(true);
      try {
        let currentUserId = 'demo-placeholder-id';
        let currentEmail = 'julia.yu@roamies.app';

        try {
          const { data } = await supabase.auth.getUser();
          if (data?.user) {
            currentUserId = data.user.id;
            if (data.user.email) currentEmail = data.user.email;
          }
        } catch {
          // If auth isn't initialized, use demo values
        }

        const profile = await fetchProfile(currentUserId, currentEmail);
        if (!active) return;

        setUserId(profile.id);
        setEmail(profile.email);
        setFullName(profile.fullName);
        setUsername(profile.username);
        setBio(profile.bio);
        setHomeCity(profile.homeCity);
        setTravelStyle(profile.travelStyle);
        setDietaryPreferences(profile.dietaryPreferences.length > 0 ? profile.dietaryPreferences : ['none']);
        setAvatarPath(profile.avatarPath);
        setAvatarUrl(profile.avatarUrl);

        setInitialProfile(profile);
      } catch {
        if (active) {
          setBannerMessage({ tone: 'error', text: 'Could not load your profile details.' });
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  // Check if form is dirty
  const isDirty = useMemo(() => {
    if (!initialProfile) return false;
    return (
      fullName !== initialProfile.fullName ||
      username !== initialProfile.username ||
      bio !== initialProfile.bio ||
      homeCity !== initialProfile.homeCity ||
      travelStyle !== initialProfile.travelStyle ||
      avatarUrl !== initialProfile.avatarUrl ||
      JSON.stringify(dietaryPreferences) !== JSON.stringify(initialProfile.dietaryPreferences)
    );
  }, [
    initialProfile,
    fullName,
    username,
    bio,
    homeCity,
    travelStyle,
    avatarUrl,
    dietaryPreferences,
  ]);

  // Handle avatar picking
  const handleImagePicked = async (localUri: string) => {
    setIsUploadingAvatar(true);
    setAvatarUrl(localUri); // optimistic preview
    try {
      const uploadRes = await uploadAvatarImage(userId, localUri);
      setAvatarPath(uploadRes.avatarPath);
      setAvatarUrl(uploadRes.avatarUrl);
    } catch {
      Alert.alert('Upload notice', 'Avatar was set locally and will be synced with your profile.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPath(null);
    setAvatarUrl(null);
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: { fullName?: string; username?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    }

    const cleanUsername = username.trim().replace(/^@/, '');
    if (!cleanUsername) {
      newErrors.username = 'Please choose a username.';
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
      newErrors.username = 'Username must be 3-20 characters (letters, numbers, underscore).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save profile
  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    setBannerMessage(null);

    try {
      const updated = await saveProfile(
        userId,
        {
          fullName,
          username,
          bio,
          homeCity,
          travelStyle,
          dietaryPreferences,
          avatarPath,
        },
        avatarUrl
      );

      setInitialProfile(updated);
      setBannerMessage({ tone: 'info', text: 'Your profile has been successfully saved!' });

      setTimeout(() => {
        router.back();
      }, 700);
    } catch {
      setBannerMessage({ tone: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setBannerMessage({ tone: 'error', text: error.message || 'Could not update password.' });
      } else {
        setNewPassword('');
        setConfirmPassword('');
        setBannerMessage({ tone: 'info', text: 'Password successfully updated!' });
      }
    } catch {
      setBannerMessage({
        tone: 'error',
        text: 'Could not connect to authentication service. Try again later.',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="auto" />

      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: theme.background,
            borderBottomColor: theme.borderSubtle,
          },
        ]}
      >
        <Pressable
          onPress={handleBack}
          style={styles.headerButton}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={theme.text} />
        </Pressable>

        <Text style={[styles.headerTitle, { color: theme.text }]}>Account Details</Text>

        <Pressable
          onPress={handleSave}
          disabled={!isDirty || isSaving || isLoading}
          style={[
            styles.saveButton,
            {
              backgroundColor: isDirty && !isSaving ? theme.accent : theme.surfaceSubtle,
              opacity: isDirty ? 1 : 0.6,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Save changes"
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#0B1220" />
          ) : (
            <Text
              style={[
                styles.saveButtonText,
                { color: isDirty ? '#0B1220' : theme.textMuted },
              ]}
            >
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={[styles.loadingText, { color: theme.textMuted }]}>
              Loading account details...
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
          >
            {bannerMessage && (
              <View style={styles.bannerWrap}>
                <InlineBanner tone={bannerMessage.tone} message={bannerMessage.text} />
              </View>
            )}

            {/* ── Avatar Picker Hero ── */}
            <AvatarPicker
              avatarUrl={avatarUrl}
              name={fullName || 'Julia Yu'}
              onImagePicked={handleImagePicked}
              onRemoveAvatar={handleRemoveAvatar}
              isUploading={isUploadingAvatar}
            />

            {/* ── Personal Info Section ── */}
            <View style={styles.sectionHeaderWrap}>
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                PERSONAL INFORMATION
              </Text>
            </View>

            <View
              style={[
                styles.card,
                { backgroundColor: theme.surfaceLight, borderColor: theme.borderSubtle },
              ]}
            >
              <TextField
                label="Full Name"
                value={fullName}
                onChangeText={(val) => {
                  setFullName(val);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                placeholder="e.g. Julia Yu"
                error={errors.fullName}
              />

              <View style={styles.fieldSpacer} />

              <TextField
                label="Username"
                value={username.startsWith('@') ? username : `@${username}`}
                onChangeText={(val) => {
                  const cleaned = val.replace(/^@/, '');
                  setUsername(cleaned);
                  if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
                }}
                placeholder="@username"
                autoCapitalize="none"
                autoComplete="username"
                error={errors.username}
              />

              <View style={styles.fieldSpacer} />

              <TextField
                label="Bio & Motto"
                value={bio}
                onChangeText={setBio}
                placeholder="Share your travel philosophy or favorite spots"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* ── Travel Preferences Section ── */}
            <View style={styles.sectionHeaderWrap}>
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                TRIP &amp; TRAVEL PREFERENCES
              </Text>
            </View>

            <View
              style={[
                styles.card,
                { backgroundColor: theme.surfaceLight, borderColor: theme.borderSubtle },
              ]}
            >
              <TextField
                label="Home City"
                value={homeCity}
                onChangeText={setHomeCity}
                placeholder="e.g. Vienna, AT"
              />

              <TravelStyleChips value={travelStyle} onChange={setTravelStyle} />

              <DietaryChips values={dietaryPreferences} onChange={setDietaryPreferences} />
            </View>

            {/* ── Account & Security Section ── */}
            <View style={styles.sectionHeaderWrap}>
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                ACCOUNT &amp; CREDENTIALS
              </Text>
            </View>

            <View
              style={[
                styles.card,
                { backgroundColor: theme.surfaceLight, borderColor: theme.borderSubtle },
              ]}
            >
              <TextField
                label="Email Address"
                value={email}
                onChangeText={() => {}}
                editable={false}
              />
              <Text style={[styles.helperText, { color: theme.textMuted }]}>
                Your email is linked to your Supabase authentication account.
              </Text>

              <View style={styles.fieldSpacer} />

              <View style={styles.idRow}>
                <View style={styles.idContent}>
                  <Text style={[styles.idLabel, { color: theme.textMuted }]}>Account ID</Text>
                  <Text style={[styles.idValue, { color: theme.text }]} numberOfLines={1}>
                    {userId}
                  </Text>
                </View>
                <Ionicons name="finger-print-outline" size={22} color={theme.accent} />
              </View>
            </View>

            {/* ── Security & Change Password Section ── */}
            <View style={styles.sectionHeaderWrap}>
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                CHANGE PASSWORD
              </Text>
            </View>

            <View
              style={[
                styles.card,
                { backgroundColor: theme.surfaceLight, borderColor: theme.borderSubtle },
              ]}
            >
              <TextField
                label="New Password"
                value={newPassword}
                onChangeText={(val) => {
                  setNewPassword(val);
                  if (passwordError) setPasswordError(null);
                }}
                placeholder="At least 6 characters"
                secure
                error={passwordError}
              />

              <View style={styles.fieldSpacer} />

              <TextField
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  if (passwordError) setPasswordError(null);
                }}
                placeholder="Re-enter your new password"
                secure
              />

              <View style={styles.fieldSpacer} />

              <Pressable
                onPress={handleUpdatePassword}
                disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                style={[
                  styles.updatePasswordBtn,
                  {
                    backgroundColor:
                      newPassword && confirmPassword && !isUpdatingPassword
                        ? theme.accent
                        : theme.surfaceSubtle,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Update password"
              >
                {isUpdatingPassword ? (
                  <ActivityIndicator size="small" color="#0B1220" />
                ) : (
                  <Text
                    style={[
                      styles.updatePasswordText,
                      {
                        color:
                          newPassword && confirmPassword
                            ? '#0B1220'
                            : theme.textMuted,
                      },
                    ]}
                  >
                    Update Password
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  bannerWrap: {
    marginBottom: 16,
  },
  sectionHeaderWrap: {
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  fieldSpacer: {
    height: 16,
  },
  helperText: {
    fontSize: 11,
    marginTop: 6,
    marginLeft: 4,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  idContent: {
    flex: 1,
    paddingRight: 12,
  },
  idLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  idValue: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  updatePasswordBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  updatePasswordText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
