import { useRatingStore } from "../../stores/ratingStore";

const TravelModeSelector = () => {
  const { travelMode, setTravelMode } = useRatingStore();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTravelMode(event.target.value as "WALKING" | "DRIVING" | "TRANSIT");
  };

  return (
    <div className="relative w-full">
      <select
        className="w-full border rounded px-4 py-1 truncate appearance-none bg-white"
        value={travelMode}
        onChange={handleChange}
      >
        <option value="WALKING">Walking</option>
        <option value="DRIVING">Driving</option>
        <option value="TRANSIT">Public Transit</option>
      </select>
    </div>
  );
};

export default TravelModeSelector;
