import { useRatingStore } from "../store/ratingStore";

const TravelModeSelector = () => {
  const { travelMode, setTravelMode } = useRatingStore();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTravelMode(event.target.value as "walking" | "driving" | "transit");
  };

  return (
    <select
      className="border rounded px-2 py-1"
      value={travelMode}
      onChange={handleChange}
    >
      <option value="walking">🚶 Walking</option>
      <option value="driving">🚗 Driving</option>
      <option value="transit">🚌 Public Transit</option>
    </select>
  );
};

export default TravelModeSelector;
