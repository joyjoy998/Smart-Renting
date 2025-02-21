import { supabase } from "./supabaseClient";

// 获取所有房源
export const getAllProperties = async () => {
  const { data, error } = await supabase
    .from("properties")
    .select("*");
  if (error) throw error;
  return data;
};

// 根据 ID 获取房源
export const getPropertyById = async (id: string) => {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

// 插入新房源
export const addProperty = async (property: any) => {
  const { data, error } = await supabase
    .from("properties")
    .insert([property]);
  if (error) throw error;
  return data;
};
