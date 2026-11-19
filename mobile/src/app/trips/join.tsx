import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';

/**
 * Join a trip with an invite code.
 *
 * The screen exists so the empty state's second call to action has a real
 * destination and back navigation works. The code itself needs the trips and
 * invites tables, which are not designed yet, so the form is not built.
 */
export default function JoinTripScreen() {
  return (
    <ScreenPlaceholder
      icon="key-outline"
      title="Join with a code"
      message="Invite codes need the trips and invites tables first. Until then, ask the trip owner to add you from their side."
      action={{ label: 'Plan a new trip', to: '/trips/new' }}
    />
  );
}
