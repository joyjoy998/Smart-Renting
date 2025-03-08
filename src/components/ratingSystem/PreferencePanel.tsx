import { SliderWithPlusAndMinus } from "@/components/sidebar/preference/SliderWithPlusAndMinus";
import { useRatingStore } from "@/components/ratingSystem/store/ratingStore";

const PreferencePanel = () => {
  const { weightConfig, updateWeight } = useRatingStore();

  return (
    <div className="grid grid-cols-2 gap-6">
      <SliderWithPlusAndMinus
        label="Distance"
        initialValue={weightConfig.distance}
        onChange={(value: number) => updateWeight("distance", value)}
      />
      <SliderWithPlusAndMinus
        label="Price"
        initialValue={weightConfig.price}
        onChange={(value: number) => updateWeight("price", value)}
      />
      <SliderWithPlusAndMinus
        label="Neighborhood Safety"
        initialValue={weightConfig.neighborhood_safety}
        onChange={(value: number) => updateWeight("neighborhood_safety", value)}
      />
      <SliderWithPlusAndMinus
        label="Amenity"
        initialValue={weightConfig.amenity}
        onChange={(value: number) => updateWeight("amenity", value)}
      />
    </div>
  );
};

export default PreferencePanel;
