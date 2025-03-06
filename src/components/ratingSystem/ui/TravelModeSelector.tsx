import { useRatingStore } from "../store/ratingStore";

const TravelModeSelector = () => {
  const { travelMode, setTravelMode } = useRatingStore();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTravelMode(event.target.value as "WALKING" | "DRIVING" | "TRANSIT");
  };

  return (
    <select
      className="border rounded px-2 py-1"
      value={travelMode}
      onChange={handleChange}
    >
      <option value="WALKING">🚶 Walking</option>
      <option value="DRIVING">🚗 Driving</option>
      <option value="TRANSIT">🚌 Public Transit</option>
    </select>
  );
};

export default TravelModeSelector;
