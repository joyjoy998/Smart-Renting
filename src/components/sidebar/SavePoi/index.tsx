import { Modal, Typography, Box, IconButton } from "@mui/material";
import { BookmarkCheck, DeleteIcon } from "lucide-react";
import React from "react";
import useSavedDataStore from "@/stores/useSavedData";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import useMapStore from "@/stores/useMapStore";
import { useSnackbar } from "notistack";
import { PropertyInfo } from "@/components/maps/MapContent";

const DEFAULT_IMAGE_URL = "/property-unavailable.png";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 2,
};

const SavePoiModal = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = React.useState(false);
  const savedPois = useSavedDataStore.use.savedPois() as PropertyInfo[];
  const setSavedPois = useSavedDataStore.use.setSavedPois();
  const setCurrentGeometry = useMapStore.use.setCurrentGeometry();
  const setCurrentInfoWindow = useMapStore.use.setCurrentInfoWindow();

  const refreshData = () => {
    axios.get("/api/savedPois").then((res) => {
      if (res.status === 200) {
        setSavedPois(res.data);
      }
    });
  };
  const handleRemove = async (savedPoi) => {
    const response = await axios.delete("/api/savedPois", {
      params: {
        group_id: savedPoi.group_id,
        place_id: savedPoi.place_id,
      },
    });
    if (response.status === 200) {
      refreshData();
      enqueueSnackbar("Removed successfully!", { variant: "success" });
    }
  };

  const toggle = () => {
    setOpen(!open);
  };

  return (
    <div>
      <button
        className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg"
        onClick={toggle}
      >
        <BookmarkCheck className="h-5 w-5" />
        <span>Saved POI</span>
      </button>

      <Modal open={open} onClose={toggle}>
        <Box sx={style}>
          <Typography sx={{ mt: 2, mb: 2 }} variant="h6" component="div">
            Saved POIs
          </Typography>

          <div className="flex flex-col space-y-4">
            {savedPois.map((item: PropertyInfo, index) => {
              if (!item) return null;
              const images: string[] =
                Array.isArray(item.photo) && item.photo.length > 0
                  ? item.photo.filter((p): p is string => typeof p === "string")
                  : [DEFAULT_IMAGE_URL];

              return (
                <div
                  key={`${item.place_id}-${index}`}
                  className="flex border rounded-lg overflow-hidden shadow-md cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setCurrentGeometry({
                      lat: item.latitude,
                      lng: item.longitude,
                    });
                    setCurrentInfoWindow(item);
                    setOpen(false);
                  }}
                >
                  {/* Left: Swiper */}
                  <div className="w-1/3 relative">
                    <Swiper
                      modules={[Navigation, Pagination]}
                      navigation
                      pagination={{ clickable: true }}
                      className="h-full"
                    >
                      {images.map((img, i) => (
                        <SwiperSlide key={i}>
                          <img
                            src={img}
                            alt={item.name ?? ""}
                            className="w-full h-full max-h-48 object-cover rounded-lg aspect-[4/5]"
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>

                  {/* Right: Info */}
                  <div className="w-2/3 p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <p className="text-lg font-semibold text-gray-900">
                        {item.name ?? "Unnamed POI"}
                      </p>
                      <IconButton onClick={() => handleRemove(item)}>
                        <DeleteIcon />
                      </IconButton>
                    </div>

                    <p className="text-gray-700">
                      {[item.street, item.suburb, item.state, item.postcode]
                        .filter(Boolean)
                        .join(", ") || "No address"}
                    </p>

                    <p className="text-gray-600 mt-2">
                      POI Type:
                      {item.category ?? "POI"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default SavePoiModal;
