import React from "react";
import { useTravelTime } from "@/components/ratingSystem/hooks/useTravelTime";
import { useLocationStore } from "@/components/ratingSystem/store/locationStore";
import { useTravelModeStore } from "@/components/ratingSystem/store/useTravelModeStore";

const RatingPageTest = () => {
  const { travelTimes, scores } = useTravelTime();
  const { properties } = useLocationStore();
  const { mode, setMode } = useTravelModeStore();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Comparison Report</h1>

      {/* 交通方式切换 */}
      <div className="flex gap-2">
        {["walking", "driving", "transit"].map((option) => (
          <button
            key={option}
            className={`px-4 py-2 rounded ${
              mode === option ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setMode(option as "walking" | "driving" | "transit")}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {/* 房源评分 & 时间 */}
      <table className="table-auto w-full mt-4 border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Property</th>
            <th className="p-2">Total Score</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property.property_property_id} className="border-t">
              <td className="p-2">{property.address}</td>
              <td className="p-2">
                {scores[property.property_property_id]?.toFixed(2) ||
                  "Calculating..."}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RatingPageTest;
