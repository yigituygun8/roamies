import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PhotoHero } from '@/components/ui/PhotoHero';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { onPhoto, useTheme } from '@/lib/theme';

const STEPS = [
  { title: 'Invite', body: 'Bring the group in' },
  { title: 'Swipe', body: 'Yes or no on places' },
  { title: 'Get a plan', body: 'A fair route for all' },
] as const;

/**
 * First-run state: teach the product before the first trip exists.
 *
 * One photo hero with the two ways in (create, join) and a three-step strip
 * that explains what happens after that.
 */
export function EmptyState() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View>
      <View style={styles.hero}>
        <PhotoHero source={require('@/assets/images/onboarding/plan.jpg')} bottomScrimHeight="86%">
          <View style={styles.heroInner}>
            <View style={styles.eyebrow}>
              <Text style={styles.eyebrowLabel}>No trips yet</Text>
            </View>

            <View style={styles.heroCopy}>
              <Text style={styles.kicker}>Your next story</Text>
              <Text accessibilityRole="header" style={styles.title}>
                {'START A\nTRIP.'}
              </Text>
              <Text style={styles.heroBody}>
                Pick a city, invite the group, and let everyone vote on what makes the cut.
              </Text>

              <View style={styles.actions}>
                <PrimaryButton
                  label="Create a trip"
                  icon="add"
                  variant="light"
                  fullWidth
                  marginBottom={10}
                  onPress={() => router.push('/trips/new')}
                />
                <PrimaryButton
                  label="Join with a code"
                  icon="link-outline"
                  variant="ghost"
                  fullWidth
                  marginBottom={0}
                  onPress={() => router.push('/trips/join')}
                />
              </View>
            </View>
          </View>
        </PhotoHero>
      </View>

      <View style={styles.stepsSection}>
        <SectionHeader
          title={
            <>
              How <Text style={[styles.brand, { color: theme.text }]}>Roamies</Text> works:
            </>
          }
        />

        <View style={styles.steps}>
          {STEPS.map((step, index) => (
            <View
              key={step.title}
              accessible
              accessibilityLabel={`Step ${index + 1}. ${step.title}: ${step.body}`}
              style={[
                styles.step,
                { backgroundColor: theme.surface, borderColor: theme.borderSubtle },
              ]}
            >
              <View style={[styles.stepBadge, { backgroundColor: theme.surfaceSubtle }]}>
                <Text style={[styles.stepNumber, { color: theme.accentText }]}>{index + 1}</Text>
              </View>
              <Text style={[styles.stepTitle, { color: theme.text }]}>{step.title}</Text>
              <Text style={[styles.stepBody, { color: theme.textMuted }]}>{step.body}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 440,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 28,
  },
  heroInner: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 18,
  },
  eyebrow: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderColor: 'rgba(255, 255, 255, 0.28)',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  eyebrowLabel: {
    color: onPhoto.text,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  heroCopy: {
    gap: 10,
  },
  kicker: {
    color: onPhoto.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    color: onPhoto.text,
    fontSize: 40,
    lineHeight: 41,
    fontWeight: '800',
    letterSpacing: -1,
  },
  heroBody: {
    color: onPhoto.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 8,
    maxWidth: 300,
  },
  actions: {
    marginTop: 4,
  },
  stepsSection: {
    marginBottom: 8,
  },
  /** Brand word emphasis in the section title. */
  brand: {
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  steps: {
    flexDirection: 'row',
    gap: 10,
  },
  step: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '800',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepBody: {
    fontSize: 11,
    lineHeight: 16,
  },
});
