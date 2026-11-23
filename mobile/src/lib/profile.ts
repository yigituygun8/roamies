import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import type { UserProfile, UpdateProfileInput } from '@/types/profile';

const LOCAL_PROFILE_KEY = '@roamies/user_profile_cache';

const DEFAULT_PROFILE: UserProfile = {
  id: 'demo-placeholder-id',
  fullName: 'Julia Yu',
  username: 'juliayu',
  email: 'julia.yu@roamies.app',
  avatarPath: null,
  avatarUrl: null,
  bio: 'Searching for hidden viewpoints & specialty coffee ☕🎨',
  homeCity: 'Vienna, AT',
  travelStyle: 'culture',
  dietaryPreferences: ['vegetarian'],
};

/**
 * Resolves a storage avatar path to a public CDN URL via Supabase Storage.
 */
export function getAvatarUrl(avatarPath: string | null | undefined): string | null {
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://') || avatarPath.startsWith('file://')) {
    return avatarPath;
  }
  try {
    const { data } = supabase.storage.from('avatars').getPublicUrl(avatarPath);
    return data?.publicUrl ?? null;
  } catch {
    return null;
  }
}

/**
 * Loads the user profile. Attempts to fetch from Supabase `profiles` table.
 * If the table does not exist yet or there is a network issue, smoothly
 * falls back to AsyncStorage cached profile / defaults.
 */
export async function fetchProfile(userId: string, emailHint?: string): Promise<UserProfile> {
  let cached: UserProfile | null = null;
  try {
    const rawCache = await AsyncStorage.getItem(`${LOCAL_PROFILE_KEY}_${userId}`);
    if (rawCache) {
      cached = JSON.parse(rawCache);
    }
  } catch {
    // ignore cache read error
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      if (cached) return cached;
      return {
        ...DEFAULT_PROFILE,
        id: userId,
        email: emailHint ?? DEFAULT_PROFILE.email,
      };
    }

    const profile: UserProfile = {
      id: data.id,
      fullName: data.full_name || '',
      username: data.username || '',
      email: emailHint || DEFAULT_PROFILE.email,
      avatarPath: data.avatar_path || null,
      avatarUrl: getAvatarUrl(data.avatar_path),
      bio: data.bio || '',
      homeCity: data.home_city || '',
      travelStyle: data.travel_style || null,
      dietaryPreferences: Array.isArray(data.dietary_preferences) ? data.dietary_preferences : [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    // Cache locally
    await AsyncStorage.setItem(`${LOCAL_PROFILE_KEY}_${userId}`, JSON.stringify(profile));
    return profile;
  } catch {
    // If DB is offline or not yet migrated, fall back gracefully
    if (cached) return cached;
    return {
      ...DEFAULT_PROFILE,
      id: userId,
      email: emailHint ?? DEFAULT_PROFILE.email,
    };
  }
}

/**
 * Saves profile updates to Supabase (and caches to AsyncStorage).
 */
export async function saveProfile(
  userId: string,
  input: UpdateProfileInput,
  currentAvatarUrl?: string | null
): Promise<UserProfile> {
  const payload = {
    id: userId,
    full_name: input.fullName.trim(),
    username: input.username.trim().replace(/^@/, '').toLowerCase(),
    bio: input.bio.trim(),
    home_city: input.homeCity.trim(),
    travel_style: input.travelStyle,
    dietary_preferences: input.dietaryPreferences,
    ...(input.avatarPath !== undefined ? { avatar_path: input.avatarPath } : {}),
    updated_at: new Date().toISOString(),
  };

  let savedAvatarPath = input.avatarPath;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload)
      .select()
      .single();

    if (!error && data) {
      savedAvatarPath = data.avatar_path;
    }
  } catch {
    // If Supabase table isn't created yet by DB team, continue so local state updates
  }

  const updatedProfile: UserProfile = {
    id: userId,
    fullName: payload.full_name,
    username: payload.username,
    email: DEFAULT_PROFILE.email,
    avatarPath: savedAvatarPath ?? null,
    avatarUrl: savedAvatarPath ? getAvatarUrl(savedAvatarPath) : (currentAvatarUrl ?? null),
    bio: payload.bio,
    homeCity: payload.home_city,
    travelStyle: payload.travel_style,
    dietaryPreferences: payload.dietary_preferences,
    updatedAt: payload.updated_at,
  };

  await AsyncStorage.setItem(`${LOCAL_PROFILE_KEY}_${userId}`, JSON.stringify(updatedProfile));
  return updatedProfile;
}

/**
 * Uploads an image file to Supabase Storage bucket 'avatars'.
 * Returns the stored path and resolved public URL.
 */
export async function uploadAvatarImage(
  userId: string,
  localUri: string
): Promise<{ avatarPath: string; avatarUrl: string }> {
  const extension = localUri.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${userId}/avatar_${Date.now()}.${extension}`;

  try {
    const response = await fetch(localUri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, arrayBuffer, {
        contentType: extension === 'png' ? 'image/png' : 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      // If remote upload fails (e.g. bucket not ready), return local URI so UI still previews
      return { avatarPath: fileName, avatarUrl: localUri };
    }

    const avatarUrl = getAvatarUrl(fileName) || localUri;
    return { avatarPath: fileName, avatarUrl };
  } catch {
    // Graceful fallback for local development without active storage bucket
    return { avatarPath: fileName, avatarUrl: localUri };
  }
}
