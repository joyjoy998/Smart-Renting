import React from "react";
import PreferencePanel from "./PreferencePanel";
import ScoreTable from "./ScoreTable";
import RecommendationSection from "./RecommendationSection";

const RatingReport = () => {
  return (
    <div className="container mx-auto p-6">
      {/* 1️⃣ User Preference Setting */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Preference Settings</h2>
        <PreferencePanel />
      </section>

      {/* 2️⃣ Rating Report */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Scoring Report</h2>
        <ScoreTable />
      </section>

      {/* 3️⃣ Recommendations */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Recommended Properties</h2>
        <RecommendationSection />
      </section>
    </div>
  );
};

export default RatingReport;
