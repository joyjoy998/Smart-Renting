import { useRatingStore } from "../../stores/ratingStore";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const TravelModeSelector = () => {
  const { travelMode, setTravelMode } = useRatingStore();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTravelMode(event.target.value as "WALKING" | "DRIVING" | "TRANSIT");
  };

  return (
    <div className="relative w-full">
      <select
        className={cn(
          "w-full border rounded px-4 py-1 truncate appearance-none",
          isDark
            ? "bg-gray-800 border-gray-700 text-gray-200"
            : "bg-white border-gray-300 text-gray-800"
        )}
        value={travelMode}
        onChange={handleChange}
      >
        <option value="WALKING">Walking</option>
        <option value="DRIVING">Driving</option>
        <option value="TRANSIT">Public Transit</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg
          className={cn("h-4 w-4", isDark ? "text-gray-400" : "text-gray-500")}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
};

export default TravelModeSelector;
