import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { useTheme } from '@/lib/theme';
import { DateFieldRow } from './DateFieldRow';
import { StepLayoutProps } from './StepLayout';

interface DatesStepProps {
  startDate: Date;
  endDate: Date;
  hasNoDates: boolean;
  onToggleNoDates: (value: boolean) => void;
  onChangeStartDate: (date: Date) => void;
  onChangeEndDate: (date: Date) => void;
}

/**
 * Step 4: Start and end date pickers with an optional toggle when dates aren't decided yet.
 */
export function DatesStep({
  startDate,
  endDate,
  hasNoDates,
  onToggleNoDates,
  onChangeStartDate,
  onChangeEndDate,
}: DatesStepProps) {
  const theme = useTheme();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleToggle = (nextValue: boolean) => {
    if (nextValue) {
      setShowStartPicker(false);
      setShowEndPicker(false);
    }
    onToggleNoDates(nextValue);
  };

  return (
    <StepLayoutProps
      eyebrow="Timeline"
      title="When are you going?"
      subtitle="Select your start and end dates, or decide later."
    >
      {/* Date Pickers Card (highlighted when !hasNoDates, disabled when hasNoDates) */}
      <View
        style={[
          styles.datesCard,
          {
            backgroundColor: theme.surfaceLight ?? '#161B29',
            borderColor: !hasNoDates ? theme.accent : theme.borderSubtle,
          },
          hasNoDates && styles.disabledSection,
        ]}
        pointerEvents={hasNoDates ? 'none' : 'auto'}
      >
        <View style={styles.datePickerSection}>
          <DateFieldRow
            label="Start Date"
            value={startDate}
            disabled={hasNoDates}
            showPicker={showStartPicker}
            onOpenPicker={() => {
              setShowEndPicker(false);
              setShowStartPicker(true);
            }}
            onClosePicker={() => setShowStartPicker(false)}
            onSelectDate={(selectedDate) => {
              onChangeStartDate(selectedDate);
              // A trip cannot start after it ends: drag the end date along.
              if (selectedDate > endDate) {
                onChangeEndDate(selectedDate);
              }
            }}
          />

          <DateFieldRow
            label="End Date"
            value={endDate}
            disabled={hasNoDates}
            showPicker={showEndPicker}
            onOpenPicker={() => {
              setShowStartPicker(false);
              setShowEndPicker(true);
            }}
            onClosePicker={() => setShowEndPicker(false)}
            onSelectDate={(selectedDate) => {
              onChangeEndDate(selectedDate);
              // A trip cannot end before it starts: drag the start date along.
              if (selectedDate < startDate) {
                onChangeStartDate(selectedDate);
              }
            }}
          />
        </View>
      </View>

      {/* Undecided Dates Switch Row */}
      <View
        style={[
          styles.toggleCard,
          {
            backgroundColor: theme.surfaceLight ?? '#161B29',
            borderColor: hasNoDates ? theme.accent : theme.borderSubtle,
          },
        ]}
      >
        <Pressable
          style={styles.toggleTextGroup}
          onPress={() => handleToggle(!hasNoDates)}
        >
          <Text style={[styles.toggleTitle, { color: theme.text }]}>
            No dates decided yet
          </Text>
          <Text style={[styles.toggleSubtitle, { color: theme.textMuted }]}>
            Skip dates for now and select later
          </Text>
        </Pressable>

        <Switch
          value={Boolean(hasNoDates)}
          onValueChange={handleToggle}
          trackColor={{ false: 'rgba(120, 120, 128, 0.35)', true: theme.accent }}
          thumbColor="#FFFFFF"
        />
      </View>
    </StepLayoutProps>
  );
}

const styles = StyleSheet.create({
  datesCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  toggleTextGroup: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  toggleSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  datePickerSection: {
    gap: 18,
  },
  disabledSection: {
    opacity: 0.45,
  },
});