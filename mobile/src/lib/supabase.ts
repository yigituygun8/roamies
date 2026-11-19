import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * The client is created on first use, not on import.
 *
 * Expo renders the web build in Node (`app.json` -> `web.output: "server"`),
 * where `EXPO_PUBLIC_*` variables are not inlined. Creating the client eagerly
 * would throw during that prerender pass and break `expo export`. Deferring it
 * keeps the "missing env" error, just at the first real request.
 */
let client: SupabaseClient | undefined;

function getClient(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Check your .env file.');
  }

  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      // OAuth returns a one-time code instead of tokens in the URL; it is
      // exchanged with `exchangeCodeForSession` in `lib/oauth.ts`.
      flowType: 'pkce',
    },
  });

  return client;
}

/**
 * Same surface as a `SupabaseClient`, initialised on first property access.
 * Every call site keeps using `supabase.auth`, `supabase.from(...)` etc.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const instance = getClient();
    const value = Reflect.get(instance, property);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
