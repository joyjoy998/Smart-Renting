import React, { useEffect, useState, useCallback } from "react";
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
import useMapStore from "@/stores/useMapStore";
import type { Property } from "@/types/property";

const DEFAULT_IMAGE_URL = "/property-unavailable.png";
// Define loading times
const MINIMUM_LOADING_TIME = 200; // 1 second minimum loading display
const DATABASE_DELAY = 2000; // 3 seconds database delay for synchronization
const FAVORITE_UPDATE_DELAY = 2000; // 2 seconds for favorite update message

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
  const [loadingMessage, setLoadingMessage] = useState("Finding properties that match your preferences...");
  const [loadingStage, setLoadingStage] = useState(0); // For tracking loading stages
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 5;
  const [shouldRefetchOnNextPage, setShouldRefetchOnNextPage] = useState(false);
  const { mapLocation } = useMapLocationStore();
  const setCurrentGeometry = useMapStore.use.setCurrentGeometry();
  const setCurrentInfoWindow = useMapStore.use.setCurrentInfoWindow();
  const [initialOpen, setInitialOpen] = useState(false); // Track if this is the initial opening
  
  // New state to track when a favorite action was performed
  const [favoriteActionPerformed, setFavoriteActionPerformed] = useState(false);
  
  // Use useCallback to wrap the handler function to avoid unnecessary recreations
  const handlePropertyClick = useCallback(
    (property: Property) => {
      // Set map location
      setCurrentGeometry({
        lat: property.latitude,
        lng: property.longitude,
      });

      // Set info window data with all necessary fields
      const infoWindowData = {
        ...property,
        name: `${property.street}, ${property.suburb}`,
        formatted_address: `${property.street}, ${property.suburb}`,
        geometry: {
          location: new google.maps.LatLng(
            property.latitude,
            property.longitude
          ),
        },
        types: ["property"],
        place_id: property.place_id,
        image: property.photo?.[0] || DEFAULT_IMAGE_URL,
        address: `${property.street}, ${property.suburb}`,
        savedProperty: property,
      } as google.maps.places.PlaceResult;

      setCurrentInfoWindow(infoWindowData);

      // Close recommendation popup
      toggleRecommendation();
    },
    [setCurrentGeometry, setCurrentInfoWindow, toggleRecommendation]
  );

  // Handle favorite action
  const handleFavoriteAction = useCallback(() => {
    setFavoriteActionPerformed(true);
    setLoading(true);
    setLoadingMessage("Updating your recommendations...");
    setLoadingStage(1);
    
    // Delay to show the update message
    setTimeout(() => {
      // Now fetch updated recommendations
      const startTime = Date.now();
      
      fetchRecommendations(
        userId!,
        groupId!,
        minPrice,
        maxPrice,
        mapLocation?.lat,
        mapLocation?.lng
      ).then(() => {
        // Calculate how long the fetch took
        const fetchTime = Date.now() - startTime;
        
        // Ensure minimum display time for the update message
        if (fetchTime < MINIMUM_LOADING_TIME) {
          return new Promise(resolve => setTimeout(resolve, MINIMUM_LOADING_TIME - fetchTime));
        }
      }).finally(() => {
        setLoading(false);
        setFavoriteActionPerformed(false);
        setShouldRefetchOnNextPage(false);
      });
    }, FAVORITE_UPDATE_DELAY);
  }, [userId, groupId, minPrice, maxPrice, mapLocation, fetchRecommendations]);

  // Effect to track when the dialog opens
  useEffect(() => {
    if (isRecommendationOpen && !initialOpen) {
      setInitialOpen(true);
    } else if (!isRecommendationOpen) {
      setInitialOpen(false);
    }
  }, [isRecommendationOpen]);

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
        setLoadingStage(0);
        setLoadingMessage("Finding properties that match your preferences...");
        
        // First wait for database to sync
        setTimeout(() => {
          setLoadingStage(1);
          
          // Now fetch recommendations after the database sync delay
          const startTime = Date.now();
          
          fetchRecommendations(
            userId,
            groupId,
            minPrice,
            maxPrice,
            mapLocation?.lat,
            mapLocation?.lng
          ).then(() => {
            setLoadingStage(2);
            
            // Calculate how long the fetch took
            const fetchTime = Date.now() - startTime;
            
            // Ensure total time meets minimum loading time
            const totalTimeSpent = fetchTime + DATABASE_DELAY;
            if (totalTimeSpent < MINIMUM_LOADING_TIME + DATABASE_DELAY) {
              const remainingTime = MINIMUM_LOADING_TIME + DATABASE_DELAY - totalTimeSpent;
              return new Promise(resolve => setTimeout(resolve, remainingTime));
            }
          }).finally(() => {
            setLoading(false);
          });
        }, DATABASE_DELAY);
      }
    }
  }, [
    isRecommendationOpen,
    fetchRecommendations,
    userId,
    groupId,
    minPrice,
    maxPrice,
    mapLocation,
    toggleRecommendation,
  ]);

  // Get only the current page's properties
  const currentPageProperties = recommendedProperties.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  const handleNext = async () => {
    if (shouldRefetchOnNextPage) {
      handleFavoriteAction(); // Use the same handler for consistency
    } else {
      setPage((prev) => {
        const nextPage = prev + 1;
        const maxPage =
          Math.ceil(recommendedProperties.length / ITEMS_PER_PAGE) - 1;
        return Math.min(nextPage, maxPage);
      });
    }
  };

  // Enhanced loading message with animation and stages
  const loadingUI = (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-center text-blue-500 font-medium">
        {loadingMessage}
      </p>
      <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 mt-4">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${(loadingStage + 1) * 33.3}%` }}></div>
      </div>
    </div>
  );

  return (
    <Dialog open={isRecommendationOpen} onOpenChange={toggleRecommendation}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recommended Properties</DialogTitle>
          <DialogDescription>
            {showWarning ? "Please login to see recommendations." : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          {showWarning ? (
            <p className="text-center text-red-400 font-bold">
              Please login to see recommendations.
            </p>
          ) : loading ? (
            loadingUI
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
                    className="flex border rounded-lg overflow-hidden shadow-md relative hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    onClick={() => handlePropertyClick(property)}>
                    {/* Left side image slider - prevent propagation */}
                    <div
                      className="w-1/3 relative z-10"
                      onClick={(e) => e.stopPropagation()}>
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
                        {/* MODIFIED: Favorite button with stopPropagation and updated handler */}
                        <div
                          className="z-10"
                          onClick={(e) => e.stopPropagation()}>
                          <FavoriteButton
                            propertyId={property.property_id}
                            placeData={property}
                            onFavorite={handleFavoriteAction}
                          />
                        </div>
                      </div>

                      {/* Row 2 - Address */}
                      <p className="text-gray-700 dark:text-gray-300 text-lg">
                        {property.street}, {property.suburb}
                      </p>

                      {/* Row 3 - Property Details */}
                      <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300 mt-2">
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
                      <p className="text-gray-600 dark:text-gray-300 mt-2">
                        {property.property_type}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-300">
              No recommended properties available. Try saving more properties to get recommendations.
            </p>
          )}

          {/* Bottom button section */}
          <div className="flex justify-around">
            <Button
              className="w-2/5"
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
              disabled={!userId || loading}>
              Comparison Report
            </Button>
            {recommendedProperties.length > (page + 1) * ITEMS_PER_PAGE && (
              <Button className="w-2/5" onClick={handleNext} disabled={!userId || loading}>
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
