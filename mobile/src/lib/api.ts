import { supabase } from './supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export async function apiFetch(path: string, init: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init.headers as Record<string, string>) ?? {}),
  };
  if (session) headers.Authorization = `Bearer ${session.access_token}`;

  return fetch(`${API_URL}${path}`, { ...init, headers });
}
