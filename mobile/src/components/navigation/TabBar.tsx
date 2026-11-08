import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { onPhoto, useTheme } from '@/lib/theme';

/** Height of the floating pill itself, without the gap to the screen edge. */
export const TAB_BAR_HEIGHT = 64;
/** Distance between the pill and the bottom safe area (or screen edge). */
const TAB_BAR_GAP = 12;
/** Breathing room between the pill and the last piece of scrollable content. */
const CONTENT_GAP = 24;

/**
 * Vertical space the floating tab bar occupies at the bottom of a screen.
 *
 * The bar is rendered by headless tabs with `position: absolute`, so the
 * navigator does not inset screen content for it. Every tab screen adds this
 * as `paddingBottom` on its scroll container.
 */
export function useTabBarSpace() {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + TAB_BAR_GAP + insets.bottom + CONTENT_GAP;
}

/**
 * The floating pill that holds the five slots.
 *
 * Used as the `asChild` target of `TabList`, so the triggers are passed in as
 * children and laid out here. The middle slot (`+`) is a plain button, not a
 * trigger, so it never renders as the selected tab.
 */
export function TabBar({ children, style, ...rest }: ViewProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      {...rest}
      accessibilityRole="tablist"
      style={[
        style,
        styles.container,
        {
          bottom: TAB_BAR_GAP + insets.bottom,
          backgroundColor: theme.surface,
          borderColor: theme.borderSubtle,
          shadowOpacity: theme.background === '#080C22' ? 0.35 : 0.1,
        },
      ]}
    >
      {children}
    </View>
  );
}

type TabButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  /** Filled icon name; the outline variant is derived for the inactive state. */
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  /** Injected by `TabTrigger` when the trigger is rendered with `asChild`. */
  isFocused?: boolean;
  /** Injected by `TabTrigger` for navigation; not a valid `Pressable` prop. */
  href?: string;
};

/** One non-primary slot: icon above a small label, mint only when focused. */
export function TabButton({ icon, label, isFocused = false, href, ...rest }: TabButtonProps) {
  const theme = useTheme();
  // `accentText` instead of `accent`: mint on the light surface fails contrast
  // for small text, see the accessibility section of docs/design/home-screen.md.
  const color = isFocused ? theme.accentText : theme.textMuted;
  const name = (isFocused ? icon : `${icon}-outline`) as ComponentProps<typeof Ionicons>['name'];

  return (
    <Pressable
      {...rest}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      style={styles.tabButton}
    >
      <Ionicons name={name} size={22} color={color} />
      <Text numberOfLines={1} style={[styles.tabLabel, { color }]}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * The mint `+` in the centre. It opens the create-trip flow instead of
 * switching tabs, which is why it is a plain button and not a `TabTrigger`.
 */
export function TabCreateAction() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/trips/new')}
      accessibilityRole="button"
      accessibilityLabel="Plan a new trip"
      style={({ pressed }) => [
        styles.createButton,
        {
          backgroundColor: theme.accent,
          // Dark ink on mint; mint is a fill, never small text on a light surface.
          shadowColor: theme.accent,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      <Ionicons name="add" size={28} color={onPhoto.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderRadius: TAB_BAR_HEIGHT / 2,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    height: TAB_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  createButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
