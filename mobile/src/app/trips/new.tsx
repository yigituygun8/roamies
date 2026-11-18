import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable, useColorScheme, ActivityIndicator, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextField } from '@/components/ui/TextField';
import { FadeIn } from '@/components/ui/FadeIn';
import { useTheme } from '@/lib/theme';

/**
 * New Trip multi-step
 */
export default function NewTripScreen() {
  const theme = useTheme();
  const scheme = useColorScheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(1);
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  
  // Date states
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

// State for proposed places list (starts with 1 empty box)
const [places, setPlaces] = useState<string[]>(['']);

// Helper functions for dynamic places
const handlePlaceChange = (text: string, index: number) => {
  const updated = [...places];
  updated[index] = text;
  setPlaces(updated);
};

const handleAddPlace = () => {
  setPlaces([...places, '']);
};

const handleRemovePlace = (index: number) => {
  if (places.length > 1) {
    const updated = places.filter((_, i) => i !== index);
    setPlaces(updated);
  } else {
    setPlaces(['']); // Keeps at least one empty box if it's the last one
  }
};  const [error, setError] = useState('');

  // Google Places Autocomplete states
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  

  const totalSteps = 5;

  // Fetch OpenStreetMap Nominatim suggestions
  useEffect(() => {
    if (step === 2 && destination.trim().length > 2) {
      const timer = setTimeout(async () => {
        try {
          setIsSearchingPlaces(true);
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=5&addressdetails=1`,
            {
              headers: {
                // Nominatim policy requires a custom User-Agent identifying your app
                'User-Agent': 'Roamies/1.0',
                'Accept-Language': 'en', // Ensures results are returned in English
              },
            }
          );
          const data = await response.json();
          if (Array.isArray(data)) {
            setSuggestions(data.map((item: any) => item.display_name));
          }
        } catch (err) {
          console.error('Error fetching OpenStreetMap locations:', err);
        } finally {
          setIsSearchingPlaces(false);
        }
      }, 350); // Debounce delay

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [destination, step]);

  const handleNext = () => {
    setError('');
    if (step === 1 && !tripName.trim()) {
      setError('Please enter a trip name.');
      return;
    }
    if (step === 2 && !destination.trim()) {
      setError('Please enter a destination.');
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setStep(6); // Loading screen step
      setTimeout(() => {
        router.replace('/trips/join'); 
      }, 2500);
    }
  };

  const handleBack = () => {
    setError('');
    if (step > 1 && step < 6) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  // Loading screen step
  if (step === 6) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: theme.background }]}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <FadeIn>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={[styles.loadingTitle, { color: theme.text }]}>Preparing your trip...</Text>
            <Text style={[styles.loadingSubtitle, { color: theme.textMuted }]}>
              Setting everything up for you and your roamies.
            </Text>
          </View>
        </FadeIn>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Pressable
            style={[
              styles.backButton,
              {
                backgroundColor: theme.surfaceLight ?? 'rgba(0, 0, 0, 0.05)',
                borderColor: theme.borderSubtle,
              },
            ]}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </Pressable>
          
          <Text style={[styles.progressText, { color: theme.textMuted }]}>
            Step {step} of {totalSteps}
          </Text>
        </View>

        <FadeIn key={step}>
          <View style={styles.stepContainer}>
            {/* Step 1: Trip Name */}
            {step === 1 && (
              <View style={styles.stepContent}>
                <Text style={[styles.eyebrow, { color: theme.accent }]}>Name your journey</Text>
                <Text style={[styles.title, { color: theme.text }]}>What is your trip called?</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                  Give your adventure a catchy name that your group will easily recognize.
                </Text>
                <TextField
                  label="Trip Name"
                  placeholder="e.g., Winter in Vienna"
                  value={tripName}
                  onChangeText={(text) => {
                    setTripName(text);
                    if (text.trim()) setError('');
                  }}
                  error={error}
                />
              </View>
            )}

            {/* Step 2: Destination with Google Maps Autocomplete */}
            {step === 2 && (
              <View style={styles.stepContent}>
                <Text style={[styles.eyebrow, { color: theme.accent }]}>Destination</Text>
                <Text style={[styles.title, { color: theme.text }]}>Where are you heading?</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                  Search and select a city or region from Google Maps.
                </Text>
                
                <TextField
                  label="Destination"
                  placeholder="Start typing a city..."
                  value={destination}
                  onChangeText={(text) => {
                    setDestination(text);
                    if (text.trim()) setError('');
                  }}
                  error={error}
                />

                {/* Autocomplete Suggestions Dropdown */}
                {isSearchingPlaces && <ActivityIndicator size="small" color={theme.accent} style={{ marginTop: 8 }} />}
                
                {suggestions.length > 0 && (
                  <View style={[styles.suggestionsContainer, { backgroundColor: theme.surfaceLight ?? '#161B29', borderColor: theme.borderSubtle }]}>
                    {suggestions.map((item, index) => (
                      <Pressable
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setDestination(item);
                          setSuggestions([]);
                          setError('');
                        }}
                      >
                        <Ionicons name="location-outline" size={16} color={theme.accent} />
                        <Text style={[styles.suggestionText, { color: theme.text }]}>{item}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Step 3: Description */}
            {step === 3 && (
              <View style={styles.stepContent}>
                <Text style={[styles.eyebrow, { color: theme.accent }]}>About the trip</Text>
                <Text style={[styles.title, { color: theme.text }]}>Add a short description</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                  What is the vibe or main goal of this trip? (Optional)
                </Text>
                <TextField
                  label="Description"
                  placeholder="e.g., Food tour, temples, and late-night adventures"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            )}

            {/* Step 4: Dates with Calendar Picker */}
            {step === 4 && (
              <View style={styles.stepContent}>
                <Text style={[styles.eyebrow, { color: theme.accent }]}>Timeline</Text>
                <Text style={[styles.title, { color: theme.text }]}>When are you going?</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                  Select your estimated start and end dates.
                </Text>

                <View style={styles.datePickerSection}>
                  <Text style={[styles.dateLabel, { color: theme.text }]}>Start Date</Text>
                  <Pressable
                    style={[styles.dateButton, { backgroundColor: theme.surfaceLight ?? '#161B29', borderColor: theme.borderSubtle }]}
                    onPress={() => setShowStartPicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={20} color={theme.accent} />
                    <Text style={[styles.dateButtonText, { color: theme.text }]}>
                      {startDate.toLocaleDateString()}
                    </Text>
                  </Pressable>

                  {showStartPicker && (
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowStartPicker(false);
                        if (selectedDate) setStartDate(selectedDate);
                      }}
                    />
                  )}

                  <View style={{ height: 16 }} />

                  <Text style={[styles.dateLabel, { color: theme.text }]}>End Date</Text>
                  <Pressable
                    style={[styles.dateButton, { backgroundColor: theme.surfaceLight ?? '#161B29', borderColor: theme.borderSubtle }]}
                    onPress={() => setShowEndPicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={20} color={theme.accent} />
                    <Text style={[styles.dateButtonText, { color: theme.text }]}>
                      {endDate.toLocaleDateString()}
                    </Text>
                  </Pressable>

                  {showEndPicker && (
                    <DateTimePicker
                      value={endDate}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowEndPicker(false);
                        if (selectedDate) setEndDate(selectedDate);
                      }}
                    />
                  )}
                </View>
              </View>
            )}

            {/* Step 5: Highlights / Proposed Places */}
{step === 5 && (
  <View style={styles.stepContent}>
    <Text style={[styles.eyebrow, { color: theme.accent }]}>Highlights</Text>
    <Text style={[styles.title, { color: theme.text }]}>Places you want to visit</Text>
    <Text style={[styles.subtitle, { color: theme.textMuted }]}>
      List a few attractions or locations you propose for the group. (Optional)
    </Text>
    
    <View style={styles.placesListContainer}>
      {places.map((place, index) => (
        <View key={index} style={styles.placeRow}>
          <View style={{ flex: 1 }}>
            <TextField
              label={`Place ${index + 1}`}
              placeholder="e.g., St. Stephen's Cathedral"
              value={place}
              onChangeText={(text) => handlePlaceChange(text, index)}
            />
          </View>

          {/* Delete button (only shows if there's more than one input) */}
          {places.length > 1 && (
            <Pressable
              style={[styles.removeButton, { borderColor: theme.borderSubtle }]}
              onPress={() => handleRemovePlace(index)}
              accessibilityRole="button"
              accessibilityLabel={`Remove place ${index + 1}`}
            >
              <Ionicons name="trash-outline" size={18} color={theme.textMuted} />
            </Pressable>
          )}
        </View>
      ))}

      {/* Button to add another place box */}
      <Pressable
        style={[
          styles.addButton,
          {
            backgroundColor: theme.surfaceLight ?? '#161B29',
            borderColor: theme.borderSubtle,
          },
        ]}
        onPress={handleAddPlace}
        accessibilityRole="button"
        accessibilityLabel="Add another place"
      >
        <Ionicons name="add" size={20} color={theme.accent} />
        <Text style={[styles.addButtonText, { color: theme.accent }]}>Add another place</Text>
      </Pressable>
    </View>
  </View>
)}
          </View>
        </FadeIn>

        {/* Bottom Action Button */}
        <View style={styles.actions}>
          <PrimaryButton
            label={step === totalSteps ? 'Create Trip' : 'Continue'}
            fullWidth
            onPress={handleNext}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepContainer: {
    flex: 1,
  },
  stepContent: {
    marginBottom: 32,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
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
  },
  datePickerSection: {
    gap: 6,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
  },
  actions: {
    width: '100%',
    marginTop: 20,
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  loadingSubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },

  placesListContainer: {
    gap: 12,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  removeButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2, // Aligns nicely with the text input field base
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginTop: 4,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});