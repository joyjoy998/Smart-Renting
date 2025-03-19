import { useRatingStore } from "../store/ratingStore";

const POISelector = () => {
  const { pois, selectedPOI, setSelectedPOI } = useRatingStore();

  // 简化的变更处理器，直接设置选中的 POI
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const poi = pois.find((p) => p.poi_id === event.target.value);
    if (poi) {
      console.log("Selected POI:", poi);
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
