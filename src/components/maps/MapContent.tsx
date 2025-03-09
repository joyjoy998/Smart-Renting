import { useEffect, useMemo, useState } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { MAPS_CONFIG } from "@/lib/constants/mapConfigure";
import { UserLocationMarker } from "./UserLocationMarker";
import PropertyInfoWindow from "@/components/InfoWindow/InfoWindow";
import useMapStore from "@/stores/useMapStore";
import { getPlaceDetail, usePlacesService } from "@/hooks/map/usePlacesService";
import { getPropertyById } from "@/database/queries"; // ✅ 直接在前端查询数据库

export function MapContent() {
  const map = useMap();
  const currentInfoWindow = useMapStore.use.currentInfoWindow();
  const currentGeometry = useMapStore.use.currentGeometry();
  const clearCurrentInfo = useMapStore.use.clearCurrentInfo();
  const setCurrentGeometry = useMapStore.use.setCurrentGeometry();
  const setCurrentInfoWindow = useMapStore.use.setCurrentInfoWindow();

  const [userLocation, setUserLocation] = useState(MAPS_CONFIG.defaultCenter);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [isDatabaseProperty, setIsDatabaseProperty] = useState(false);

  const [dataFromApi, setDataFromApi] = useState<any>({});
  const currentPropertyData = useMemo(() => {
    if (!currentInfoWindow) {
      return null;
    }
    console.log("currentInfoWindow===========", currentInfoWindow);
    return {
      name: currentInfoWindow.name,
      image:
        dataFromApi.image || currentInfoWindow?.photos?.[0]?.getUrl() || "",
      address: currentInfoWindow?.formatted_address,
      isSavedPoi: dataFromApi.isSavedPoi || false,
      isSavedProperty: false,
      propertyInfo: null,
    };
  }, [currentInfoWindow]);

  const properties = [
    {
      id: "ChIJwRwoOAAPE2sRQJjb0-BQKms111",
      position: { lat: -34.397, lng: 150.644 },
      price: "260",
    },
    {
      id: "ChIJwRwoOAAPE2sRQJjb0-BQKms",
      position: { lat: -33.8688, lng: 151.2093 },
      price: "260",
    },
  ];
  const createPriceMarker = (price: string) => {
    const svg = `
      <svg width="90" height="50" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 45 L30 35 H70 Q85 35 85 20 Q85 5 70 5 H20 Q5 5 5 20 Q5 35 20 35 Z"
          fill="white" stroke="#ccc" stroke-width="2"/>
        <text x="50%" y="55%" font-size="16" font-family="Arial" fill="black" text-anchor="middle" dominant-baseline="middle">
          $${price}
        </text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          if (map) {
            map.panTo(pos);
            map.setZoom(15);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [map]);

  return (
    <>
      <UserLocationMarker position={userLocation} />

      {currentGeometry && <AdvancedMarker position={currentGeometry} />}

      {properties.map((property) => (
        <AdvancedMarker
          key={property.id}
          position={property.position}
          onClick={async () => {
            // setCurrentGeometry(property.position);
            // // ✅ 查询数据库，看是否存在该 `property`
            // const databaseProperty = await getPropertyById(property.id);
            // if (databaseProperty) {
            //   setIsDatabaseProperty(true);
            //   setSelectedProperty(databaseProperty);
            // } else {
            //   setIsDatabaseProperty(false);
            //   const detail = await getPlaceDetail(property.id);
            //   setSelectedProperty(detail);
            // }
            // setCurrentInfoWindow(true);
          }}
        >
          <img src={createPriceMarker(property.price)} alt="" />
        </AdvancedMarker>
      ))}

      {!!currentPropertyData && !!currentGeometry && (
        <PropertyInfoWindow
          position={currentGeometry}
          onClose={() => {
            clearCurrentInfo();
          }}
          placeData={currentPropertyData}
        />
      )}
    </>
  );
}

// export function MapContent() {
//   const map = useMap();
//   const placesSerivce = usePlacesService();
//   console.log("Google Map Instance:", map);

//   const currentInfoWindow = useMapStore.use.currentInfoWindow();
//   const currentGeometry = useMapStore.use.currentGeometry();
//   const clearCurrentInfo = useMapStore.use.clearCurrentInfo();
//   const setCurrentGeometry = useMapStore.use.setCurrentGeometry();
//   const setCurrentInfoWindow = useMapStore.use.setCurrentInfoWindow();

//   const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral>(
//     MAPS_CONFIG.defaultCenter
//   );

//   console.log("currentInfoWindow========", currentInfoWindow);
//   console.log("currentGeometry========", currentGeometry);
//   // 新增：管理 InfoWindow 状态
//   const [selectedProperty, setSelectedProperty] = useState<{
//     id: string;
//     position: google.maps.LatLngLiteral;
//   } | null>(null);

//   // 假数据：用于测试 Marker 和 InfoWindow
//   const properties = [
//     {
//       id: "ChIJwRwoOAAPE2sRQJjb0-BQKms",
//       position: { lat: -34.397, lng: 150.644 },
//       price: "260",
//     },
//     {
//       id: "ChIJwRwoOAAPE2sRQJjb0-BQKms",
//       position: { lat: -33.8688, lng: 151.2093 },
//       price: "260",
//     },
//   ];
//   // 生成气泡框的 Marker Icon
//   const createPriceMarker = (price: string) => {
//     const svg = `
//       <svg width="90" height="50" xmlns="http://www.w3.org/2000/svg">
//         <!-- 使用 lucide-react 的 MessageCircle 形状 -->
//         <path d="M20 45 L30 35 H70 Q85 35 85 20 Q85 5 70 5 H20 Q5 5 5 20 Q5 35 20 35 Z"
//           fill="white" stroke="#ccc" stroke-width="2"/>
//         <text x="50%" y="55%" font-size="16" font-family="Arial" fill="black" text-anchor="middle" dominant-baseline="middle">
//           $${price}
//         </text>
//       </svg>
//     `;
//     return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
//   };
//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const pos = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           };
//           setUserLocation(pos);

//           // Update map center and zoom if map is available
//           if (map) {
//             map.panTo(pos);
//             map.setZoom(15);
//           }
//         },
//         (error) => {
//           console.error("Error getting location:", error);
//         }
//       );
//     }
//   }, [map]);
//   return (
//     <>
//       {/* 显示用户当前位置 */}
//       <UserLocationMarker position={userLocation} />
//       console.log("Rendering Marker at:", property.position);
//       {/* 当前选中的地址 Marker */}
//       {currentGeometry && <AdvancedMarker position={currentGeometry} />}
//       {properties.map((property) => (
//         <AdvancedMarker
//           key={property.id}
//           position={property.position}
//           onClick={async () => {
//             setCurrentGeometry(property.position);
//             const detail = await getPlaceDetail(placesSerivce, property.id);
//             setCurrentInfoWindow(detail);
//           }}
//         >
//           <img src={createPriceMarker(property.price)} alt="" />
//         </AdvancedMarker>
//       ))}
//       {/* 显示 InfoWindow */}
//       {!!currentInfoWindow && (
//         <PropertyInfoWindow
//           position={currentGeometry}
//           propertyId={currentInfoWindow.place_id}
//           onClose={() => {
//             clearCurrentInfo();
//           }}
//           placeData={currentInfoWindow} // ✅ 传递 Google Places API 数据
//         />
//       )}
//     </>
//   );
// }
