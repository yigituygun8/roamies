import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { signInWithGoogle } from '@/lib/oauth';
import { onPhoto, useTheme } from '@/lib/theme';

type Props = {
  /** Buttons on a form card use `outline`, buttons on a photo use `ghost`. */
  variant?: 'outline' | 'ghost';
  /** Lets the screen render the message itself; otherwise it shows inline. */
  onError?: (message: string) => void;
};

/** Error text that stays readable on top of the dark photo scrim. */
const onPhotoDanger = '#FFB4A9';

/**
 * Third-party sign-in options, shared by welcome, login and register.
 *
 * Only Google for now. Apple Sign-In needs a paid Apple Developer account
 * (App ID capability, Services ID and a .p8 key), so it is added later, after
 * that account exists, as a second button in this component.
 */
export function OAuthButtons({ variant = 'outline', onError }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPhotoVariant = variant === 'ghost';
  const dividerColor = onPhotoVariant ? onPhoto.glassBorder : theme.borderSubtle;
  const dividerTextColor = onPhotoVariant ? onPhoto.textMuted : theme.textMuted;
  const errorColor = onPhotoVariant ? onPhotoDanger : theme.danger;

  async function handleGooglePress() {
    setError(null);
    setLoading(true);

    try {
      const result = await signInWithGoogle();

      if (result.status === 'success') {
        router.replace('/home');
      } else if (result.status === 'error') {
        if (onError) {
          onError(result.message);
        } else {
          setError(result.message);
        }
      }
      // `cancelled`: the user closed the sheet, so stay quiet.
    } catch {
      const message = 'Sign-in failed. Please try again.';
      if (onError) {
        onError(message);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={[styles.line, { backgroundColor: dividerColor }]} />
        <Text style={[styles.dividerText, { color: dividerTextColor }]}>or</Text>
        <View style={[styles.line, { backgroundColor: dividerColor }]} />
      </View>

      <PrimaryButton
        label="Continue with Google"
        icon="logo-google"
        variant={variant}
        fullWidth
        loading={loading}
        marginBottom={0}
        onPress={handleGooglePress}
      />

      {error && (
        <Text accessibilityRole="alert" style={[styles.error, { color: errorColor }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    marginBottom: 12,
  },
  line: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 14,
    fontSize: 13,
  },
  error: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
