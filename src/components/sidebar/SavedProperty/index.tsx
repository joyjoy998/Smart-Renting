import {
  Modal,
  Typography,
  Box,
  Grid2,
  List,
  ListItem,
  Avatar,
  IconButton,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { BookmarkCheck, DeleteIcon, FolderIcon, MapPin } from "lucide-react";
import React from "react";
import { nearbySearch, usePlacesService } from "@/hooks/map/usePlacesService";
import useSavedDataStore from "@/stores/useSavedData";
import axios from "axios";
import { PropertyInfo } from "@/components/maps/MapContent";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useSnackbar } from "notistack";
import useMapStore from "@/stores/useMapStore";
import { useSavedModalStore } from "@/stores/useSavedModalStore";

const DEFAULT_IMAGE_URL = "/property-unavailable.png";
type Props = { placeData: PropertyInfo };

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: 2,
  boxShadow: 24,
  p: 2,
};
const SavedPropertyModal = () => {
  const { enqueueSnackbar } = useSnackbar();
  const setCurrentGeometry = useMapStore.use.setCurrentGeometry();
  const setCurrentInfoWindow = useMapStore.use.setCurrentInfoWindow();
  const { isSavedPropertyModalOpen, setSavedPropertyModalOpen } =
    useSavedModalStore();
  const savedProperties = useSavedDataStore.use.savedProperties();
  const setSavedProperties = useSavedDataStore.use.setSavedProperties();

  // console.log("savedpprperties-======", savedProperties);

  // const placeService = usePlacesService();

  const refreshData = () => {
    axios.get("/api/savedProperties").then((res) => {
      if (res.status === 200) {
        setSavedProperties(res.data);
      }
    });
  };
  const handleRemoveSaved = async (savedProperties: any) => {
    const response = await axios.delete("/api/savedProperties", {
      params: {
        group_id: savedProperties.group_id,
        place_id: savedProperties.place_id,
      },
    });
    if (response.status === 200) {
      refreshData();
      enqueueSnackbar("Removed successfully!", { variant: "success" });
    }
  };

  const toggle = () => {
    setSavedPropertyModalOpen(!isSavedPropertyModalOpen);
  };
  return (
    <div>
      <button
        className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg"
        onClick={toggle}
      >
        <MapPin className="h-5 w-5" />
        <span>Saved Property</span>
      </button>
      <Modal
        open={isSavedPropertyModalOpen}
        onClose={toggle}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography sx={{ mt: 2, mb: 2 }} variant="h6" component="div">
            Saved Property
          </Typography>
          <div className="max-h-[800px] overflow-y-auto">
            {savedProperties?.map((item) => {
              if (!item) return null;
              const images: string[] =
                Array.isArray(item.photo) && item.photo.length > 0
                  ? item.photo.map((p) => (typeof p === "string" ? p : ""))
                  : [DEFAULT_IMAGE_URL];
              return (
                <div
                  key={item.place_id}
                  className="flex border rounded-lg overflow-hidden shadow-md"
                  onClick={() => {
                    setCurrentGeometry({
                      lat: item.latitude,
                      lng: item.longitude,
                    });
                    setCurrentInfoWindow(item);
                    setSavedPropertyModalOpen(false);
                  }}
                >
                  {/* Left: Swiper Image */}
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
                            alt={item.street}
                            className="w-full h-full max-h-48 object-cover rounded-lg aspect-[4/5]"
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>

                  {/* Right: Property Info */}
                  <div className="w-2/3 p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <Typography className="text-xl font-bold">
                        {item.weekly_rent
                          ? `$${item.weekly_rent} per week`
                          : "No rent info"}
                      </Typography>
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleRemoveSaved(item)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>

                    <Typography className="text-lg">
                      {item.street}, {item.suburb}
                    </Typography>

                    <div className="flex items-center space-x-4 mt-2">
                      <span>🛏 {item.bedrooms ?? "-"} Beds</span>
                      <span>🛁 {item.bathrooms ?? "-"} Baths</span>
                      <span>🚗 {item.parking_spaces ?? "-"} Parking</span>
                    </div>

                    <Typography className="mt-2">
                      {item.property_type ?? "Property"}
                    </Typography>
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

export default SavedPropertyModal;
