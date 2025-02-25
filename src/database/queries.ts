import { supabase } from "./supabaseClient";

/** =========================
 *  Properties Table (Public)
 *  - Public data: managed by the project team.
 *  - Only administrators (service_role) can perform write operations.
 *  - All users can read.
 ============================ */
// Get all public properties
export const getAllProperties = async () => {
  const { data, error } = await supabase
    .from("properties")
    .select("*");
  if (error) throw error;
  return data;
};

// Get a property by its property_id
export const getPropertyById = async (id: string) => {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("property_id", id)
    .single();
  if (error) throw error;
  return data;
};

// Insert a new property (for admin use)
export const addProperty = async (property: any) => {
  const { data, error } = await supabase
    .from("properties")
    .insert([property]);
  if (error) throw error;
  return data;
};

// Update a property (for admin use)
export const updateProperty = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from("properties")
    .update(updates)
    .eq("property_id", id);
  if (error) throw error;
  return data;
};

// Delete a property (for admin use)
export const deleteProperty = async (id: string) => {
  const { data, error } = await supabase
    .from("properties")
    .delete()
    .eq("property_id", id);
  if (error) throw error;
  return data;
};

/** =========================
 *  POI Markers Table (Public)
 *  - Public data: managed by the project team.
 *  - Only administrators (service_role) can perform write operations.
 *  - All users can read.
 ============================ */
// Get all public POIs
export const getAllPOIs = async () => {
  const { data, error } = await supabase
    .from("poi_markers")
    .select("*");
  if (error) throw error;
  return data;
};

// Get a POI by its poi_id
export const getPOIById = async (id: string) => {
  const { data, error } = await supabase
    .from("poi_markers")
    .select("*")
    .eq("poi_id", id)
    .single();
  if (error) throw error;
  return data;
};

// Insert a new POI (for admin use)
export const addPOI = async (poi: any) => {
  const { data, error } = await supabase
    .from("poi_markers")
    .insert([poi]);
  if (error) throw error;
  return data;
};

// Update a POI (for admin use)
export const updatePOI = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from("poi_markers")
    .update(updates)
    .eq("poi_id", id);
  if (error) throw error;
  return data;
};

// Delete a POI (for admin use)
export const deletePOI = async (id: string) => {
  const { data, error } = await supabase
    .from("poi_markers")
    .delete()
    .eq("poi_id", id);
  if (error) throw error;
  return data;
};

/** =========================
 *  User Preferences Table
 *  - Each user can only have one set of preferences.
 ============================ */
// Get preferences for a specified user
export const getUserPreferences = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
};

// Insert a set of preferences for a user (insert multiple records at once)
// Request body should contain the user_id and an array of preferences.
export const addUserPreferences = async (userId: string, preferences: any[]) => {
  const prefs = preferences.map((pref) => ({ ...pref, user_id: userId }));
  const { data, error } = await supabase
    .from("user_preferences")
    .insert(prefs);
  if (error) throw error;
  return data;
};

// Update a specific user preference by preference_type
export const updateUserPreference = async (userId: string, preferenceType: string, updates: any) => {
  const { data, error } = await supabase
    .from("user_preferences")
    .update(updates)
    .eq("user_id", userId)
    .eq("preference_type", preferenceType);
  if (error) throw error;
  return data;
};

// Delete a specific user preference by preference_type
export const deleteUserPreference = async (userId: string, preferenceType: string) => {
  const { data, error } = await supabase
    .from("user_preferences")
    .delete()
    .eq("user_id", userId)
    .eq("preference_type", preferenceType);
  if (error) throw error;
  return data;
};

/** =========================
 *  Saved Groups Table (User's Collections)
 ============================ */
// Get all saved groups for a specified user
export const getSavedGroupsByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from("saved_groups")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
};

// Insert a new saved group
export const addSavedGroup = async (group: any) => {
  const { data, error } = await supabase
    .from("saved_groups")
    .insert([group]);
  if (error) throw error;
  return data;
};

// Update a saved group by group_id
export const updateSavedGroup = async (groupId: string, updates: any) => {
  const { data, error } = await supabase
    .from("saved_groups")
    .update(updates)
    .eq("group_id", groupId);
  if (error) throw error;
  return data;
};

// Delete a saved group by group_id
export const deleteSavedGroup = async (groupId: string) => {
  const { data, error } = await supabase
    .from("saved_groups")
    .delete()
    .eq("group_id", groupId);
  if (error) throw error;
  return data;
};

/** =========================
 *  Saved Properties Table (User's Own Property Records)
 *  - Contains detailed property info provided by the user.
 ============================ */
// Get all saved properties for a specified user (using the saved_groups relation)
export const getSavedPropertiesByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from("saved_properties")
    .select("*, saved_groups(user_id)")
    .eq("saved_groups.user_id", userId);
  if (error) throw error;
  return data;
};

// Insert a new saved property record
export const addSavedProperty = async (property: any) => {
  const { data, error } = await supabase
    .from("saved_properties")
    .insert([property]);
  if (error) throw error;
  return data;
};

// Update a saved property record by saved_property_id
export const updateSavedProperty = async (savedPropertyId: string, updates: any) => {
  const { data, error } = await supabase
    .from("saved_properties")
    .update(updates)
    .eq("saved_property_id", savedPropertyId);
  if (error) throw error;
  return data;
};

// Delete a saved property record by saved_property_id
export const deleteSavedProperty = async (savedPropertyId: string) => {
  const { data, error } = await supabase
    .from("saved_properties")
    .delete()
    .eq("saved_property_id", savedPropertyId);
  if (error) throw error;
  return data;
};

/** =========================
 *  Saved POIs Table (User's Own POI Records)
 *  - Contains detailed POI info provided by the user.
 ============================ */
// Get all saved POIs for a specified user (using the saved_groups relation)
export const getSavedPOIsByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from("saved_pois")
    .select("*, saved_groups(user_id)")
    .eq("saved_groups.user_id", userId);
  if (error) throw error;
  return data;
};

// Insert a new saved POI record
export const addSavedPOI = async (poi: any) => {
  const { data, error } = await supabase
    .from("saved_pois")
    .insert([poi]);
  if (error) throw error;
  return data;
};

// Update a saved POI record by saved_poi_id
export const updateSavedPOI = async (savedPoiId: string, updates: any) => {
  const { data, error } = await supabase
    .from("saved_pois")
    .update(updates)
    .eq("saved_poi_id", savedPoiId);
  if (error) throw error;
  return data;
};

// Delete a saved POI record by saved_poi_id
export const deleteSavedPOI = async (savedPoiId: string) => {
  const { data, error } = await supabase
    .from("saved_pois")
    .delete()
    .eq("saved_poi_id", savedPoiId);
  if (error) throw error;
  return data;
};

/** =========================
 *  Crime Data Table (Auxiliary)
 ============================ */
// Get all crime data records
export const getCrimeData = async () => {
  const { data, error } = await supabase
    .from("crime_data")
    .select("*");
  if (error) throw error;
  return data;
};

// Get crime data for a specific suburb
export const getCrimeDataBySuburb = async (suburb: string) => {
  const { data, error } = await supabase
    .from("crime_data")
    .select("*")
    .eq("suburb", suburb);
  if (error) throw error;
  return data;
};
