import { InfoWindow } from "@vis.gl/react-google-maps";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Navigation } from "@mui/icons-material";
import EditPropertyModal from "./EditPropertyt";
import SavePoi from "./SavePoi";
import { PropertyInfo } from "../maps/MapContent";
import { Bath, Bed, Car } from "lucide-react";
import { handleShowRoutesToPOIs } from "@/lib/routeDisplayHelpers";
import { useRatingStore } from "@/stores/ratingStore";

interface PropertyInfoWindowProps {
  position: google.maps.LatLngLiteral;
  onClose: () => void;
  placeData: PropertyInfo; //✅  Google Places API 返回的数据
}

export const PropertyInfoWindow: React.FC<PropertyInfoWindowProps> = ({
  position,
  onClose,
  placeData, // ✅ 传入 Google Places API 数据
}) => {
  const currentGroup = useRatingStore((state) => state.currentGroup);
  const toggleSavedPoi = () => {};
  const toggleSaveProperty = () => {};

  return (
    <InfoWindow
      position={position}
      onCloseClick={onClose}
      headerContent={placeData?.name}
    >
      <Box className="info-window p-2 bg-white rounded-lg shadow-md flex flex-col ">
        <Stack direction="row">
          {placeData?.image && (
            <img
              src={placeData.image}
              alt={placeData.name}
              width={120}
              height={120}
              className="rounded-md mr-4 overflow h-32 w-32"
            />
          )}
          <div>
            <Typography variant="body1" className="font-bold mt-2">
              {placeData?.address}
            </Typography>
            {/* <Typography variant="body2" color="textSecondary">
            {placeData?.address}
          </Typography> */}

            {placeData?.savedProperty?.weekly_rent && (
              <Typography variant="h6" className="font-bold mt-2">
                Weekly Rent: {placeData?.savedProperty?.weekly_rent}
              </Typography>
            )}
            <div className="flex items-center">
              {placeData?.savedProperty?.bedrooms && (
                <>
                  <Bed />
                  <Typography variant="body2">
                    : {placeData?.savedProperty?.bedrooms}
                  </Typography>
                </>
              )}
              {placeData?.savedProperty?.bathrooms && (
                <>
                  <Bath></Bath>
                  <Typography variant="body2">
                    {placeData?.savedProperty?.bathrooms}
                  </Typography>
                </>
              )}
              {placeData?.savedProperty?.parking_spaces && (
                <>
                  <Car></Car>
                  <Typography variant="body2">
                    {placeData?.savedProperty?.parking_spaces}
                  </Typography>
                </>
              )}
            </div>
          </div>
        </Stack>
        <Box className="mt-2 flex justify-end gap-2">
          <EditPropertyModal placeData={placeData}></EditPropertyModal>

          <SavePoi placeData={placeData} />
          {placeData?.savedProperty &&
            currentGroup &&
            placeData.savedProperty.group_id === currentGroup.group_id && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Navigation />}
                onClick={() => {
                  handleShowRoutesToPOIs(placeData.savedProperty);
                  onClose();
                }}
              >
                Show Routes
              </Button>
            )}
        </Box>
      </Box>
    </InfoWindow>
  );
};
export default PropertyInfoWindow;
