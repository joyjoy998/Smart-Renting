import {
  Modal,
  Typography,
  Box,
  List,
  ListItem,
  Avatar,
  IconButton,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { BookmarkCheck, DeleteIcon } from "lucide-react";
import React from "react";
import { nearbySearch, usePlacesService } from "@/hooks/map/usePlacesService";
import useSavedDataStore from "@/stores/useSavedData";
import axios from "axios";
import { PropertyInfo } from "@/components/maps/MapContent";

type Props = {
  placeData: PropertyInfo;
};

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
  const [open, setOpen] = React.useState(false);
  const savedPois = useSavedDataStore.use.savedPois();
  const setSavedPois = useSavedDataStore.use.setSavedPois();

  // console.log("savedpois-======", savedPois);
  const placeService = usePlacesService();

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
        group_id: savedPoi.group_id, // 确保 group_id 传递正确
        place_id: savedPoi.place_id, // 使用 place_id  传递正确
      },
    });
    if (response.status === 200) {
      refreshData();
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
      <Modal
        open={open}
        onClose={toggle}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div>
            <Typography sx={{ mt: 2, mb: 2 }} variant="h6" component="div">
              Saved POI
            </Typography>
            <div className="max-h-[800px] overflow-y-auto">
              <List>
                {savedPois?.map((item) => {
                  return (
                    <ListItem
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleRemove(item)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar src={item.photo?.[0]}></Avatar>
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

export default SavePoiModal;
