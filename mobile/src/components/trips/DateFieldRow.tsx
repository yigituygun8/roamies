import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useTheme } from '@/lib/theme';

export interface DateFieldRowProps {
  label: string;
  value: Date;
  disabled: boolean;
  showPicker: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  onOpenPicker: () => void;
  onSelectDate: (date: Date) => void;
  onClosePicker: () => void;
}

/**
 * Reusable date selector row for Start Date and End Date.
 */
export function DateFieldRow({
  label,
  value,
  disabled,
  showPicker,
  minimumDate,
  maximumDate,
  onOpenPicker,
  onSelectDate,
  onClosePicker,
}: DateFieldRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.dateLabel, { color: theme.text }]}>{label}</Text>

      <Pressable
        disabled={disabled}
        onPress={onOpenPicker}
        accessibilityRole="button"
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
            {disabled ? 'Dates undecided' : value.toLocaleDateString()}
          </Text>
        </View>

        {!disabled && (
          <Ionicons name="chevron-down" size={16} color={theme.textMuted} />
        )}
      </Pressable>

      {showPicker && !disabled && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'compact' : 'default'}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onValueChange={(_event, selectedDate) => {
            onClosePicker();
            if (selectedDate) {
              onSelectDate(selectedDate);
            }
          }}
        />
      )}
    </View>
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
});