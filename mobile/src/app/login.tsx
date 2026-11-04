import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/lib/theme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { AuthLayout } from '@/components/AuthLayout';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
      title="Welcome Roamie!"
      subtitle="Log in to discover new places and adventures."
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

      <PrimaryButton label="Log in" onPress={() => router.replace('/home')} />

      <View style={styles.dividerContainer}>
        <View style={[styles.line, { backgroundColor: theme.borderSubtle }]} />
        <Text style={[styles.dividerText, { color: theme.textMuted }]}>or create an account</Text>
        <View style={[styles.line, { backgroundColor: theme.borderSubtle }]} />
      </View>

      <Pressable
        style={[styles.oauthButton, { borderColor: theme.accent, borderWidth: 2 }]}
        onPress={() => router.push('/register')} // Navigate to the register screen
      >
        <Text style={[styles.oauthText, { color: theme.text }]}>Register</Text>
      </Pressable>
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
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  line: { flex: 1, height: 1 },
  dividerText: { paddingHorizontal: 16, fontSize: 14 },
  oauthButton: { height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  oauthText: { fontSize: 16, fontWeight: '600' },
});