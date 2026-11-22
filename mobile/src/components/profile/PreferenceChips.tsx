import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useTheme } from '@/lib/theme';
import type { TravelStyle, DietaryPreference } from '@/types/profile';

interface TravelStyleChipProps {
  value: TravelStyle | null;
  onChange: (val: TravelStyle | null) => void;
}

const TRAVEL_STYLES: { id: TravelStyle; label: string; icon: string }[] = [
  { id: 'foodie', label: 'Foodie', icon: '☕' },
  { id: 'culture', label: 'Culture & Sights', icon: '🏛️' },
  { id: 'relaxed', label: 'Relaxed & Chill', icon: '🌿' },
  { id: 'active', label: 'Active & Nature', icon: '🥾' },
  { id: 'budget', label: 'Backpacker', icon: '🎒' },
];

export function TravelStyleChips({ value, onChange }: TravelStyleChipProps) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: theme.text }]}>Travel Style</Text>
      <Text style={[styles.subtitle, { color: theme.textMuted }]}>
        Helps us and your group match your pace and vibe.
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {TRAVEL_STYLES.map((style) => {
          const isSelected = value === style.id;
          return (
            <Pressable
              key={style.id}
              onPress={() => onChange(isSelected ? null : style.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? theme.accent : theme.surfaceLight,
                  borderColor: isSelected ? theme.accent : theme.borderSubtle,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={styles.chipIcon}>{style.icon}</Text>
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? '#0B1220' : theme.text,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {style.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

interface DietaryChipProps {
  values: DietaryPreference[];
  onChange: (vals: DietaryPreference[]) => void;
}

const DIETARY_OPTIONS: { id: DietaryPreference; label: string; icon: string }[] = [
  { id: 'none', label: 'No Restrictions', icon: '🍽️' },
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'halal', label: 'Halal', icon: '🥩' },
  { id: 'gluten_free', label: 'Gluten-Free', icon: '🌾' },
];

export function DietaryChips({ values, onChange }: DietaryChipProps) {
  const theme = useTheme();

  const handleToggle = (id: DietaryPreference) => {
    if (id === 'none') {
      onChange(['none']);
      return;
    }

    const filtered = values.filter((v) => v !== 'none');
    if (filtered.includes(id)) {
      const next = filtered.filter((v) => v !== id);
      onChange(next.length === 0 ? ['none'] : next);
    } else {
      onChange([...filtered, id]);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: theme.text }]}>Dietary Preferences</Text>
      <Text style={[styles.subtitle, { color: theme.textMuted }]}>
        Shown when your group votes on restaurants and dining spots.
      </Text>
      <View style={styles.wrapGrid}>
        {DIETARY_OPTIONS.map((item) => {
          const isSelected =
            values.includes(item.id) || (item.id === 'none' && values.length === 0);
          return (
            <Pressable
              key={item.id}
              onPress={() => handleToggle(item.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? theme.accent : theme.surfaceLight,
                  borderColor: isSelected ? theme.accent : theme.borderSubtle,
                },
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
            >
              <Text style={styles.chipIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? '#0B1220' : theme.text,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginVertical: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  wrapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipIcon: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 13,
  },
});
