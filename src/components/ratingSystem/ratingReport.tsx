"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import PreferencePanel from "./PreferencePanel";
import ScoreTable from "./ScoreTable";
import RecommendationSection from "./RecommendationSection";
import { useRatingStore } from "@/stores/ratingStore";

const RatingReport = () => {
  const { isOpen, setOpen } = useRatingStore();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-[2000]"
        onClick={() => setOpen(false)}
      />
      <div className="fixed inset-0 flex items-center justify-center z-[2001]">
        <div
          className="bg-background rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Rating Report</h2>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-8">
            {/* 1. User Preference Setting */}
            <section>
              <h3 className="font-medium mb-4">Preference Settings</h3>
              <PreferencePanel />
            </section>

            {/* 2. Rating Report */}
            <section>
              <h3 className="font-medium mb-4">Scoring Report</h3>
              <ScoreTable />
            </section>

            {/* 3. Recommendations */}
            <section>
              <h3 className="font-medium mb-4">Recommended Properties</h3>
              <RecommendationSection />
            </section>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RatingReport;
