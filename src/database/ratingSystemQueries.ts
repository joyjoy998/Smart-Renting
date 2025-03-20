import { useAuthStore } from "@/stores/useAuthStore";
import {
  getSavedGroupsByUser,
  getSavedPropertiesByUser,
  getSavedPOIsByUser,
  getUserPreferences,
} from "@/database/queries";

export const fetchLatestGroupData = async () => {
  const user = useAuthStore.getState().user;

  if (!user) {
    console.error("User not authenticated");
    //return { group: null, properties: [], pois: [], preferences: null };
  }

  try {
    //test
    const userId = "user1";

    const groups = await getSavedGroupsByUser(userId);
    if (groups.length === 0) {
      return { group: null, properties: [], pois: [], preferences: null };
    }

    const sortedGroups = [...groups].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const latestGroup = sortedGroups[0];

    const allProperties = await getSavedPropertiesByUser(userId);
    const groupProperties = allProperties.filter(
      (property) => property.group_id === latestGroup.group_id
    );

    const allPois = await getSavedPOIsByUser(userId);
    const groupPois = allPois.filter(
      (poi) => poi.group_id === latestGroup.group_id
    );

    const preferences = await getUserPreferences(userId);

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
