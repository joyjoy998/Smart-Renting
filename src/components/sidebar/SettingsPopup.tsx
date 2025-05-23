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
          className="bg-background rounded-lg p-6 w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Settings</h2>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Preferences Section */}
            <div>
              <h3 className="font-medium mb-4">Preferences</h3>
              <div className="space-y-4">
                <SliderWithPlusAndMinus
                  label="Distance"
                  initialValue={preferences.distance}
                  onChange={(value: number) => setPreference("distance", value)}
                />
                <SliderWithPlusAndMinus
                  label="Price"
                  initialValue={preferences.price}
                  onChange={(value: number) => setPreference("price", value)}
                />
                <SliderWithPlusAndMinus
                  label="Neighborhood Safety"
                  initialValue={preferences.neighborhoodSafety}
                  onChange={(value: number) =>
                    setPreference("neighborhoodSafety", value)
                  }
                />
                <SliderWithPlusAndMinus
                  label="Amenity"
                  initialValue={preferences.amenity}
                  onChange={(value: number) => setPreference("amenity", value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* User Budget */}
              <div>
                <UserBudget />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </div>
      </div>
    </>
  );
}
