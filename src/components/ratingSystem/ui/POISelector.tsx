import { useRatingStore } from "../store/ratingStore";

const POISelector = () => {
  const { pois, selectedPOI, setSelectedPOI } = useRatingStore();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const poi = pois.find((p) => p.poi_id === event.target.value);
    if (poi) {
      setSelectedPOI(poi); // 更新 Zustand 状态
    }
  };

  return (
    <select
      className="border rounded px-2 py-1"
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
  );
};

export default POISelector;
