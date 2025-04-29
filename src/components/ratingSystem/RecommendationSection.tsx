import React from "react";
import { useRatingStore } from "@/stores/ratingStore";
import { useRecommendationStore } from "@/stores/useRecommendationStore";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const RecommendationSection = () => {
  const { setOpen: setRatingOpen } = useRatingStore();
  const { setOpen: setRecommendationOpen } = useRecommendationStore();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleViewRecommendations = () => {
    setRatingOpen(false); // close RatingReport
    setRecommendationOpen(true); // open RecommendationPopup
  };

  return (
    <div
      className={cn(
        "border p-4 rounded-lg text-center",
        isDark
          ? "bg-gray-800 border-gray-700 text-gray-200"
          : "bg-gray-100 border-gray-300 text-gray-800"
      )}
    >
      <button
        onClick={handleViewRecommendations}
        className={cn(
          "mt-2 underline",
          isDark
            ? "text-blue-400 hover:text-blue-300"
            : "text-blue-500 hover:text-blue-700"
        )}
      >
        View Recommendations
      </button>
    </div>
  );
};

export default RecommendationSection;
