import { SliderWithPlusAndMinus } from "@/components/sidebar/preference/SliderWithPlusAndMinus";
import { useRatingStore } from "@/stores/ratingStore";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import { useEffect, useRef } from "react";

const PreferencePanel = () => {
  const { weightConfig, updateWeight, syncWithPreferences } = useRatingStore();
  const { preferences } = usePreferencesStore();

  const userAdjustedRef = useRef({
    distance: false,
    price: false,
    neighborhood_safety: false,
    amenity: false,
  });

  useEffect(() => {
    syncWithPreferences();
  }, []);

  useEffect(() => {
    const needSync = {
      distance:
        !userAdjustedRef.current.distance &&
        weightConfig.distance !== preferences.distance,
      price:
        !userAdjustedRef.current.price &&
        weightConfig.price !== preferences.price,
      neighborhood_safety:
        !userAdjustedRef.current.neighborhood_safety &&
        weightConfig.neighborhood_safety !== preferences.neighborhoodSafety,
      amenity:
        !userAdjustedRef.current.amenity &&
        weightConfig.amenity !== preferences.amenity,
    };

    if (Object.values(needSync).some(Boolean)) {
      if (needSync.distance) updateWeight("distance", preferences.distance);
      if (needSync.price) updateWeight("price", preferences.price);
      if (needSync.neighborhood_safety)
        updateWeight("neighborhood_safety", preferences.neighborhoodSafety);
      if (needSync.amenity) updateWeight("amenity", preferences.amenity);
    }
  }, [preferences, weightConfig]);

  const handleSliderChange = (key: string, value: number) => {
    userAdjustedRef.current[key as keyof typeof userAdjustedRef.current] = true;
    updateWeight(key as any, value);
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <SliderWithPlusAndMinus
        label="Distance"
        initialValue={weightConfig.distance}
        onChange={(value: number) => handleSliderChange("distance", value)}
      />
      <SliderWithPlusAndMinus
        label="Price"
        initialValue={weightConfig.price}
        onChange={(value: number) => handleSliderChange("price", value)}
      />
      <SliderWithPlusAndMinus
        label="Neighborhood Safety"
        initialValue={weightConfig.neighborhood_safety}
        onChange={(value: number) =>
          handleSliderChange("neighborhood_safety", value)
        }
      />
      <SliderWithPlusAndMinus
        label="Amenity"
        initialValue={weightConfig.amenity}
        onChange={(value: number) => handleSliderChange("amenity", value)}
      />
    </div>
  );
};

export default PreferencePanel;
