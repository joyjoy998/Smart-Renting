"use client";

import { X } from "lucide-react";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import { Button } from "@/components/ui/button";
import { SliderWithPlusAndMinus } from "@/components/sidebar/preference/SliderWithPlusAndMinus";
import UserBudget from "./UserBudget";
// import { useBudgetStore } from "@/stores/useSettingsStore";

export function SettingsPopup() {
  const { isOpen, setOpen } = useSettingsStore();
  const { preferences, setPreference } = usePreferencesStore();
  // const { minPrice, maxPrice, setMinPrice, setMaxPrice } = useBudgetStore();
  // console.log("minPrice", minPrice);
  // console.log("maxPrice", maxPrice);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-[2000]"
        onClick={() => setOpen(false)}
      />
      <div className="fixed inset-0 flex items-center justify-center z-[2001]">
        <div
          data-testid="settings-dialog"
          className="bg-background rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Settings</h2>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-8">
            <div data-testid="distance-setting">
              <h3 className="font-medium mb-4">Distance to POIs</h3>
              <SliderWithPlusAndMinus
                label="Distance"
                initialValue={preferences.distance}
                onChange={(value) => setPreference("distance", value)}
              />
            </div>

            <div data-testid="price-sensitivity-setting">
              <h3 className="font-medium mb-4">Price Sensitivity</h3>
              <SliderWithPlusAndMinus
                label="Price"
                initialValue={preferences.price}
                onChange={(value) => setPreference("price", value)}
              />
            </div>

            <div data-testid="safety-setting">
              <h3 className="font-medium mb-4">Neighborhood Safety</h3>
              <SliderWithPlusAndMinus
                label="Neighborhood Safety"
                initialValue={preferences.neighborhoodSafety}
                onChange={(value) => setPreference("neighborhoodSafety", value)}
              />
            </div>

            <div data-testid="amenity-setting">
              <h3 className="font-medium mb-4">Amenity Priorities</h3>
              <SliderWithPlusAndMinus
                label="Amenity"
                initialValue={preferences.amenity}
                onChange={(value) => setPreference("amenity", value)}
              />
            </div>

            <div data-testid="budget-setting">
              <h3 className="font-medium mb-4">Budget Range</h3>
              <UserBudget />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
