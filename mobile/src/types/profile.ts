export type TravelStyle = 'foodie' | 'culture' | 'relaxed' | 'active' | 'budget';

export type DietaryPreference = 'none' | 'vegetarian' | 'vegan' | 'halal' | 'gluten_free';

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatarPath: string | null;
  avatarUrl: string | null;
  bio: string;
  homeCity: string;
  travelStyle: TravelStyle | null;
  dietaryPreferences: DietaryPreference[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileInput {
  fullName: string;
  username: string;
  bio: string;
  homeCity: string;
  travelStyle: TravelStyle | null;
  dietaryPreferences: DietaryPreference[];
  avatarPath?: string | null;
}

export const TRAVEL_STYLE_META: Record<TravelStyle, { label: string; icon: string }> = {
  foodie: { label: 'Foodie', icon: '☕' },
  culture: { label: 'Culture & Sights', icon: '🏛️' },
  relaxed: { label: 'Relaxed & Chill', icon: '🌿' },
  active: { label: 'Active & Nature', icon: '🥾' },
  budget: { label: 'Backpacker', icon: '🎒' },
};

export const DIETARY_META: Record<DietaryPreference, { label: string; icon: string }> = {
  none: { label: 'No Restrictions', icon: '🍽️' },
  vegetarian: { label: 'Vegetarian', icon: '🥗' },
  vegan: { label: 'Vegan', icon: '🌱' },
  halal: { label: 'Halal', icon: '🥩' },
  gluten_free: { label: 'Gluten-Free', icon: '🌾' },
};
