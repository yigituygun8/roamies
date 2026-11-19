import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextField } from '@/components/ui/TextField';
import { useTheme } from '@/lib/theme';

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Empty-field checks only for now. Real validation lands with the Supabase
  // sign-up call; until then the button still bypasses straight to home.
  const validateEmail = () => {
    setErrors((previous) => ({
      ...previous,
      email: email.trim() ? undefined : 'Enter your email address.',
    }));
  };

  const validatePassword = () => {
    setErrors((previous) => ({
      ...previous,
      password: password ? undefined : 'Choose a password.',
    }));
  };

  const validateConfirmPassword = () => {
    setErrors((previous) => ({
      ...previous,
      confirmPassword: confirmPassword ? undefined : 'Re-enter your password.',
    }));
  };

  return (
    <AuthLayout
      title="Become a Roamie."
      subtitle="Create an account and start planning your next adventure with Roamies."
      showBackButton
    >
      <TextField
        label="Email"
        placeholder="roamie@email.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (text.trim()) setErrors((previous) => ({ ...previous, email: undefined }));
        }}
        onBlur={validateEmail}
        error={errors.email}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <TextField
        label="Password"
        placeholder="At least 8 characters"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (text) setErrors((previous) => ({ ...previous, password: undefined }));
        }}
        onBlur={validatePassword}
        error={errors.password}
        secure
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <TextField
        label="Confirm password"
        placeholder="Repeat your password"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          if (text) setErrors((previous) => ({ ...previous, confirmPassword: undefined }));
        }}
        onBlur={validateConfirmPassword}
        error={errors.confirmPassword}
        secure
        autoComplete="new-password"
        textContentType="newPassword"
      />

      <View style={styles.actions}>
        <PrimaryButton
          label="Create account"
          fullWidth
          marginBottom={12}
          onPress={() => router.replace('/home')}
        />

        <OAuthButtons variant="outline" />
      </View>

      <Pressable
        onPress={() => router.replace("/login")}
        style={styles.footer}
        accessibilityRole="button"
        accessibilityLabel="Go to login"
      >
        <Text style={[styles.footerText, { color: theme.textMuted }]}>
          Already have an account? <Text style={{ color: theme.accentText, fontWeight: '700' }}>Log in</Text>
        </Text>
      </Pressable>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 14,
  },
});
