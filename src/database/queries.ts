import { supabase } from "./supabaseClient";

// get all properties
export const getAllProperties = async () => {
  const { data, error } = await supabase
    .from("properties")
    .select("*");
  if (error) throw error;
  return data;
};

// get property by id
export const getPropertyById = async (id: string) => {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

// insert a new property
export const addProperty = async (property: any) => {
  const { data, error } = await supabase
    .from("properties")
    .insert([property]);
  if (error) throw error;
  return data;
};
