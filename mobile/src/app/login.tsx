import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextField } from '@/components/ui/TextField';


export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Empty-field checks only for now. Real validation lands with the Supabase
  // sign-in call; until then the button still bypasses straight to home.
  const validateEmail = () => {
    setErrors((previous) => ({
      ...previous,
      email: email.trim() ? undefined : 'Enter your email address.',
    }));
  };

  const validatePassword = () => {
    setErrors((previous) => ({
      ...previous,
      password: password ? undefined : 'Enter your password.',
    }));
  };

  return (
    <AuthLayout
      title="Welcome back, Roamie."
      subtitle="Log in to continue planning with your group."
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
        placeholder="Your password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (text) setErrors((previous) => ({ ...previous, password: undefined }));
        }}
        onBlur={validatePassword}
        error={errors.password}
        secure
        autoComplete="current-password"
        textContentType="password"
      />

      <View style={styles.actions}>
        <PrimaryButton label="Log in" fullWidth onPress={() => router.replace('/home')} />

        <OAuthButtons variant="outline" />

        <PrimaryButton
          label="Create an account"
          icon="person-add-outline"
          variant="outline"
          fullWidth
          onPress={() => router.push('/register')}
        />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: 8,
    gap: 12,
  },
});
