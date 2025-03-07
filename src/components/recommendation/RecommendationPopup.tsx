import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRecommendationStore } from "@/stores/useRecommendationStore";
import { Button } from "@/components/ui/button";

const RecommendationPopup = () => {
  const {
    isRecommendationOpen,
    toggleRecommendation,
    recommendedProperties,
    fetchRecommendations,
  } = useRecommendationStore();

  // **user info**
  const userId = "user3"; // Replace with actual user_id
  const groupId = "5"; // Replace with actual group_id

  // **budget**
  const minBudget = "";
  const maxBudget = "";

  // **control loading status**
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(false); // add loading status

  useEffect(() => {
    if (isRecommendationOpen) {
      if (!userId || !groupId) {
        setShowWarning(true);
        setTimeout(() => {
          setShowWarning(false);
          toggleRecommendation();
        }, 2000);
      } else {
        // loading start
        setLoading(true);
        fetchRecommendations(userId, groupId, minBudget, maxBudget).finally(
          () => {
            // API calling finished,cancel loading
            setLoading(false);
          }
        );
      }
    }
  }, [isRecommendationOpen, fetchRecommendations]);

  return (
    <Dialog open={isRecommendationOpen} onOpenChange={toggleRecommendation}>
      <DialogContent
        title="Recommended Properties"
        aria-describedby="recommendation-description">
        <DialogHeader>
          <DialogTitle>Recommended Properties</DialogTitle>
          <DialogDescription id="recommendation-description">
            {showWarning
              ? "Please select properties of interest on the map."
              : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* warning */}
          {showWarning ? (
            <p className="text-center text-red-400 font-bold">
              Please select properties of interest on the map.
            </p>
          ) : loading ? (
            // **loading**
            <p className="text-center text-blue-400 font-bold">
              Loading recommendations...
            </p>
          ) : recommendedProperties.length > 0 ? (
            // **show recommendation**
            recommendedProperties.map((property) => (
              <div
                key={property.property_id}
                className="border p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold">
                  {property.street}, {property.suburb}
                </h3>
                <p>Rent: ${property.weekly_rent} / week</p>
                <p>
                  Bedrooms: {property.bedrooms} | Bathrooms:{" "}
                  {property.bathrooms} | Parking spaces:{" "}
                  {property.parking_spaces}
                </p>
                <p>Safety Score: {property.safety_score}</p>
                {property.final_score !== undefined && (
                  <p>
                    Recommendation Score: {property.final_score?.toFixed(2)}
                  </p>
                )}
              </div>
            ))
          ) : (
            // **no recommendation**
            <p className="text-center text-gray-500">
              No recommended properties available
            </p>
          )}
          <Button onClick={toggleRecommendation}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecommendationPopup;
