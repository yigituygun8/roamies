import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';

/**
 * Activity tab: invites and group updates ("Mia finished voting").
 *
 * Placeholder for now. The scope (derived from votes/realtime or a separate
 * notifications table) is still an open question in docs/design/home-screen.md.
 */
export default function ActivityScreen() {
  return (
    <ScreenPlaceholder
      icon="notifications-outline"
      title="Activity"
      message="Invites and group updates will show up here once the trip data is connected."
      action={{ label: 'Go to your trips', to: '/home' }}
      insideTabs
    />
  );
}
