import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/lib/theme';

type Props = {
  emoji: string;
  title: string;
  description: string;
  width: number;
};

/**
 * A single onboarding slide: a large emoji placeholder, a bold title, and a
 * short description. Width is passed in from the parent so the slide fills
 * exactly one page of the horizontal FlatList.
 */
export function OnboardingSlide({ emoji, title, description, width }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.slide, { width }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.text }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 20,
  },
  emoji: {
    fontSize: 80,
    lineHeight: 96,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
});
