import { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@/lib/theme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { AuthLayout } from '@/components/AuthLayout';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.surfaceLight,
      color: theme.text,
      borderColor: theme.borderSubtle,
    },
  ];

  return (
    <AuthLayout
      title="Join Roamies"
      subtitle="Create an account to start planning your next group adventure."
      showBackButton={true} // Enable the back arrow here
    >
      <TextInput
        style={inputStyle}
        placeholder="roamie@email.com"
        placeholderTextColor={theme.textMuted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={inputStyle}
        placeholder="Password"
        placeholderTextColor={theme.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={inputStyle}
        placeholder="Confirm Password"
        placeholderTextColor={theme.textMuted}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {/* Primary action for registration */}
      <PrimaryButton label="Create Account" onPress={() => router.replace('/home')} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 4,
  },
});