"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { useGroupIdStore, useGroupStore } from "@/stores/useGroupStore";
import { useCheckedStore } from "@/stores/useCheckedStore";

export const useFetchGroups = () => {
  const { setGroupId } = useGroupIdStore();
  const { isSignedIn, isLoaded } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { isChecked } = useCheckedStore();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchGroups = async () => {
      setError(null);

      try {
        const response = await axios.get("/api/groupId/get");
        if (response.data.success) {
          const groups = response.data.data;
          if (groups.length > 0) {
            useGroupStore.getState().setGroups(groups);
            const currentGroup = groups[groups.length - 1];
            setGroupId(currentGroup.group_id);
          }
        } else {
          setError(response.data.error || "Failed to fetch groups");
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.error || "Error validating user");
        }
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, [isSignedIn, isLoaded, isChecked]);
  return { error };
};
