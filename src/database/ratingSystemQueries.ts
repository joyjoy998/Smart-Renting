import { useAuthStore } from "@/stores/useAuthStore";
import {
  getSavedGroupsByUser,
  getSavedPropertiesByUser,
  getSavedPOIsByUser,
  getUserPreferences,
} from "@/database/queries";

export const fetchLatestGroupData = async () => {
  const { user } = useAuthStore();

  if (!user) {
    console.error("User not authenticated");
    return { group: null, properties: [], pois: [], preferences: null };
  }

  try {
    const groups = await getSavedGroupsByUser(user.id);
    if (groups.length === 0) {
      return { group: null, properties: [], pois: [], preferences: null };
    }

    const sortedGroups = [...groups].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const latestGroup = sortedGroups[0];

    const allProperties = await getSavedPropertiesByUser(user.id);
    const groupProperties = allProperties.filter(
      (property) => property.group_id === latestGroup.group_id
    );

    const allPois = await getSavedPOIsByUser(user.id);
    const groupPois = allPois.filter(
      (poi) => poi.group_id === latestGroup.group_id
    );

    const preferences = await getUserPreferences(user.id);

    return {
      group: latestGroup,
      properties: groupProperties,
      pois: groupPois,
      preferences: preferences || [],
    };
  } catch (error) {
    console.error("Error fetching latest group data:", error);
    return { group: null, properties: [], pois: [], preferences: null };
  }
};
