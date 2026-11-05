import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { useTheme } from '@/lib/theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Renders as a password field and adds a show/hide toggle. */
  secure?: boolean;
  /** Inline validation message; also turns the border red. */
  error?: string | null;
  onBlur?: () => void; // Called when the field loses focus
} & Pick<
  TextInputProps,
  | 'keyboardType'
  | 'autoCapitalize'
  | 'autoComplete'
  | 'textContentType'
  | 'returnKeyType'
  | 'onSubmitEditing'
  | 'editable'
>;

/**
 * Labelled text field used by the login and register forms.
 *
 * The label sits above the input (visible even while typing), the border picks
 * up the brand accent on focus, and secure fields get an eye toggle so users
 * can check what they typed.
 */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secure = false,
  error,
  onBlur,
  ...inputProps
}: Props) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <View>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>

      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: theme.surfaceLight,
            borderColor: error
              ? theme.danger
              : focused
                ? theme.accent
                : theme.borderSubtle,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          secureTextEntry={secure && !revealed}
          selectionColor={theme.accent}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          accessibilityLabel={label}
          {...inputProps}
        />

        {secure && (
          <Pressable
            onPress={() => setRevealed((previous) => !previous)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            style={styles.eye}
          >
            <Ionicons
              name={revealed ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={theme.textMuted}
            />
          </Pressable>
        )}
      </View>

      {error && (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={[styles.error, { color: theme.danger }]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  inputWrap: {
    height: 54,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  eye: {
    paddingLeft: 10,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
  },
});
