import React from "react";
import { useRatingStore } from "@/stores/ratingStore";
import { useRecommendationStore } from "@/stores/useRecommendationStore";

const RecommendationSection = () => {
  const { setOpen: setRatingOpen } = useRatingStore();
  const { setOpen: setRecommendationOpen } = useRecommendationStore();

  const handleViewRecommendations = () => {
    setRatingOpen(false); // close RatingReport
    setRecommendationOpen(true); // open RecommendationPopup
  };

  return (
    <div className="border p-4 rounded-lg bg-gray-100 text-center">
      <button
        onClick={handleViewRecommendations}
        className="mt-2 text-blue-500 underline hover:text-blue-700"
      >
        View Recommendations
      </button>
    </div>
  );
};

export default RecommendationSection;
