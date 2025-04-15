"use client";

import { useFetchGroups } from "@/hooks/fetchData/useFetchGroups";
import { useEffect } from "react";
import { useCheckUser } from "@/hooks/fetchData/useCheckUser";

export function InitializeApp() {
  try {
    const { error } = useCheckUser();

    useEffect(() => {
      if (error) {
        console.error("Error checking user:", error);
      }
    }, [error]);
  } catch (error) {
    console.error("Error in InitializeApp:", error);
    return null;
  }

  try {
    const { error } = useFetchGroups();

    useEffect(() => {
      if (error) {
        console.error("Error fetching groups:", error);
      }
    }, [error]);

    return null;
  } catch (error) {
    console.error("Error in InitializeApp:", error);
    return null;
  }
}
