import type { ImageProps } from 'expo-image';

/**
 * Trip shapes used by the home screen.
 *
 * These mirror the design assumptions in docs/design/home-screen.md §8, not a
 * database yet. Field names are camelCase because everything that crosses into
 * the network boundary does (see docs/PROJECT.md §3). When the Supabase
 * `trips` / `trip_members` / `votes` tables are designed, the row mapping is
 * added here and the screens stay unchanged.
 */

/** A trip always sits in exactly one of these states. */
export type TripStatus =
  | 'no-dates'
  | 'voting'
  | 'waiting'
  | 'building'
  | 'ready'
  | 'past';

export interface TripMember {
  id: string;
  /** Display name, used for the accessible label of the avatar stack. */
  name: string;
  /** One or two letters, e.g. "LA". */
  initials: string;
  /** True once this member has swiped every place. */
  finishedVoting: boolean;
}

export interface Trip {
  /** Readable slug, e.g. `trip-paris-may`. */
  id: string;
  city: string;
  country: string;
  /** Display text such as "14-18 May"; null while the group has no dates. */
  dateLabel: string | null;
  /** ISO dates; null while the group has no dates. */
  startDate: string | null;
  endDate: string | null;
  status: TripStatus;
  /**
   * Local asset, remote URL, or null when there is no cover. The card falls
   * back to the city initial on a brand gradient.
   */
  cover: ImageProps['source'] | null;
  /** Everyone in the group, including the current user. */
  members: TripMember[];
  /** Places this user still has to swipe; 0 when they are done. */
  placesLeft: number;
}

/** The signed-in user, until auth/profile data exists. */
export interface CurrentUser {
  name: string;
  initials: string;
}
