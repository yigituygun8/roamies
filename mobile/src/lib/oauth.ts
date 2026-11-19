import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from './supabase';

/**
 * Result of a browser-based OAuth attempt.
 *
 * `cancelled` means the user closed the browser sheet without finishing, which
 * is not an error and should not show a message.
 */
export type OAuthResult =
  | { status: 'success' }
  | { status: 'cancelled' }
  | { status: 'error'; message: string };

/**
 * Where Supabase sends the user back. With `flowType: 'pkce'` this URL carries
 * a one-time `code`, never tokens.
 */
const redirectTo = Linking.createURL('/');

/**
 * Google sign-in through Supabase's hosted OAuth page.
 *
 * The auth sheet runs in `expo-web-browser` so it shares cookies with the system
 * browser on iOS (`openBrowserAsync` hides in an isolated Safari view). We skip
 * Supabase's own redirect because the app opens the URL itself, then exchange
 * the returned code for a session.
 *
 * Apple is not offered yet: it needs a paid Apple Developer account, so it will
 * be added here later with the same `OAuthResult` contract.
 */
export async function signInWithGoogle(): Promise<OAuthResult> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: { prompt: 'select_account' },
    },
  });

  if (error) {
    return { status: 'error', message: toFriendlyMessage(error.message) };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') {
    return { status: 'cancelled' };
  }

  const { queryParams } = Linking.parse(result.url);
  const errorDescription = queryParams?.error_description;
  if (typeof errorDescription === 'string') {
    return { status: 'error', message: toFriendlyMessage(errorDescription) };
  }

  const code = queryParams?.code;
  if (typeof code !== 'string') {
    return { status: 'error', message: 'Google sign-in did not finish. Please try again.' };
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return { status: 'error', message: toFriendlyMessage(exchangeError.message) };
  }

  return { status: 'success' };
}

/** Turns raw Supabase/provider errors into one sentence a user can act on. */
function toFriendlyMessage(raw: string): string {
  if (/provider is not enabled|unsupported provider/i.test(raw)) {
    return 'Google sign-in is not configured yet.';
  }
  if (/redirect.*not allowed/i.test(raw)) {
    return 'The sign-in redirect is not configured.';
  }
  return 'Sign-in failed. Please try again.';
}
