/**
 * Service for fetching all data required for the rating system
 */

export async function fetchUserPreferences(userId: string) {
  try {
    const response = await fetch(`/api/preferences?user_id=${userId}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch user preferences");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return [];
  }
}

export async function fetchGroupRatingData(groupData: any) {
  try {
    const { group } = groupData;

    if (!group) {
      return {
        group: null,
        properties: [],
        pois: [],
        preferences: [],
      };
    }

    const preferences = await fetchUserPreferences(group.user_id);

    return {
      ...groupData,
      preferences,
    };
  } catch (error) {
    console.error("Error fetching group rating data:", error);
    return {
      group: null,
      properties: [],
      pois: [],
      preferences: [],
    };
  }
}
