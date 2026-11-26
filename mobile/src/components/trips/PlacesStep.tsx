import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { TextField } from '@/components/ui/TextField';
import { useTheme } from '@/lib/theme';
import { StepLayoutProps } from './StepLayout';

export interface ProposedPlace {
  id: string;
  name: string;
  isMust: boolean;
}

interface PlacesStepProps {
  places: ProposedPlace[];
  onChangePlaces: (places: ProposedPlace[]) => void;
}

function createEmptyPlace(): ProposedPlace {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    isMust: false,
  };
}

/**
 * Step 5: Dynamic list of proposed places, marked as "Must" or "Open to Vote".
 */
export function PlacesStep({ places, onChangePlaces }: PlacesStepProps) {
  const theme = useTheme();

  const handlePlaceNameChange = (text: string, index: number) => {
    const updated = [...places];
    updated[index] = { ...updated[index], name: text };
    onChangePlaces(updated);
  };

  const handleSetMust = (index: number, isMust: boolean) => {
    const updated = [...places];
    updated[index] = { ...updated[index], isMust };
    onChangePlaces(updated);
  };

  const handleAddPlace = () => {
    onChangePlaces([...places, createEmptyPlace()]);
  };

  const handleRemovePlace = (index: number) => {
    if (places.length > 1) {
      onChangePlaces(places.filter((_, i) => i !== index));
    } else {
      onChangePlaces([createEmptyPlace()]);
    }
  };

  return (
    <StepLayoutProps
      eyebrow="Highlights"
      title="Places you want to visit"
      subtitle="Lock in your non-negotiables as a Must, or let the group vote in the swipe deck. (Optional)"
    >
      <View style={styles.placesListContainer}>
        {places.map((place, index) => (
          <View
            key={place.id}
            style={[
              styles.placeCard,
              {
                backgroundColor: theme.surfaceLight,
                borderColor: place.isMust ? theme.accent : theme.borderSubtle,
              },
            ]}
          >
            {/* Card Header: Index badge + Delete action */}
            <View style={styles.cardHeader}>
              <View style={styles.indexRow}>
                <View
                  style={[
                    styles.indexPill,
                    {
                      backgroundColor: place.isMust
                        ? theme.accent
                        : 'rgba(255, 255, 255, 0.08)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.indexText,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                <Text style={[styles.cardHeaderLabel, { color: theme.textMuted }]}>
                  {place.isMust ? 'Locked in · Skips swiping' : 'Swipe deck · Group vote'}
                </Text>
              </View>

              {places.length > 1 && (
                <Pressable
                  style={styles.removeIconButton}
                  onPress={() => handleRemovePlace(index)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove place ${index + 1}`}
                >
                  <Ionicons name="close-circle" size={20} color={theme.textMuted} />
                </Pressable>
              )}
            </View>

            {/* Place Name Input */}
            <TextField
              label="Place name"
              placeholder="e.g., St. Stephen's Cathedral"
              value={place.name ?? ''}
              onChangeText={(text) => handlePlaceNameChange(text, index)}
            />

            {/* Segmented Mode Selector: Open to Vote vs Must */}
            <View
              style={[
                styles.segmentedControl,
                { backgroundColor: 'rgba(0, 0, 0, 0.22)' },
              ]}
            >
              <Pressable
                style={[
                  styles.segmentOption,
                  !place.isMust && {
                    backgroundColor: 'rgba(255, 255, 255, 0.43)',
                  },
                ]}
                onPress={() => handleSetMust(index, false)}
                accessibilityRole="radio"
                accessibilityState={{ checked: !place.isMust }}
              >
                <Ionicons
                  name="swap-horizontal"
                  size={15}
                  color={!place.isMust ? theme.text : theme.textMuted}
                />
                <Text
                  style={[
                    styles.segmentText,
                    { color: !place.isMust ? theme.text : theme.textMuted },
                  ]}
                >
                  Open to Vote
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.segmentOption,
                  place.isMust && {
                    backgroundColor: theme.accent,
                  },
                ]}
                onPress={() => handleSetMust(index, true)}
                accessibilityRole="radio"
                accessibilityState={{ checked: place.isMust }}
              >
                <Ionicons
                  name="star"
                  size={14}
                  color={place.isMust ? '#0B0F19' : theme.textMuted}
                />
                <Text
                  style={[
                    styles.segmentText,
                    { color: place.isMust ? '#0B0F19' : theme.textMuted },
                  ]}
                >
                  Must
                </Text>
              </Pressable>
            </View>
          </View>
        ))}

        {/* Dashed Add Place Button */}
        <Pressable
          style={[
            styles.addButton,
            { borderColor: theme.borderSubtle },
          ]}
          onPress={handleAddPlace}
          accessibilityRole="button"
          accessibilityLabel="Add another place"
        >
          <View style={[styles.addIconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
            <Ionicons name="add" size={18} color={theme.accent} />
          </View>
          <Text style={[styles.addButtonText, { color: theme.text }]}>
            Add another place
          </Text>
        </Pressable>
      </View>
    </StepLayoutProps>
  );
}

const styles = StyleSheet.create({
  placesListContainer: {
    gap: 16,
  },
  placeCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  indexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indexPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardHeaderLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  removeIconButton: {
    padding: 2,
  },
  segmentedControl: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  segmentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 9,
    gap: 6,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 10,
    marginTop: 2,
  },
  addIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});