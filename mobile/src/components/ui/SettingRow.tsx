import React from 'react';
import { StyleSheet, Text, View, Pressable, Switch, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';

export interface SettingGroupProps {
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Grouped container for settings and menu rows with rounded corners, border, and separators.
 */
export function SettingGroup({ title, children, style }: SettingGroupProps) {
  const theme = useTheme();
  const childArray = React.Children.toArray(children).filter(Boolean);

  return (
    <View style={[styles.section, style]}>
      {title && (
        <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>
          {title}
        </Text>
      )}
      <View
        style={[
          styles.menuGroup,
          {
            backgroundColor: theme.surfaceLight,
            borderColor: theme.borderSubtle,
          },
        ]}
      >
        {childArray.map((child, index) => (
          <React.Fragment key={index}>
            {child}
            {index < childArray.length - 1 && (
              <View
                style={[styles.separator, { backgroundColor: theme.borderSubtle }]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

export interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  accessibilityLabel?: string;
}

/**
 * Tappable navigation row inside a settings group.
 */
export function SettingRow({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  accessibilityLabel,
}: SettingRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      style={styles.menuItem}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
    >
      <View
        style={[
          styles.menuIconContainer,
          { backgroundColor: theme.surfaceSubtle },
        ]}
      >
        <Ionicons name={icon} size={20} color={theme.accent} />
      </View>
      <View style={styles.menuTextContent}>
        <Text style={[styles.menuTitle, { color: theme.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.menuSubtitle, { color: theme.textMuted }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement ?? (
        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
      )}
    </Pressable>
  );
}

export interface SettingToggleProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}

/**
 * Switch toggle row inside a settings group.
 */
export function SettingToggle({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  disabled = false,
}: SettingToggleProps) {
  const theme = useTheme();

  return (
    <View style={styles.menuItem} accessibilityRole="none">
      <View
        style={[
          styles.menuIconContainer,
          { backgroundColor: theme.surfaceSubtle },
        ]}
      >
        <Ionicons name={icon} size={20} color={theme.accent} />
      </View>
      <View style={styles.menuTextContent}>
        <Text style={[styles.menuTitle, { color: theme.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.menuSubtitle, { color: theme.textMuted }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: theme.borderSubtle, true: theme.accent }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={theme.borderSubtle}
        accessibilityLabel={title}
        accessibilityRole="switch"
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
});
