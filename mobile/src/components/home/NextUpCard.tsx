import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { TripCover } from '@/components/home/TripCover';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Scrim } from '@/components/ui/Scrim';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusChip } from '@/components/ui/StatusChip';
import { onPhoto, useTheme } from '@/lib/theme';
import { formatFriendCount, getTripStatusView, getVoteProgress } from '@/lib/trips';
import type { Trip } from '@/types/trip';

const COVER_HEIGHT = 248;

type Props = {
  trip: Trip;
};

/**
 * The one card that competes for "do this now".
 *
 * It always renders the trip's current state (the six variants come from
 * `getTripStatusView`), with the single next action at the bottom. Every action
 * leads to the trip lobby for now; the swipe deck and the plan screen are
 * separate issues.
 */
export function NextUpCard({ trip }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const status = getTripStatusView(trip);
  const progress = getVoteProgress(trip);
  // Vote progress only means something while the group is still voting.
  const showProgress = trip.status === 'voting' || trip.status === 'waiting';

  const openTrip = () =>
    router.push({ pathname: '/trips/[id]/lobby', params: { id: trip.id } });

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.borderSubtle },
      ]}
    >
      <View style={styles.cover}>
        <TripCover trip={trip} />
        <Scrim height="72%" from={0} to={0.72} curve={1.2} steps={24} />

        <View style={styles.overlay}>
          <View style={styles.coverTop}>
            <View style={styles.eyebrow}>
              <Text style={styles.eyebrowLabel}>Next up</Text>
            </View>
            <StatusChip label={status.heroChip} tone={status.tone} onPhoto />
          </View>

          <View style={styles.coverBottom}>
            <Text style={styles.city}>{trip.city}</Text>
            <Text style={styles.meta}>
              {[
                trip.dateLabel ?? 'Dates to be decided',
                formatFriendCount(trip.members.length),
              ].join(' · ')}
            </Text>
            <View style={styles.members}>
              <AvatarStack members={trip.members} onPhoto size={28} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        {showProgress ? (
          <VoteProgressBar done={progress.done} total={progress.total} />
        ) : null}

        {status.action ? (
          <PrimaryButton
            label={status.action.label}
            variant={status.action.variant}
            icon={status.action.busy ? undefined : 'arrow-forward'}
            iconPosition="right"
            loading={status.action.busy}
            fullWidth
            marginBottom={0}
            onPress={openTrip}
          />
        ) : null}
      </View>
    </View>
  );
}

type VoteProgressProps = {
  done: number;
  total: number;
};

/** One segment per member; filled segments are votes that are in. */
export function VoteProgressBar({ done, total }: VoteProgressProps) {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${done} of ${total} members voted`}
      accessibilityValue={{ min: 0, max: total, now: done }}
      style={styles.progress}
    >
      <View style={styles.track}>
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              { backgroundColor: index < done ? theme.accent : theme.borderSubtle },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.progressLabel, { color: theme.textMuted }]}>
        {done} of {total} voted
      </Text>
    </View>
  );
}

/** Same measurements as `NextUpCard`, with the photo and copy replaced by blocks. */
export function NextUpCardSkeleton() {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.borderSubtle },
      ]}
    >
      <View style={styles.cover}>
        <Skeleton width="100%" height={COVER_HEIGHT} radius={0} />
        <View style={styles.overlay}>
          <View style={styles.coverTop}>
            <Skeleton width={78} height={24} radius={12} />
            <Skeleton width={96} height={28} radius={14} />
          </View>
          <View style={styles.coverBottom}>
            <Skeleton width={160} height={32} radius={10} />
            <Skeleton width={200} height={14} style={styles.skeletonMeta} />
            <Skeleton width={104} height={28} radius={14} style={styles.skeletonMembers} />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Skeleton width="100%" height={8} radius={4} />
        <Skeleton width="100%" height={56} radius={28} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  cover: {
    height: COVER_HEIGHT,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    padding: 16,
    justifyContent: 'space-between',
  },
  coverTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  eyebrow: {
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
  coverBottom: {
    gap: 6,
  },
  city: {
    color: onPhoto.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 12,
  },
  meta: {
    color: onPhoto.textMuted,
    fontSize: 13,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  members: {
    marginTop: 6,
  },
  footer: {
    padding: 16,
    gap: 16,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  track: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  skeletonMeta: {
    marginTop: 4,
  },
  skeletonMembers: {
    marginTop: 8,
  },
});
