export type Property = {
  saved_property_id: number;
  group_id: number | null;
  property_id: string | number;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  latitude: number;
  longitude: number;
  weekly_rent: number;
  photo: string[];
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  property_type: string;
  safety_score: number;
  place_id: string;
};
