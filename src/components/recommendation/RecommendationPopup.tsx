import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRecommendationStore } from "@/stores/useRecommendationStore";
import useSavedDataStore from "@/stores/useSavedData";
import { Button } from "@/components/ui/button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import FavoriteButton from "./FavoriteButton";
import { useRatingStore } from "@/stores/ratingStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useBudgetStore } from "@/stores/useSettingsStore";
import { useGroupIdStore } from "@/stores/useGroupStore";
import { useMapLocationStore } from "@/stores/useMapLocationStore";
import { useUser } from "@clerk/nextjs";

const DEFAULT_IMAGE_URL = "/property-unavailable.png";

const RecommendationPopup = () => {
  const {
    isRecommendationOpen,
    toggleRecommendation,
    recommendedProperties,
    fetchRecommendations,
  } = useRecommendationStore();

  const savedProperties = useSavedDataStore.use.savedProperties();
  const hasStarredProperties = savedProperties.length > 0;
  const { user } = useUser();
  const userId = user?.id ?? null;
  const { currentGroupId } = useGroupIdStore();
  const groupId = currentGroupId;
  const { minPrice, maxPrice } = useBudgetStore();

  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 5;
  const [shouldRefetchOnNextPage, setShouldRefetchOnNextPage] = useState(false);
  const { mapLocation } = useMapLocationStore();

  useEffect(() => {
    if (isRecommendationOpen) {
      setPage(0);
      if (!userId || !groupId) {
        setShowWarning(true);
        setTimeout(() => {
          setShowWarning(false);
          toggleRecommendation();
        }, 2000);
      } else {
        setLoading(true);
        fetchRecommendations(
          userId,
          groupId,
          minPrice,
          maxPrice,
          mapLocation?.lat,
          mapLocation?.lng
        ).finally(() => {
          setLoading(false);
        });
      }
    }
  }, [isRecommendationOpen, fetchRecommendations]);

  // Get only the current page's properties
  const currentPageProperties = recommendedProperties.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  const handleNext = async () => {
    if (shouldRefetchOnNextPage) {
      setLoading(true);
      await fetchRecommendations(
        userId!,
        groupId!,
        minPrice,
        maxPrice,
        mapLocation?.lat,
        mapLocation?.lng
      );
      setShouldRefetchOnNextPage(false);
      setLoading(false);
    }

    setPage((prev) => {
      const nextPage = prev + 1;
      const maxPage =
        Math.ceil(recommendedProperties.length / ITEMS_PER_PAGE) - 1;
      return Math.min(nextPage, maxPage);
    });
  };

  return (
    <Dialog open={isRecommendationOpen} onOpenChange={toggleRecommendation}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recommended Properties</DialogTitle>
          <DialogDescription>
            {showWarning
              ? "Please login to see recommendations."
              : groupId
              ? "Based on your saved properties and points of interest."
              : "Properties near your current map view."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          {showWarning ? (
            <p className="text-center text-red-400 font-bold">
              Please login to see recommendations.
            </p>
          ) : loading ? (
            <p className="text-center text-blue-400 font-bold">
              Loading recommendations...
            </p>
          ) : recommendedProperties.length > 0 ? (
            <div className="flex flex-col space-y-4">
              {currentPageProperties.map((property) => {
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
                        <FavoriteButton
                          propertyId={property.property_id}
                          placeData={property}
                          onFavorite={() => setShouldRefetchOnNextPage(true)}
                        />
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
            <Button
              className="w-1/2"
              onClick={async () => {
                const { currentGroupId } = useRecommendationStore.getState();
                if (!currentGroupId) {
                  alert("Missing group ID");
                  return;
                }

                const result = await fetch(
                  `/api/getSavedGroupsByID?groupId=${currentGroupId}`
                );
                const data = await result.json();

                if (data.success) {
                  await useRatingStore.getState().loadData(data.data);
                  useRatingStore.getState().setOpen(true);
                  toggleRecommendation();
                } else {
                  alert("Failed to get group data");
                }
              }}
              disabled={!groupId}>
              Comparison Report
            </Button>
            {recommendedProperties.length > (page + 1) * ITEMS_PER_PAGE && (
              <Button className="w-1/2" onClick={handleNext}>
                Next Page
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecommendationPopup;
