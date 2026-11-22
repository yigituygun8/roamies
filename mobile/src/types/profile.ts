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
