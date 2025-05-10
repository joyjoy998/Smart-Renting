"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { useCheckedStore } from "@/stores/useCheckedStore";

export const useCheckUser = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { setisChecked } = useCheckedStore();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const checkUser = async () => {
      setError(null);

      try {
        const response = await axios.post("/api/checkUser");
        if (response.data.success) {
          console.log("User validated successfully");
          setisChecked(true);
        } else {
          setError(response.data.error || "Failed to validate user");
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.error || "Error validating user");
        }
        console.error("Error validating user:", error);
      }
    };
    checkUser();
  }, [isSignedIn, isLoaded]);
  return { error };
};
