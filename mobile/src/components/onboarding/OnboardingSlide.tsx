import type { ComponentProps } from 'react';
import type { ImageProps } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { PhotoHero } from '@/components/ui/PhotoHero';
import { onPhoto } from '@/lib/theme';

type Props = {
  image: ImageProps['source'];
  icon: ComponentProps<typeof Ionicons>['name'];
  eyebrow: string;
  title: string;
  description: string;
  width: number;
  /** Screen height. Horizontal FlatList items do not stretch on web/Android. */
  height: number;
  /** Space kept free at the bottom for the dots and the Continue button. */
  bottomSpace: number;
};

/**
 * One onboarding page: a full-bleed photo, a small labelled eyebrow, a large
 * headline and a short description, all sitting on the dark scrim at the
 * bottom of the photo. Width is passed in by the parent so the slide fills
 * exactly one page of the horizontal FlatList.
 */
export function OnboardingSlide({
  image,
  icon,
  eyebrow,
  title,
  description,
  width,
  height,
  bottomSpace,
}: Props) {
  return (
    <View style={{ width, height }}>
      <PhotoHero source={image}>
        <View style={[styles.content, { paddingBottom: bottomSpace }]}>
          <View style={styles.eyebrowRow}>
            <Ionicons name={icon} size={15} color={onPhoto.text} />
            <Text style={styles.eyebrow}>{eyebrow}</Text>
          </View>

          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>

          <Text style={styles.description}>{description}</Text>
        </View>
      </PhotoHero>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 26,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  eyebrow: {
    color: onPhoto.text,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.7,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  title: {
    color: onPhoto.text,
    fontSize: 42,
    lineHeight: 45,
    fontWeight: '800',
    letterSpacing: -1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 18,
  },
  description: {
    color: onPhoto.textMuted,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
    maxWidth: 320,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 12,
  },
});
