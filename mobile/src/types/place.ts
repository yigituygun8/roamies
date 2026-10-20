export type PlaceCategory =
  | 'museum'
  | 'landmark'
  | 'food'
  | 'park'
  | 'viewpoint'
  | 'activity';

export interface Place {
  id: string;
  city: string;
  name: string;
  category: PlaceCategory | null;
  lat: number;
  lng: number;
  openingHours: string | null;
  description: string | null;
  imageUrl: string | null;
  imageCredit: string | null;
}
