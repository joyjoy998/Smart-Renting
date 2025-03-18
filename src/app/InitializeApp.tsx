"use client";

import { useFetchGroups } from "@/hooks/fetchData/useFetchGroups";
import { useEffect } from "react";

export function InitializeApp() {
  const { error } = useFetchGroups();

  useEffect(() => {
    if (error) {
      console.error("Error fetching groups:", error);
    }
  }, [error]);

  return null;
}
