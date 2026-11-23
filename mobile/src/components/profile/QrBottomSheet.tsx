import { useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, Platform, Share } from 'react-native';
import { BottomSheet, RNHostView } from '@expo/ui';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, onPhoto } from '@/lib/theme';

export interface QrBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  name: string;
  username: string;
}

/**
 * Bottom sheet displaying the user's Roamie invite QR code and profile link sharing.
 */
export function QrBottomSheet({
  visible,
  onClose,
  userId,
  name,
  username,
}: QrBottomSheetProps) {
  const theme = useTheme();
  const qrValue = `roamies://user/${userId}`;

  const handleShareProfile = useCallback(async () => {
    try {
      await Share.share({
        message: `Join me on Roamies! ${qrValue}`,
        title: `${name} on Roamies`,
      });
    } catch {
      // User dismissed share sheet
    }
  }, [qrValue, name]);

  return (
    <BottomSheet
      isPresented={visible}
      onDismiss={onClose}
      containerColor={theme.surfaceLight}
      // Android's Material 3 sheet has no content-sized mode: without snap points
      // it opens half-height. 'full' expands it cleanly.
      snapPoints={Platform.OS === 'android' ? ['full'] : undefined}
      contentPadding={{ top: 12, bottom: 16, left: 24, right: 24 }}
    >
      <RNHostView matchContents={{ vertical: true }}>
        <View
          style={[
            styles.qrSheetContent,
            Platform.OS === 'android' && styles.qrSheetContentFill,
          ]}
        >
          <Text style={[styles.sheetTitle, { color: theme.text }]}>Your Roamie QR</Text>
          <Text style={[styles.sheetSubtitle, { color: theme.textMuted }]}>
            A Roamie in your group scans this to invite you to their trip. You can also share your profile link.
          </Text>

          {/* QR code */}
          <View
            style={[
              styles.qrContainer,
              { backgroundColor: '#FFFFFF', borderColor: theme.borderSubtle, borderWidth: 2 },
            ]}
          >
            <QRCode
              value={qrValue}
              size={200}
              color="#161B29"
              backgroundColor="#FFFFFF"
              quietZone={12}
            />
          </View>

          {/* User info below QR */}
          <Text style={[styles.sheetUserName, { color: theme.text }]}>{name}</Text>
          <Text style={[styles.sheetUserHandle, { color: theme.accentText }]}>
            {username}
          </Text>

          {/* Action button */}
          <Pressable
            style={[styles.shareButton, { backgroundColor: theme.accent }]}
            onPress={handleShareProfile}
            accessibilityLabel="Share your Roamies profile"
            accessibilityRole="button"
          >
            <Ionicons name="share-outline" size={18} color={onPhoto.ink} />
            <Text style={styles.shareButtonText}>Share Profile</Text>
          </Pressable>
        </View>
      </RNHostView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  qrSheetContent: {
    alignItems: 'center',
  },
  qrSheetContentFill: {
    flex: 1,
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 16,
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  qrContainer: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  sheetUserName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  sheetUserHandle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 24,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 14,
    marginBottom: 20,
  },
  shareButtonText: {
    color: onPhoto.ink,
    fontSize: 15,
    fontWeight: '600',
  },
});
