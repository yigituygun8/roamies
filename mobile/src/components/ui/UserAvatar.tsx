import { StyleSheet, Text, View, type StyleProp, type ViewStyle, type ImageStyle } from 'react-native';
import { Image, type ImageProps } from 'expo-image';
import { useTheme } from '@/lib/theme';

export interface UserAvatarProps {
  source?: ImageProps['source'] | string | null;
  name?: string;
  size?: number;
  style?: StyleProp<ViewStyle | ImageStyle>;
}

export function getInitials(fullName: string): string {
  if (!fullName) return 'R';
  return fullName
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'R';
}

/**
 * Standardized user avatar component. Renders the user's avatar image if available,
 * or falls back to an initials badge with the theme's accent color.
 */
export function UserAvatar({
  source,
  name = '',
  size = 64,
  style,
}: UserAvatarProps) {
  const theme = useTheme();
  const borderRadius = Math.round(size / 2);
  const fontSize = Math.round(size * 0.35);

  const imageSource = typeof source === 'string' ? { uri: source } : source;

  if (imageSource) {
    return (
      <Image
        source={imageSource}
        style={[{ width: size, height: size, borderRadius }, style as StyleProp<ImageStyle>]}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: theme.accent,
        },
        style as StyleProp<ViewStyle>,
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
