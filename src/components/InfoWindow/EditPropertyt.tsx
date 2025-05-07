import axios from "axios";

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
  Button,
  TextField,
  SnackbarCloseReason,
  Snackbar,
} from "@mui/material";
import { BookmarkCheck, DeleteIcon, FolderIcon, MapPin } from "lucide-react";
import { useRequest } from "ahooks";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { nearbySearch, usePlacesService } from "@/hooks/map/usePlacesService";
import { useMapLocationStore } from "@/stores/useMapLocationStore";
import { useForm, Controller } from "react-hook-form";
import useSavedDataStore from "@/stores/useSavedData";
import { PropertyInfo } from "../maps/MapContent";
import { useSnackbar } from "notistack";
import { divide } from "lodash";
import { triggerVectorization } from "@/utils/vectorization";
import { useGroupIdStore } from "@/stores/useGroupStore";
type Props = {
  placeData: PropertyInfo;
};
import { useAuth } from "@clerk/nextjs";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",

  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 2,
};
const EditPropertyModal: React.FC<PropsWithChildren<Props>> = (props) => {
  const { isSignedIn } = useAuth();
  const placeData = props?.placeData;
  const currentGroupId = useGroupIdStore((state) => state.currentGroupId);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  console.log("placeData========", placeData);
  const [open, setOpen] = React.useState(false);

  const savedProperties = useSavedDataStore.use.savedProperties();
  const setSavedProperties = useSavedDataStore.use.setSavedProperties();

  const { enqueueSnackbar } = useSnackbar();

  const [isProcessing, setIsProcessing] = React.useState(false);

  const toggle = () => {
    if (!isSignedIn) {
      enqueueSnackbar("Please sign in to save property", {
        variant: "warning",
      });
      return;
    }
    setOpen(!open);
  };

  const handleQuickSave = async () => {
    if (savedProperties.length >= 6) {
      enqueueSnackbar("You can only save up to 6 properties", {
        variant: "error",
      });
      return;
    }
    if (!isSignedIn) {
      enqueueSnackbar("Please sign in to save property", {
        variant: "warning",
      });
      return;
    }

    const payload = {
      saved_property_id: Math.floor(Math.random() * 1000000),
      street: addressParts[0],
      suburb,
      state,
      postcode,
      latitude: placeData?.geometry?.location?.lat?.(),
      longitude: placeData?.geometry?.location?.lng?.(),
      weekly_rent: placeData?.savedProperty?.weekly_rent || 0,
      photo:
        placeData?.photos?.map((item) => item.getUrl()) ||
        placeData?.savedProperty?.photo ||
        [],
      bedrooms: placeData?.savedProperty?.bedrooms || 0,
      bathrooms: placeData?.savedProperty?.bathrooms || 0,
      parking_spaces: placeData?.savedProperty?.parking_spaces || 0,
      property_type: "Apartment",
      safety_score: 0,
      place_id: placeData?.place_id || "",
    };

    try {
      const res = await axios.post("/api/savedProperties", payload);
      if (res.status === 200) {
        enqueueSnackbar("Property saved successfully", { variant: "success" });
        refreshData();
      }
    } catch (err: any) {
      enqueueSnackbar(
        `Failed to save property: ${
          err.response?.data?.message || err.message
        }`,
        { variant: "error" }
      );
    }
  };

  //transfer address
  const addressParts = placeData?.address?.split(", ") || [];
  const suburb =
    placeData?.address_components?.find((item) =>
      item.types.includes("locality")
    )?.long_name || "";

  const postcode =
    placeData?.address_components?.find((item) =>
      item.types.includes("postal_code")
    )?.long_name || "";

  const state = placeData?.address_components?.find((item) =>
    item.types.includes("administrative_area_level_1")
  )?.short_name || "NSW";
  const refreshData = () => {
    axios.get("/api/savedProperties").then((res) => {
      if (res.status === 200) {
        setSavedProperties(res.data);
      }
    });
  };

  const onSubmit = async (values: any) => {
    setIsProcessing(true);
    const payload = {
      saved_property_id:
        placeData?.savedProperty?.saved_property_id ||
        Math.floor(Math.random() * 1000000),
      street: addressParts[0] || "",
      suburb: suburb || "",
      state: state || "NSW",
      postcode: postcode || "",
      latitude: placeData?.geometry?.location?.lat?.() || placeData?.savedProperty?.latitude || null,
      longitude: placeData?.geometry?.location?.lng?.() || placeData?.savedProperty?.longitude || null,
      weekly_rent: Number(values.weekly_rent),
      photo: placeData?.photos?.map((item) => item.getUrl()) || placeData?.savedProperty?.photo || [],
      bedrooms: values.bedrooms,
      bathrooms: values.bathrooms,
      parking_spaces: values.parking_spaces,
      property_type: values.property_type || "Apartment",
      safety_score: values.safety_score || 0,
      place_id: placeData?.place_id || "",
    };

    console.log("🚀 Sending Payload:", payload); // ✅ Debugging log

    try {
      let response;

      if (!!placeData?.savedProperty) {
        response = await axios.put("/api/savedProperties", payload);
      } else {
        if (savedProperties.length >= 6) {
          enqueueSnackbar("You can only save up to 6 properties", {
            variant: "error",
          });
          return;
        }
        response = await axios.post("/api/savedProperties", payload);
      }

      if (response.status === 200) {
        refreshData();

        // if place_id exists, vectorize properties
        if (payload.place_id) {
          try {
            triggerVectorization(payload.place_id)
              .then((result) => {
                if (result && result.success) {
                  console.log("✅ Vectorization successful:", result);
                } else {
                  console.warn("⚠️ Vectorization issues:", result);
                }
              })
              .catch((error) => {
                console.error("❌ Vectorization failed:", error);
              });
          } catch (vectorError) {
            console.error("❌ Error triggering vectorization:", vectorError);
          }
        }

        enqueueSnackbar(
          !!placeData?.savedProperty
            ? "Update property successfully"
            : "Save property successfully",
          { variant: "success" }
        );

        setOpen(false);
      }
    } catch (error: any) {
      console.error("❌ API Request Failed:", error);

      if (error.response) {
        console.log("📌 Response Status:", error.response.status);
        console.log("📌 Response Data:", error.response.data);
      } else if (error.request) {
        console.log("📌 No Response Received:", error.request);
      } else {
        console.log("📌 Request Setup Error:", error.message);
      }

      enqueueSnackbar(
        `Error: ${error.response?.data?.message || "Something went wrong!"}`,
        { variant: "error" }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    const response = await axios.delete("/api/savedProperties", {
      params: {
        group_id: placeData?.savedProperty?.group_id, // 确保 group_id 传递正确
        place_id: placeData?.savedProperty?.place_id, // 使用 place_id  传递正确
      },
    });
    if (response.status === 200) {
      refreshData();
    }
  };

  if (!!placeData?.savedPoi) {
    return null;
  }
  const hasGroupId = !!placeData?.savedProperty?.group_id;
  const hasWeeklyRent = !!placeData?.savedProperty?.weekly_rent;
  return (
    <div>
      <Box className="flex gap-2">
        {/*New Google Place：upload table */}
        {!placeData?.savedProperty?.group_id &&
          !placeData?.savedProperty?.weekly_rent && (
            <Button variant="contained" onClick={toggle}>
              Save Property
            </Button>
          )}
        {/* without group_id and rent：Save Property quickyly save */}
        {!hasGroupId && hasWeeklyRent && (
          <Button variant="contained" onClick={handleQuickSave}>
            Save Property
          </Button>
        )}
        {/* have group_id and rent：can edit */}
        {placeData?.savedProperty?.group_id && (
          <>
            <Button variant="contained" onClick={toggle}>
              Edit Property
            </Button>
            <Button
              variant="contained"
              color="error"
              className="flex-auto"
              onClick={handleRemove}
            >
              Delete Property
            </Button>
          </>
        )}
      </Box>
      {/* <Box className="flex gap-2">
        <Button variant="contained" onClick={toggle}>
          {!!placeData?.savedProperty ? "Edit Property" : "Save Property"}
        </Button>
        {placeData?.savedProperty && (
          <Button
            variant="contained"
            color="error"
            className="flex-auto"
            onClick={handleRemove}
          >
            Delete Property
          </Button>
        )}
      </Box> */}

      <Modal
        open={open}
        onClose={toggle}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div>
            <Typography sx={{ mt: 2, mb: 2 }} variant="h6" component="div">
              {!!placeData?.savedProperty ? "Edit Property" : "Save Property"}
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: 300,
              }}
            >
              <Controller
                name="placeId"
                control={control}
                defaultValue={placeData?.placeId}
                render={() => {
                  return <></>;
                }}
              />
              <Controller
                name="weekly_rent"
                control={control}
                defaultValue={placeData?.savedProperty?.weekly_rent}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Weekly Rent"
                    error={!!errors.rent}
                    fullWidth
                    type="number"
                  />
                )}
              />

              <Controller
                name="bedrooms"
                control={control}
                defaultValue={placeData?.savedProperty?.bedrooms}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Bedrooms"
                    fullWidth
                    type="number"
                  />
                )}
              />

              <Controller
                name="bathrooms"
                control={control}
                defaultValue={placeData?.savedProperty?.bathrooms}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Bathrooms"
                    fullWidth
                    type="number"
                  />
                )}
              />

              <Controller
                name="parking_spaces"
                control={control}
                defaultValue={placeData?.savedProperty?.parking_spaces}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Car Spaces"
                    error={!!errors.parking}
                    fullWidth
                    type="number"
                  />
                )}
              />
              <Box className="flex flex-row gap-2">
                <Button variant="contained" type="submit" className="flex-auto">
                  Submit
                </Button>
              </Box>
            </Box>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default EditPropertyModal;
