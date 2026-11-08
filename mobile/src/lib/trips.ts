import { useCallback, useEffect, useState } from 'react';

import type { CurrentUser, Trip, TripStatus } from '@/types/trip';

/**
 * Trip data for the home screen.
 *
 * TEMPORARY: everything below the type imports is mock data so the UI can be
 * built before the Supabase tables exist. `useTrips` is the only thing the
 * screens call, so swapping the mock source for a query (and the member/vote
 * mapping) touches this file and nothing else.
 */

export const MOCK_USER: CurrentUser = { name: 'Osman', initials: 'OS' };

export const mockTrips: Trip[] = [
  {
    id: 'trip-paris-may',
    city: 'Paris',
    country: 'France',
    dateLabel: '14-18 May',
    startDate: '2027-05-14',
    endDate: '2027-05-18',
    status: 'voting',
    cover: require('@/assets/images/auth/welcome.jpg'),
    placesLeft: 3,
    members: [
      { id: 'u-osman', name: 'Osman', initials: 'OS', finishedVoting: false },
      { id: 'u-mia', name: 'Mia', initials: 'MK', finishedVoting: true },
      { id: 'u-jonas', name: 'Jonas', initials: 'JS', finishedVoting: true },
      { id: 'u-nuha', name: 'Nuha', initials: 'ND', finishedVoting: true },
      { id: 'u-deniz', name: 'Deniz', initials: 'DK', finishedVoting: false },
    ],
  },
  {
    id: 'trip-venice-june',
    city: 'Venice',
    country: 'Italy',
    dateLabel: '2-6 Jun',
    startDate: '2027-06-02',
    endDate: '2027-06-06',
    status: 'waiting',
    cover: require('@/assets/images/onboarding/swipe.jpg'),
    placesLeft: 0,
    members: [
      { id: 'u-osman', name: 'Osman', initials: 'OS', finishedVoting: true },
      { id: 'u-mia', name: 'Mia', initials: 'MK', finishedVoting: true },
      { id: 'u-jonas', name: 'Jonas', initials: 'JS', finishedVoting: true },
    ],
  },
  {
    id: 'trip-dolomites-july',
    city: 'Dolomites',
    country: 'Italy',
    dateLabel: '20-24 Jul',
    startDate: '2027-07-20',
    endDate: '2027-07-24',
    status: 'ready',
    cover: require('@/assets/images/onboarding/fair.jpg'),
    placesLeft: 0,
    members: [
      { id: 'u-osman', name: 'Osman', initials: 'OS', finishedVoting: true },
      { id: 'u-mia', name: 'Mia', initials: 'MK', finishedVoting: true },
      { id: 'u-jonas', name: 'Jonas', initials: 'JS', finishedVoting: true },
      { id: 'u-nuha', name: 'Nuha', initials: 'ND', finishedVoting: true },
      { id: 'u-deniz', name: 'Deniz', initials: 'DK', finishedVoting: true },
    ],
  },
  {
    id: 'trip-lisbon-sept',
    city: 'Lisbon',
    country: 'Portugal',
    dateLabel: null,
    startDate: null,
    endDate: null,
    status: 'no-dates',
    cover: null,
    placesLeft: 0,
    members: [
      { id: 'u-osman', name: 'Osman', initials: 'OS', finishedVoting: false },
      { id: 'u-mia', name: 'Mia', initials: 'MK', finishedVoting: false },
      { id: 'u-nuha', name: 'Nuha', initials: 'ND', finishedVoting: false },
      { id: 'u-deniz', name: 'Deniz', initials: 'DK', finishedVoting: false },
    ],
  },
  {
    id: 'trip-vienna-oct',
    city: 'Vienna',
    country: 'Austria',
    dateLabel: '3-7 Oct',
    startDate: '2027-10-03',
    endDate: '2027-10-07',
    status: 'building',
    cover: null,
    placesLeft: 0,
    members: [
      { id: 'u-osman', name: 'Osman', initials: 'OS', finishedVoting: true },
      { id: 'u-mia', name: 'Mia', initials: 'MK', finishedVoting: true },
      { id: 'u-jonas', name: 'Jonas', initials: 'JS', finishedVoting: true },
      { id: 'u-nuha', name: 'Nuha', initials: 'ND', finishedVoting: true },
    ],
  },
  {
    id: 'trip-rome-april',
    city: 'Rome',
    country: 'Italy',
    dateLabel: '12-16 Apr',
    startDate: '2026-04-12',
    endDate: '2026-04-16',
    status: 'past',
    cover: null,
    placesLeft: 0,
    members: [
      { id: 'u-osman', name: 'Osman', initials: 'OS', finishedVoting: true },
      { id: 'u-mia', name: 'Mia', initials: 'MK', finishedVoting: true },
      { id: 'u-jonas', name: 'Jonas', initials: 'JS', finishedVoting: true },
    ],
  },
];

