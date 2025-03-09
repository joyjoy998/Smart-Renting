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

type Props = {};

const SavePoi = (props: Props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div>
      <Button
        variant="outlined"
        id="save-poi-button"
        aria-controls={open ? "fade-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        Save poi
      </Button>
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
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Briefcase />
          </ListItemIcon>
          <ListItemText>Work</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Dumbbell />
          </ListItemIcon>
          <ListItemText>Gym</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <School />
          </ListItemIcon>
          <ListItemText>School</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Store />
          </ListItemIcon>
          <ListItemText>Grocery</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose}>
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
