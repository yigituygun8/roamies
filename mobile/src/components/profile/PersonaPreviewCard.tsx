import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';
import {
  TRAVEL_STYLE_META,
  DIETARY_META,
  type TravelStyle,
  type DietaryPreference,
} from '@/types/profile';

export interface PersonaPreviewCardProps {
  travelStyle?: TravelStyle | null;
  dietaryPreferences?: DietaryPreference[];
  onPress: () => void;
}

/**
 * Card previewing the user's selected Travel Style and Dietary Preferences badges,
 * with quick access to the edit screen.
 */
export function PersonaPreviewCard({
  travelStyle,
  dietaryPreferences = [],
  onPress,
}: PersonaPreviewCardProps) {
  const theme = useTheme();
  const actualDietary = (dietaryPreferences || []).filter((p) => p !== 'none');
  const hasPersona = Boolean(travelStyle || actualDietary.length > 0);

  return (
    <Pressable
      style={[
        styles.personaCard,
        {
          backgroundColor: theme.surfaceLight,
          borderColor: theme.borderSubtle,
        },
      ]}
      onPress={onPress}
      accessibilityLabel="View and edit your travel style and dietary preferences"
      accessibilityRole="button"
    >
      <View style={styles.personaHeader}>
        <View style={styles.personaTitleRow}>
          <Ionicons name="sparkles-outline" size={17} color={theme.accent} />
          <Text style={[styles.personaTitle, { color: theme.text }]}>
            Travel Persona &amp; Diet
          </Text>
        </View>
        <View style={styles.personaEditButton}>
          <Text style={[styles.personaEditText, { color: theme.accentText }]}>
            {hasPersona ? 'Edit' : 'Add'}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={theme.accentText} />
        </View>
      </View>

      <View style={styles.badgeRow}>
        {hasPersona ? (
          <>
            {travelStyle && TRAVEL_STYLE_META[travelStyle] && (
              <View
                style={[
                  styles.personaBadge,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <Text style={styles.personaBadgeIcon}>
                  {TRAVEL_STYLE_META[travelStyle].icon}
                </Text>
                <Text style={[styles.personaBadgeText, { color: theme.text }]}>
                  {TRAVEL_STYLE_META[travelStyle].label}
                </Text>
              </View>
            )}

            {actualDietary.map((pref) => {
              const meta = DIETARY_META[pref];
              if (!meta) return null;
              return (
                <View
                  key={pref}
                  style={[
                    styles.personaBadge,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.borderSubtle,
                    },
                  ]}
                >
                  <Text style={styles.personaBadgeIcon}>{meta.icon}</Text>
                  <Text style={[styles.personaBadgeText, { color: theme.text }]}>
                    {meta.label}
                  </Text>
                </View>
              );
            })}
          </>
        ) : (
          <View
            style={[
              styles.addBadge,
              {
                borderColor: theme.accent,
                backgroundColor: theme.surfaceSubtle,
              },
            ]}
          >
            <Ionicons name="add" size={16} color={theme.accentText} />
            <Text style={[styles.addBadgeText, { color: theme.accentText }]}>
              Add your travel style &amp; diet
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  personaCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    gap: 12,
  },
  personaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  personaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  personaTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  personaEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  personaEditText: {
    fontSize: 13,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  personaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  personaBadgeIcon: {
    fontSize: 13,
  },
  personaBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 6,
  },
  addBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
