import { StyleSheet, Text, View } from 'react-native';
import { type ImageProps } from 'expo-image';
import { useTheme } from '@/lib/theme';
import { UserAvatar } from '@/components/ui/UserAvatar';

export interface ProfileHeaderCardProps {
  name: string;
  username: string;
  email: string;
  avatar?: ImageProps['source'] | string | null;
}

/**
 * Top summary card showing the user's avatar, display name, handle, and email address.
 */
export function ProfileHeaderCard({
  name,
  username,
  email,
  avatar,
}: ProfileHeaderCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.profileCard,
        {
          backgroundColor: theme.surfaceLight,
          borderColor: theme.borderSubtle,
        },
      ]}
    >
      <UserAvatar source={avatar} name={name} size={64} />

      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: theme.text }]}>{name}</Text>
        <Text style={[styles.userHandle, { color: theme.accent }]}>{username}</Text>
        <Text style={[styles.userEmail, { color: theme.textMuted }]}>{email}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    gap: 16,
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
});
