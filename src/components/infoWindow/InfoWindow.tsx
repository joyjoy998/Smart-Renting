import { InfoWindow } from "@vis.gl/react-google-maps";
import Image from "next/image";
import { Box, Button, Fab, Stack, Typography } from "@mui/material";
import { useMap } from "@vis.gl/react-google-maps";
import { Favorite, Add, Edit, Navigation } from "@mui/icons-material";
import EditPropertyModal from "./EditPropertyt";
import SavePoi from "./SavePoi";

interface PropertyInfoWindowProps {
  position: google.maps.LatLngLiteral;
  onClose: () => void;
  placeData: any; //✅  Google Places API 返回的数据
}

export const PropertyInfoWindow: React.FC<PropertyInfoWindowProps> = ({
  position,
  onClose,
  placeData, // ✅ 传入 Google Places API 数据
}) => {
  const toggleSavedPoi = () => {};
  const toggleSaveProperty = () => {};
  return (
    <InfoWindow
      position={position}
      onCloseClick={onClose}
      headerContent={placeData?.name}
    >
      <Box className="info-window p-2 bg-white rounded-lg shadow-md">
        <Stack direction="row">
          <img
            src={placeData?.image}
            alt={placeData?.name}
            width={200}
            height={120}
            className="rounded-md mr-4"
          />
          <div>
            <Typography variant="body1" className="font-bold mt-2">
              {placeData?.address}
            </Typography>
            {/* <Typography variant="body2" color="textSecondary">
            {placeData?.address}
          </Typography> */}

            {placeData?.propertyInfo?.price && (
              <Typography variant="h6" className="font-bold mt-2">
                {placeData?.propertyInfo?.price}
              </Typography>
            )}
            {placeData?.propertyInfo?.details && (
              <Typography variant="body2">
                {placeData?.propertyInfo?.details}
              </Typography>
            )}
          </div>
        </Stack>

        <Box sx={{ "& > :not(style)": { m: 1 } }} className="mt-2">
          <EditPropertyModal></EditPropertyModal>
          <Button variant="outlined">Edit</Button>
          <SavePoi />
        </Box>
      </Box>
    </InfoWindow>
  );
};

//   const map = useMap(); // ✅ 获取 Google Maps 实例
//   console.log("InfoWindow map instance:", map);
//   console.log("InfoWindow position:", position);
//   console.log("InfoWindow placeData:", placeData); // 查看数据结构

//   if (!map) {
//     console.error("Error: Google Map instance is not available");
//     return null; // 防止 `InfoWindow` 绑定失败时报错
//   }
//   //  处理 Google Places API 数据
//   const placeData = {
//     image: placeData?.photos?.[0]?.photo_reference
//       ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${placeData.photos[0].photo_reference}&key=YOUR_GOOGLE_MAPS_API_KEY`
//       : "/example.jpg", //  如果没有图片，显示默认图片
//     name: placeData?.name || "Unknown Place",
//     address: placeData?.formatted_address || "Address not available",
//     price: "260", // 示例价格
//     url: placeData?.url || "#",
//     description:
//       "A nice rental place with great amenities and a beautiful view.", // 示例描述
//   };

//   return (
//     <InfoWindow
//       position={position}
//       // options={{
//       //   map, // ✅ 显式绑定 `map`
//       //   pixelOffset: new window.google.maps.Size(0, -30), // ✅ 让 InfoWindow 悬浮在 `Marker` 之上
//       // }}
//       pixelOffset={[0, -30]}
//       onCloseClick={onClose}
//     >
//       <Box className="info-window p-2 bg-white rounded-lg shadow-md w-64">
//         <Image
//           src={placeData.image}
//           alt={placeData.name}
//           width={200}
//           height={120}
//           className="rounded-md"
//         />

//         {/* 🏡 房产名称 */}
//         <Typography variant="h6" className="font-bold mt-2">
//           {placeData.name}
//         </Typography>
//         {/* 📍 地址 */}
//         <Typography variant="body2" color="textSecondary">
//           {placeData.address}
//         </Typography>
//         {/* 🔗 访问 Google 地点详情 */}
//         <Typography variant="body2">
//           <a href={placeData.url} target="_blank" rel="noopener noreferrer">
//             View on Google Maps
//           </a>
//         </Typography>

//         <Typography variant="h6" className="font-bold mt-2">
//           ${placeData.price}
//         </Typography>

//         <Typography variant="body2">{placeData.description}</Typography>
//       </Box>
//       <Box sx={{ "& > :not(style)": { m: 1 } }}>
//         <Fab color="primary" aria-label="add">
//           <Add />
//         </Fab>
//         <Fab color="secondary" aria-label="edit">
//           <Edit />
//         </Fab>
//         <Fab variant="extended">
//           <Navigation sx={{ mr: 1 }} />
//           Navigate
//         </Fab>
//         <Fab disabled aria-label="like">
//           <Favorite />
//         </Fab>
//       </Box>
//     </InfoWindow>
//   );
// };

export default PropertyInfoWindow;