/**
 * DEMO SWITCHES. Change these, reload, and you get a different screen state
 * without touching the components. Delete them together with the mocks.
 */
export type MockScenario = 'populated' | 'empty' | 'loading' | 'error';
export const MOCK_SCENARIO: MockScenario = 'populated';
/** Set to a trip id to force it into the hero, e.g. 'trip-rome-april'. */
export const MOCK_NEXT_UP_ID: string | null = null;
const MOCK_LATENCY_MS = 700;

export type TripsStatus = 'loading' | 'error' | 'ready';

export interface TripsState {
  status: TripsStatus;
  trips: Trip[];
  /** The single trip that needs the user now, or null when there is no trip. */
  nextUp: Trip | null;
  user: CurrentUser;
  retry: () => void;
}

/** "Act now" order: places to swipe beats a missing date beats waiting. */
const NEXT_UP_RANK: Record<TripStatus, number> = {
  voting: 0,
  'no-dates': 1,
  waiting: 2,
  building: 3,
  ready: 4,
  past: 5,
};

export function pickNextUp(trips: Trip[]): Trip | null {
  if (trips.length === 0) return null;
  return [...trips].sort((a, b) => NEXT_UP_RANK[a.status] - NEXT_UP_RANK[b.status])[0];
}

export interface VoteProgress {
  done: number;
  total: number;
}

export function getVoteProgress(trip: Trip): VoteProgress {
  return {
    done: trip.members.filter((member) => member.finishedVoting).length,
    total: trip.members.length,
  };
}

export function formatFriendCount(count: number): string {
  return `${count} friend${count === 1 ? '' : 's'}`;
}

export interface TripStatusView {
  /** Chip copy on the hero card. */
  heroChip: string;
  /** Chip copy on a compact trip card. */
  cardChip: string;
  /** Accent reads as "needs you", muted as "nothing to do". */
  tone: 'accent' | 'muted';
  /** The one button the card offers, if any. */
  action: TripAction | null;
}

export interface TripAction {
  label: string;
  variant: 'accent' | 'outline';
  /** Renders a spinner and blocks presses (plan is being built). */
  busy?: boolean;
}

/**
 * Copy for each trip state, in one place so the hero, the card and the chip
 * can never disagree. Labels name the result ("Swipe 3 places left") instead of
 * a vague "Continue".
 */
export function getTripStatusView(trip: Trip): TripStatusView {
  const { done, total } = getVoteProgress(trip);

  switch (trip.status) {
    case 'no-dates':
      return {
        heroChip: 'No dates yet',
        cardChip: 'Pick dates',
        tone: 'accent',
        action: { label: 'Set dates', variant: 'accent' },
      };
    case 'voting':
      return {
        heroChip: `${done} of ${total} voted`,
        cardChip: `${done} of ${total} voted`,
        tone: 'accent',
        action: {
          label:
            trip.placesLeft === 1
              ? 'Swipe 1 place left'
              : `Swipe ${trip.placesLeft} places left`,
          variant: 'accent',
        },
      };
    case 'waiting':
      return {
        heroChip: `${done} of ${total} voted`,
        cardChip: `${done} of ${total} voted`,
        tone: 'muted',
        action: { label: 'View votes', variant: 'outline' },
      };
    case 'building':
      return {
        heroChip: 'Building your plan',
        cardChip: 'Building plan',
        tone: 'muted',
        action: { label: 'Building your plan', variant: 'accent', busy: true },
      };
    case 'ready':
      return {
        heroChip: 'Your plan is ready',
        cardChip: 'Plan ready',
        tone: 'accent',
        action: { label: 'See route', variant: 'accent' },
      };
    case 'past':
      return {
        heroChip: 'Last trip',
        cardChip: 'Past trip',
        tone: 'muted',
        action: { label: 'View plan', variant: 'outline' },
      };
  }
}

/**
 * Simulates the data fetch so the loading skeleton is real during demos.
 * Replaced by a Supabase query once the trips tables exist.
 */
export function useTrips(): TripsState {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ status: TripsStatus; trips: Trip[] }>({
    status: 'loading',
    trips: [],
  });

  const retry = useCallback(() => {
    setResult({ status: 'loading', trips: [] });
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    if (MOCK_SCENARIO === 'loading') return;

    const timer = setTimeout(() => {
      if (MOCK_SCENARIO === 'error') {
        setResult({ status: 'error', trips: [] });
        return;
      }
      setResult({
        status: 'ready',
        trips: MOCK_SCENARIO === 'empty' ? [] : mockTrips,
      });
    }, MOCK_LATENCY_MS);

    return () => clearTimeout(timer);
  }, [attempt]);

  const nextUp = MOCK_NEXT_UP_ID
    ? (result.trips.find((trip) => trip.id === MOCK_NEXT_UP_ID) ?? null)
    : pickNextUp(result.trips);

  return {
    status: result.status,
    trips: result.trips,
    nextUp,
    user: MOCK_USER,
    retry,
  };
}
