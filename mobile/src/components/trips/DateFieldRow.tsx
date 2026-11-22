import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DateTimePicker } from '@expo/ui/community/datetime-picker';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useTheme } from '@/lib/theme';

export interface DateFieldRowProps {
  label: string;
  value: Date;
  disabled: boolean;
  showPicker: boolean;
  onOpenPicker: () => void;
  onSelectDate: (date: Date) => void;
  onClosePicker: () => void;
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Reusable date selector row for Start Date and End Date.
 *
 * The trigger card is ours; the picker surface is native. iOS shows the SwiftUI
 * graphical calendar inside an app-styled modal with a Done button, Android opens
 * the Material 3 dialog straight from the row.
 */
export function DateFieldRow({
  label,
  value,
  disabled,
  showPicker,
  onOpenPicker,
  onSelectDate,
  onClosePicker,
}: DateFieldRowProps) {
  const theme = useTheme();

  const handleIosConfirm = (date: Date) => {
    onClosePicker();
    if (date.getTime() !== value.getTime()) {
      onSelectDate(date);
    }
  };

  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.dateLabel, { color: theme.text }]}>{label}</Text>

      <Pressable
        disabled={disabled}
        onPress={onOpenPicker}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${disabled ? 'dates undecided' : formatDate(value)}`}
        style={[
          styles.dateButton,
          {
            backgroundColor: theme.surfaceLight ?? '#161B29',
            borderColor: theme.borderSubtle,
          },
        ]}
      >
        <View style={styles.dateButtonLeft}>
          <View
            style={[
              styles.iconBadge,
              {
                backgroundColor: disabled
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(255, 255, 255, 0.08)',
              },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={disabled ? theme.textMuted : theme.accent}
            />
          </View>
          <Text
            style={[
              styles.dateButtonText,
              { color: disabled ? theme.textMuted : theme.text },
            ]}
          >
            {disabled ? 'Dates undecided' : formatDate(value)}
          </Text>
        </View>

        {!disabled && (
          <Ionicons name="chevron-down" size={16} color={theme.textMuted} />
        )}
      </Pressable>

      {showPicker && !disabled && Platform.OS === 'ios' && (
        <IosDateModal label={label} value={value} onCancel={onClosePicker} onConfirm={handleIosConfirm} />
      )}

      {showPicker && !disabled && Platform.OS === 'android' && (
        <DateTimePicker
          value={value}
          mode="date"
          presentation="dialog"
          accentColor={theme.accent}
          positiveButton={{ label: 'Set date' }}
          negativeButton={{ label: 'Cancel' }}
          onValueChange={(_event, date) => {
            onClosePicker();
            onSelectDate(date);
          }}
          onDismiss={onClosePicker}
        />
      )}
    </View>
  );
}

interface IosDateModalProps {
  label: string;
  value: Date;
  onCancel: () => void;
  onConfirm: (date: Date) => void;
}

/**
 * iOS calendar modal. It mounts only while the row is open, so the draft always
 * starts from the committed value and backing out keeps it unchanged.
 */
function IosDateModal({ label, value, onCancel, onConfirm }: IosDateModalProps) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const [draft, setDraft] = useState(value);

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.backdrop}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Close date picker"
        />

        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, borderColor: theme.borderSubtle },
          ]}
        >
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>{label}</Text>
            <Pressable
              onPress={onCancel}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Ionicons name="close" size={20} color={theme.textMuted} />
            </Pressable>
          </View>

          <DateTimePicker
            value={draft}
            mode="date"
            display="inline"
            accentColor={theme.accent}
            themeVariant={scheme === 'dark' ? 'dark' : 'light'}
            onValueChange={(_event, date) => setDraft(date)}
            style={styles.iosPicker}
          />

          <PrimaryButton
            label="Done"
            onPress={() => onConfirm(draft)}
            fullWidth
            marginBottom={0}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 8,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  dateButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 15,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  iosPicker: {
    alignSelf: 'stretch',
  },
});
