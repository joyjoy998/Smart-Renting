import { InfoWindow } from "@vis.gl/react-google-maps";
import Image from "next/image";
import { Box, Fab, Typography } from "@mui/material";
import { useMap } from "@vis.gl/react-google-maps";
import { Favorite, Add, Edit, Navigation } from "@mui/icons-material";
interface PropertyInfoWindowProps {
  position: google.maps.LatLngLiteral;
  onClose: () => void;
}

export const PropertyInfoWindow: React.FC<PropertyInfoWindowProps> = ({
  position,
  onClose,
}) => {
  const map = useMap(); // ✅ 获取 Google Maps 实例
  console.log("InfoWindow map instance:", map);
  console.log("InfoWindow position:", position);

  if (!map) {
    console.error("Error: Google Map instance is not available");
    return null; // 防止 `InfoWindow` 绑定失败时报错
  }
  // 填充假数据
  const property = {
    image: "/example.jpg", // 这里放示例图片 URL
    price: "260", // 示例价格
    address: "Wollongong, Australia", // 示例地址
    description:
      "A nice rental place with great amenities and a beautiful view.", // 示例描述
  };

  return (
    <InfoWindow
      position={position}
      // options={{
      //   map, // ✅ 显式绑定 `map`
      //   pixelOffset: new window.google.maps.Size(0, -30), // ✅ 让 InfoWindow 悬浮在 `Marker` 之上
      // }}
      pixelOffset={[0, -30]}
      onCloseClick={onClose}
    >
      <Box className="info-window p-2 bg-white rounded-lg shadow-md w-64">
        <Image
          src={property.image}
          alt="Property"
          width={200}
          height={120}
          className="rounded-md"
        />
        <Typography variant="h6" className="font-bold mt-2">
          ${property.price}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {property.address}
        </Typography>
        <Typography variant="body2">{property.description}</Typography>
      </Box>
      <Box sx={{ "& > :not(style)": { m: 1 } }}>
        <Fab color="primary" aria-label="add">
          <Add />
        </Fab>
        <Fab color="secondary" aria-label="edit">
          <Edit />
        </Fab>
        <Fab variant="extended">
          <Navigation sx={{ mr: 1 }} />
          Navigate
        </Fab>
        <Fab disabled aria-label="like">
          <Favorite />
        </Fab>
      </Box>
    </InfoWindow>
  );
};

export default PropertyInfoWindow;
