import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';

/**
 * Profile tab: account, friends and settings.
 *
 * Placeholder for now. Sign out will live here, wired to
 * `supabase.auth.signOut()` once the account screen is its own issue.
 */
export default function ProfileScreen() {
  return (
    <ScreenPlaceholder
      icon="person-outline"
      title="Profile"
      message="Your account, friends and settings will live here."
      action={{ label: 'Go to your trips', to: '/home' }}
      insideTabs
    />
  );
}
