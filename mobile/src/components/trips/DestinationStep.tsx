import { useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { TextField } from '@/components/ui/TextField';
import { useTheme } from '@/lib/theme';
import { StepLayoutProps } from './StepLayout';

interface PhotonProperties {
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  osm_key?: string;
  osm_value?: string;
}

interface PhotonFeature {
  properties: PhotonProperties;
}

interface NominatimPlace {
  display_name: string;
  class?: string;
  type?: string;
  addresstype?: string;
}

interface DestinationStepProps {
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onClearError: () => void;
}

const ALLOWED_PLACE_TYPES = new Set([
  'country',
  'state',
  'region',
  'province',
  'county',
  'city',
  'town',
  'village',
  'municipality',
  'hamlet',
]);

function isAllowedPhotonPlace(props: PhotonProperties): boolean {
  const osmValue = props.osm_value ?? '';
  const osmKey = props.osm_key ?? '';

  if (!ALLOWED_PLACE_TYPES.has(osmValue)) return false;
  if (osmKey && osmKey !== 'place' && osmKey !== 'boundary') return false;

  return Boolean(props.name);
}

function formatPhotonLabel(props: PhotonProperties): string {
  const parts: string[] = [];
  if (props.name) parts.push(props.name);
  if (props.state && props.state !== props.name) parts.push(props.state);
  if (props.country && props.country !== props.name) parts.push(props.country);
  return parts.join(', ');
}

function isAllowedNominatimPlace(item: NominatimPlace): boolean {
  const kind = item.addresstype ?? item.type ?? '';
  if (!ALLOWED_PLACE_TYPES.has(kind)) return false;
  if (item.class && item.class !== 'place' && item.class !== 'boundary') return false;
  return true;
}

/**
 * Step 2: Destination autocomplete using Photon with automatic Nominatim fallback,
 * filtered to countries, regions, cities, and towns.
 */
export function DestinationStep({
  value,
  error,
  onChange,
  onClearError,
}: DestinationStepProps) {
  const theme = useTheme();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    if (selected) return;

    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // 1. Primary search: Photon (fast prefix matching)
        const photonRes = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=15`,
          {
            signal: controller.signal,
            headers: {
              Accept: 'application/json',
              'User-Agent': 'Roamies/1.0',
            },
          }
        );

        if (photonRes.ok) {
          const data = await photonRes.json();
          if (Array.isArray(data?.features)) {
            const uniqueLabels = new Set<string>();
            for (const feature of data.features as PhotonFeature[]) {
              if (!isAllowedPhotonPlace(feature.properties)) continue;
              const label = formatPhotonLabel(feature.properties);
              if (label) uniqueLabels.add(label);
              if (uniqueLabels.size >= 6) break;
            }

            if (uniqueLabels.size > 0) {
              setSuggestions(Array.from(uniqueLabels));
              return;
            }
          }
        }

        // 2. Fallback: Nominatim if Photon fails or finds nothing
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            trimmed
          )}&limit=20&addressdetails=1`,
          {
            signal: controller.signal,
            headers: {
              Accept: 'application/json',
              'User-Agent': 'Roamies/1.0',
              'Accept-Language': 'en',
            },
          }
        );

        if (nomRes.ok) {
          const nomData: NominatimPlace[] = await nomRes.json();
          if (Array.isArray(nomData)) {
            const filtered = nomData
              .filter(isAllowedNominatimPlace)
              .slice(0, 6)
              .map((item) => item.display_name);
            setSuggestions(filtered);
          }
        }
      } catch (err: unknown) {
        if ((err as { name?: string })?.name !== 'AbortError') {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, selected]);

  const handleSelectSuggestion = (item: string) => {
    Keyboard.dismiss();
    onChange(item);
    setSelected(true);
    setSuggestions([]);
    onClearError();
  };

  return (
    <StepLayoutProps
      eyebrow="Destination"
      title="Where are you heading?"
      subtitle="Select a country, region, city, or town."
    >
      <TextField
        label="Destination"
        placeholder="Start typing a city, region, or country..."
        value={value}
        onChangeText={(text) => {
          onChange(text);
          setSelected(false);
          if (text.trim()) onClearError();
        }}
        error={error}
      />

      {isSearching && (
        <ActivityIndicator size="small" color={theme.accent} style={styles.loader} />
      )}

      {suggestions.length > 0 && (
        <View
          style={[
            styles.suggestionsContainer,
            {
              backgroundColor: theme.surfaceLight ?? '#161B29',
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          {suggestions.map((item, index) => (
            <Pressable
              key={`${item}-${index}`}
              style={styles.suggestionItem}
              onPress={() => handleSelectSuggestion(item)}
            >
              <Ionicons name="location-outline" size={16} color={theme.accent} />
              <Text style={[styles.suggestionText, { color: theme.text }]}>{item}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </StepLayoutProps>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 8,
  },
  suggestionsContainer: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  suggestionText: {
    fontSize: 14,
    flex: 1,
  },
});