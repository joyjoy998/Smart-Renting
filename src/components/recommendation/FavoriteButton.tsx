import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useGroupIdStore } from "@/stores/useGroupStore";
import useSavedDataStore from "@/stores/useSavedData";
import type { Property } from "@/types/property";

const FavoriteButton = ({
  propertyId,
  placeData,
  onFavorite,
}: {
  propertyId: string | number;
  placeData: any;
  onFavorite?: () => void;
}) => {
  const savedProperties = useSavedDataStore.use.savedProperties();
  const isStarred = savedProperties.some(
    (p) => p.place_id === placeData.place_id
  );
  const { enqueueSnackbar } = useSnackbar();
  const { currentGroupId } = useGroupIdStore();
  const groupId = currentGroupId;

  const setSavedProperties = useSavedDataStore.use.setSavedProperties();

  const handleToggleStar = async () => {
    if (!isStarred) {
      //Check if user has already saved 6 properties
      if (savedProperties.length >= 6) {
        enqueueSnackbar(
          "You can save up to 6 properties. Please remove a property before adding a new one.",
          {
            variant: "warning",
          }
        );
        return;
      }

      const payload: Property = {
        saved_property_id: Math.floor(Math.random() * 1000000),
        group_id: groupId,
        property_id: propertyId,
        street: placeData.street,
        suburb: placeData.suburb,
        state: placeData.state,
        postcode: placeData.postcode,
        latitude: placeData.latitude,
        longitude: placeData.longitude,
        weekly_rent: placeData.weekly_rent,
        photo: placeData.photo || [],
        bedrooms: placeData.bedrooms,
        bathrooms: placeData.bathrooms,
        parking_spaces: placeData.parking_spaces,
        property_type: placeData.property_type || "Unknown",
        safety_score: placeData.safety_score || 0,
        place_id: placeData.place_id || "",
      };

      try {
        const response = await axios.post("/api/savedProperties", payload);
        if (response.status === 200) {
          enqueueSnackbar("Property saved successfully", {
            variant: "success",
          });

          setSavedProperties([
            ...useSavedDataStore.getState().savedProperties,
            payload,
          ]);

          if (onFavorite) {
            onFavorite();
          }
        }
      } catch (error) {
        console.error("Error saving property:", error);
        enqueueSnackbar("Failed to save property", { variant: "error" });
      }
    } else {
      // if stared, remove
      try {
        console.log(
          "Deleting property with groupId:",
          groupId,
          "propertyId:",
          propertyId
        );
        const response = await axios.delete("/api/savedProperties", {
          params: {
            group_id: groupId,
            property_id: propertyId,
          },
        });
        if (response.status === 200) {
          enqueueSnackbar("Property removed successfully", {
            variant: "success",
          });

          setSavedProperties(
            useSavedDataStore
              .getState()
              .savedProperties.filter((p) => p.place_id !== placeData.place_id)
          );
        }
      } catch (error) {
        console.error("Error removing property:", error);
        enqueueSnackbar("Failed to remove property", { variant: "error" });
      }
    }
  };

  return (
    <Button
      variant="ghost"
      className="flex items-center"
      onClick={handleToggleStar}>
      <Star
        className={`h-6 w-6 transition-colors ${
          isStarred ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
        }`}
      />
    </Button>
  );
};

export default FavoriteButton;
