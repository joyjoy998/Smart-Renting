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
import { useRequest } from "ahooks";
import React, { PropsWithChildren } from "react";
import { nearbySearch, usePlacesService } from "@/hooks/map/usePlacesService";
import { useUserLocation } from "@/hooks/map/useUserLocation";

type Props = {};

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
const SavedPropertyModal: React.FC<PropsWithChildren<Props>> = (props) => {
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
  return (
    <div>
      <button
        className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg"
        onClick={toggle}
      >
        <MapPin className="h-5 w-5" />
        <span>Saved Location</span>
      </button>
      <Modal
        open={open}
        onClose={toggle}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div>
            <Typography sx={{ mt: 2, mb: 2 }} variant="h6" component="div">
              Saved Location
            </Typography>
            <div className="max-h-[800px] overflow-y-auto">
              <List>
                {data?.map((item) => {
                  return (
                    <ListItem
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleRemoveSaved(item.placeId)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar src={item.image}></Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={item.name} />
                    </ListItem>
                  );
                })}
              </List>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default SavedPropertyModal;
