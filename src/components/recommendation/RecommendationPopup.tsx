import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRecommendationStore } from "@/stores/useRecommendationStore";
import { useStarPropertyStore } from "@/stores/useStarPropertyStore"; // Import Zustand store for starred properties
import { Button } from "@/components/ui/button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import FavoriteButton from "./FavoriteButton";
import { useRatingStore } from "@/components/ratingSystem/store/ratingStore";
import { useSidebarStore } from "@/stores/useSidebarStore";

const DEFAULT_IMAGE_URL = "/property-unavailable.png";

const RecommendationPopup = () => {
  const {
    isRecommendationOpen,
    toggleRecommendation,
    recommendedProperties,
    fetchRecommendations,
  } = useRecommendationStore();

  const { starredProperties } = useStarPropertyStore(); // Retrieve starred properties
  const hasStarredProperties = starredProperties.size > 0; // Check if at least one property is starred

  const userId = "user3";
  const groupId = "5";
  const minBudget = "";
  const maxBudget = "";

  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isRecommendationOpen) {
      if (!userId || !groupId) {
        setShowWarning(true);
        setTimeout(() => {
          setShowWarning(false);
          toggleRecommendation();
        }, 2000);
      } else {
        setLoading(true);
        fetchRecommendations(userId, groupId, minBudget, maxBudget).finally(
          () => {
            setLoading(false);
          }
        );
      }
    }
  }, [isRecommendationOpen, fetchRecommendations]);

  return (
    <Dialog open={isRecommendationOpen} onOpenChange={toggleRecommendation}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recommended Properties</DialogTitle>
          <DialogDescription>
            {showWarning
              ? "Please select properties of interest on the map."
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          {showWarning ? (
            <p className="text-center text-red-400 font-bold">
              Please select properties of interest on the map.
            </p>
          ) : loading ? (
            <p className="text-center text-blue-400 font-bold">
              Loading recommendations...
            </p>
          ) : recommendedProperties.length > 0 ? (
            <div className="flex flex-col space-y-4">
              {recommendedProperties.map((property) => {
                const images =
                  Array.isArray(property.photo) && property.photo.length > 0
                    ? property.photo
                    : [DEFAULT_IMAGE_URL];

                return (
                  <div
                    key={property.property_id}
                    className="flex border rounded-lg overflow-hidden shadow-md">
                    {/* Left side image slider */}
                    <div className="w-1/3 relative">
                      <Swiper
                        modules={[Navigation, Pagination]}
                        navigation
                        pagination={{ clickable: true }}
                        className="h-full">
                        {images.map((image, index) => (
                          <SwiperSlide key={index}>
                            <img
                              src={image}
                              alt={`${property.street}, ${property.suburb}`}
                              className="w-full h-full max-h-48 object-cover rounded-lg aspect-[4/5]"
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>

                    {/* Right side property details */}
                    <div className="w-2/3 p-4 flex flex-col justify-between">
                      {/* Row 1 - Price & Favorite */}
                      <div className="flex justify-between items-center">
                        <p className="text-xl font-bold">
                          ${property.weekly_rent} per week
                        </p>
                        <Button variant="ghost" className="flex items-center">
                          <FavoriteButton propertyId={property.property_id} />
                        </Button>
                      </div>

                      {/* Row 2 - Address */}
                      <p className="text-gray-700 text-lg">
                        {property.street}, {property.suburb}
                      </p>

                      {/* Row 3 - Property Details */}
                      <div className="flex items-center space-x-4 text-gray-600 mt-2">
                        <span>
                          🛏 {property.bedrooms}{" "}
                          {property.bedrooms === 1 ? "Bed" : "Beds"}
                        </span>
                        <span>
                          🛁 {property.bathrooms}{" "}
                          {property.bathrooms === 1 ? "Bath" : "Baths"}
                        </span>
                        <span>
                          🚗 {property.parking_spaces}{" "}
                          {property.parking_spaces === 1
                            ? "Parking Space"
                            : "Parking Spaces"}
                        </span>
                      </div>

                      {/* Property Type */}
                      <p className="text-gray-600 mt-2">
                        {property.property_type}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No recommended properties available
            </p>
          )}

          {/* Bottom button section */}
          <div className="flex justify-between mt-4">
            {/* Comparison Report button */}
            <Button
              className="w-1/2 ml-2"
              onClick={() => {
                useRatingStore.getState().setOpen(true); // Open Report Generation
                useSidebarStore.getState().setOpen(false); // Close Sidebar
                toggleRecommendation(); // Close RecommendationPopup
              }}
              disabled={!hasStarredProperties} // Only enabled if at least one property is starred
            >
              Comparison Report
            </Button>
            {/* Right side Close button */}
            <Button
              variant="outline"
              className="w-1/2 ml-2"
              onClick={toggleRecommendation}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecommendationPopup;
