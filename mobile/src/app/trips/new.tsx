import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
  
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextField } from '@/components/ui/TextField';
import { FadeIn } from '@/components/ui/FadeIn';
import { StepLayoutProps } from '@/components/trips/StepLayout';
import { DestinationStep } from '@/components/trips/DestinationStep';
import { DatesStep } from '@/components/trips/DatesStep';
import { PlacesStep, ProposedPlace } from '@/components/trips/PlacesStep';
import { LoadingNewTripView } from '@/components/trips/LoadingNewTripView';
import { useTheme } from '@/lib/theme';

const TOTAL_STEPS = 5;

/**
 * Multi-step wizard to create a new trip.
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

  const [hasNoDates, setHasNoDates] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  
  const [places, setPlaces] = useState<ProposedPlace[]>([
    { id: 'initial-1', name: '', isMust: false },
  ]);
  // Final array of valid places, filtering out any empty names to send to the backend. This is done here to avoid sending empty names to the backend, but still allowing the user to have an empty input field in the UI.
  const validPlaces = (Array.isArray(places) ? places : [])
  .map((p) => ({
    id: p.id,
    name: String(p?.name ?? '').trim(),
    isMust: Boolean(p?.isMust),
  }))
  .filter((p) => p.name.length > 0);

  const [error, setError] = useState('');

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

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      setStep(6);
      setTimeout(() => {
        router.replace('/trips/join');
      }, 2500);
    }
  };

  const handleBack = () => {
    setError('');
    if (step > 1 && step <= TOTAL_STEPS) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  if (step === 6) {
    // Creating trip, show loading state
    return <LoadingNewTripView />;
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
            Step {step} of {TOTAL_STEPS}
          </Text>
        </View>

        <FadeIn key={step}>
          <View style={styles.stepContainer}>
            {step === 1 && (
              <StepLayoutProps
                eyebrow="Name your journey"
                title="What is your trip called?"
                subtitle="Give your adventure a catchy name that your group will easily recognize."
              >
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
              </StepLayoutProps>
            )}

            {step === 2 && (
              <DestinationStep
                value={destination}
                error={error}
                onChange={setDestination}
                onClearError={() => setError('')}
              />
            )}

            {step === 3 && (
              <StepLayoutProps
                eyebrow="About the trip"
                title="Add a short description"
                subtitle="What is the vibe or main goal of this trip? (Optional)"
              >
                <TextField
                  label="Description"
                  placeholder="e.g., Food tour, temples, adventures..."
                  value={description}
                  onChangeText={setDescription}
                />
              </StepLayoutProps>
            )}
            

            {step === 4 && (
              <DatesStep
                startDate={startDate}
                endDate={endDate}
                hasNoDates={hasNoDates}
                onToggleNoDates={setHasNoDates}
                onChangeStartDate={setStartDate}
                onChangeEndDate={setEndDate}
              />
            )}


            {step === 5 && (
              <PlacesStep places={places} onChangePlaces={setPlaces} />
            )}
          </View>
        </FadeIn>

        <View style={styles.actions}>
          <PrimaryButton
            label={step === TOTAL_STEPS ? 'Create Trip' : 'Continue'}
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
  actions: {
    width: '100%',
    marginTop: 20,
  },
});