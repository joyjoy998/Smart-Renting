import { useRatingStore } from "../store/ratingStore";

const POISelector = () => {
  const { pois, selectedPOI, setSelectedPOI } = useRatingStore();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const poi = pois.find((p) => p.poi_id === event.target.value);
    if (poi) {
      setSelectedPOI(poi);
    }
  };

  return (
    <div className="relative w-full">
      <select
        className="w-full border rounded px-4 py-1 truncate appearance-none bg-white"
        value={selectedPOI?.poi_id || ""}
        onChange={handleChange}
      >
        <option value="" disabled>
          Select POI
        </option>
        {pois.map((poi) => (
          <option key={poi.poi_id} value={poi.poi_id}>
            {poi.address.split(",")[0]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default POISelector;
