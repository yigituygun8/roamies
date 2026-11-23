import { StyleSheet, View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, onPhoto } from '@/lib/theme';

interface AvatarPickerProps {
  avatarUrl: string | null;
  name: string;
  onImagePicked: (localUri: string) => void;
  onRemoveAvatar?: () => void;
  isUploading?: boolean;
}

export function AvatarPicker({
  avatarUrl,
  name,
  onImagePicked,
  onRemoveAvatar,
  isUploading = false,
}: AvatarPickerProps) {
  const theme = useTheme();

  const getInitials = (fullName: string) =>
    fullName
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'R';

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Needed',
          'We need access to your photo library so you can pick a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        onImagePicked(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Could not open image picker.');
    }
  };

  const handlePress = () => {
    if (avatarUrl && onRemoveAvatar) {
      Alert.alert('Profile Photo', 'Choose an action', [
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Remove Photo', onPress: onRemoveAvatar, style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      pickImage();
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handlePress}
        disabled={isUploading}
        style={styles.avatarButton}
        accessibilityRole="button"
        accessibilityLabel="Change profile picture"
      >
        <View
          style={[
            styles.avatarWrap,
            {
              backgroundColor: theme.surfaceLight,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.fallback, { backgroundColor: theme.accent }]}>
              <Text style={styles.initials}>{getInitials(name)}</Text>
            </View>
          )}

          {isUploading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="#FFFFFF" size="small" />
            </View>
          )}

          <View style={[styles.badge, { backgroundColor: theme.accent }]}>
            <Ionicons name="camera" size={16} color={onPhoto.ink} />
          </View>
        </View>
      </Pressable>
      <Pressable onPress={handlePress} disabled={isUploading}>
        <Text style={[styles.actionText, { color: theme.accentText }]}>
          {isUploading ? 'Uploading...' : 'Change Photo'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 18,
    gap: 8,
  },
  avatarButton: {
    position: 'relative',
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  fallback: {
    width: 92,
    height: 92,
    borderRadius: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0B1220',
    letterSpacing: 1,
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
