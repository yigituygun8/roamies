import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';

export interface QrCardProps {
  onPress: () => void;
}

/**
 * Tappable card on the Profile tab that triggers the Roamie QR identity card.
 */
export function QrCard({ onPress }: QrCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      style={[
        styles.qrCard,
        {
          backgroundColor: theme.surfaceLight,
          borderColor: theme.borderSubtle,
        },
      ]}
      onPress={onPress}
      accessibilityLabel="Show your Roamie QR code"
      accessibilityRole="button"
    >
      <View style={styles.qrInfo}>
        <View style={[styles.qrIconContainer, { backgroundColor: theme.surfaceSubtle }]}>
          <Ionicons name="qr-code-outline" size={24} color={theme.accent} />
        </View>
        <View>
          <Text style={[styles.qrTitle, { color: theme.text }]}>Your Roamie QR</Text>
          <Text style={[styles.qrSubtitle, { color: theme.textMuted }]}>
            Tap to show card · others scan to invite you
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  qrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  qrInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  qrIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  qrSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
