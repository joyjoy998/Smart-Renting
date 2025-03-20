import { ContentCut } from "@mui/icons-material";
import {
  Button,
  Fade,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { Briefcase, Dumbbell, Ellipsis, School, Store } from "lucide-react";
import React from "react";
import axios from "axios";
import useSavedDataStore from "@/stores/useSavedData";
import { PropertyInfo } from "../maps/MapContent";

type Props = {
  placeData: PropertyInfo;
};

const SavePoi = (props: Props) => {
  const placeData = props.placeData;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const setSavedPois = useSavedDataStore.use.setSavedPois();

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const refreshData = () => {
    axios.get("/api/savedPois").then((res) => {
      if (res.status === 200) {
        setSavedPois(res.data);
      }
    });
  };
  const handleRemove = async () => {
    const response = await axios.delete("/api/savedPois", {
      params: {
        group_id: placeData?.savedPoi.group_id, // 确保 group_id 传递正确
        place_id: placeData?.savedPoi.place_id, // 使用 place_id
      },
    });
    if (response.status === 200) {
      refreshData();
    }
  };
  const handleSelectType = async (type: string) => {
    setAnchorEl(null); // 关闭菜单
    // 假设从 props 获取 group_id，或者使用默认值 1
    const groupId = props.groupId || 1; // 确保 group_id 传递正确
    console.log("PlaceData=====", placeData);
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
    )?.short_name;

    const payload = {
      saved_poi_id: Math.floor(Math.random() * 1000000), // ✅ Ensure this exists
      place_id: placeData?.place_id,
      name: placeData?.name,
      street: addressParts[0],
      suburb: suburb,
      state: state,
      postcode: postcode,
      latitude: placeData?.geometry?.location?.lat?.() || null,
      longitude: placeData?.geometry?.location?.lng?.() || null,
      photo: placeData?.photos || [], // ✅ 必须是数组
      note: "Great location!",
      created_at: new Date().toISOString(), // ✅ 必须是 `TIMESTAMP`
      category: type, // 用户选择的 POI 类型
    };

    console.log("🚀 Sending Payload:", payload); // ✅ Debugging log

    // 发送数据到后端 API
    try {
      console.log();
      const response = await axios.post("/api/savedPois", payload);
      console.log("✅ API Success:", response.data);
      if (response.status === 200) {
        refreshData();
      }
    } catch (error: any) {
      console.error("❌ API Request Failed:", error);
      // 🔹 Log Detailed Error
      if (error.response) {
        console.log("📌 Response Status:", error.response.status);
        console.log("📌 Response Data:", error.response.data);
      } else if (error.request) {
        console.log("📌 No Response Received:", error.request);
      } else {
        console.log("📌 Request Setup Error:", error.message);
      }
      alert(
        `Error: ${error.response?.data?.message || "Something went wrong!"}`
      );
    }
  };
  if (!!placeData?.savedProperty) {
    return null;
  }
  return (
    <div>
      {!placeData?.savedPoi ? (
        <Button variant="contained" onClick={handleClick}>
          Save poi
        </Button>
      ) : (
        <Button variant="contained" onClick={handleRemove}>
          Remove Poi
        </Button>
      )}

      <Menu
        id="save-poi"
        MenuListProps={{
          "aria-labelledby": "save-poi-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={() => handleSelectType("Work")}>
          <ListItemIcon>
            <Briefcase />
          </ListItemIcon>
          <ListItemText>Work</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSelectType("Gym")}>
          <ListItemIcon>
            <Dumbbell />
          </ListItemIcon>
          <ListItemText>Gym</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSelectType("School")}>
          <ListItemIcon>
            <School />
          </ListItemIcon>
          <ListItemText>School</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSelectType("Grocery")}>
          <ListItemIcon>
            <Store />
          </ListItemIcon>
          <ListItemText>Grocery</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSelectType("Other")}>
          <ListItemIcon>
            <Ellipsis />
          </ListItemIcon>
          <ListItemText>Other</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default SavePoi;
