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
} from "@mui/material";
import { BookmarkCheck, DeleteIcon, FolderIcon, MapPin } from "lucide-react";
import { useRequest } from "ahooks";
import React, { PropsWithChildren } from "react";
import { nearbySearch, usePlacesService } from "@/hooks/map/usePlacesService";
import { useUserLocation } from "@/hooks/map/useUserLocation";
import { useForm, Controller } from "react-hook-form";
type Props = {};

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
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [open, setOpen] = React.useState(false);
  const placeService = usePlacesService();
  const { location } = useUserLocation();
  const { data, refresh } = useRequest(
    async () => {
      const res = await nearbySearch(placeService!, {
        location: { lat: location!.lat, lng: location!.lng },
        radius: 500,
      });
      console.log("res==========", res);
      return res.map((item) => {
        return {
          name: item.name,
          image: item.photos?.[0]?.getUrl(),
          address: item.formatted_address,
          placeId: item.place_id || "",
        };
      });
    },
    {
      ready: !!placeService && !!location,
    }
  );

  const handleRemoveSaved = (id: string) => {
    console.log("removeId==========", id);
    refresh();
  };
  const toggle = () => {
    setOpen(!open);
  };

  const onSubmit = (values: any) => {
    console.log("values=========", values);
    setOpen(false);
  };
  return (
    <div>
      <Button variant="outlined" onClick={toggle}>
        Save Property
      </Button>
      <Modal
        open={open}
        onClose={toggle}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div>
            <Typography sx={{ mt: 2, mb: 2 }} variant="h6" component="div">
              Edit Property
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
                name="price"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Price"
                    error={!!errors.rent}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="bedrooms"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Bedrooms"
                    error={!!errors.rooms}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="bathrooms"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Bathrooms"
                    error={!!errors.bathrooms}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="carSpaces"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Car Spaces"
                    error={!!errors.parking}
                    fullWidth
                  />
                )}
              />

              <Button variant="contained" type="submit">
                Submit
              </Button>
            </Box>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default EditPropertyModal;
