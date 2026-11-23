import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';

export interface SignOutButtonProps {
  onPress: () => void;
}

/**
 * Destructive action button to trigger the sign out confirmation modal.
 */
export function SignOutButton({ onPress }: SignOutButtonProps) {
  const theme = useTheme();

  return (
    <View style={styles.signOutSection}>
      <Pressable
        style={[
          styles.signOutButton,
          {
            backgroundColor: theme.surfaceLight,
            borderColor: theme.borderSubtle,
          },
        ]}
        onPress={onPress}
        accessibilityLabel="Sign out"
        accessibilityRole="button"
      >
        <Ionicons name="log-out-outline" size={20} color="#FF5A5F" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  signOutSection: {
    marginTop: 4,
    marginBottom: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  signOutText: {
    color: '#FF5A5F',
    fontSize: 16,
    fontWeight: '600',
  },
});
