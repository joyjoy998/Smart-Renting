import dynamic from "next/dynamic";
const RoutePolylineLayer = dynamic(
  () => import("@/components/maps/RoutePolylineLayer"),
  {
    ssr: false,
    loading: () => null,
  }
);

import { useEffect, useMemo, useState } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { MAPS_CONFIG } from "@/lib/constants/mapConfigure";
import PropertyInfoWindow from "@/components/InfoWindow/InfoWindow";
import useMapStore from "@/stores/useMapStore";
import useSavedDataStore, { SavedPropertyProps } from "@/stores/useSavedData";
import PropertyMarker from "./PropertyMarker";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import HouseIcon from "@mui/icons-material/House";
import { blue, green, red } from "@mui/material/colors";
import { Badge } from "@mui/material";
import { useMapLocationStore } from "@/stores/useMapLocationStore";

export type PropertyInfo =
  | (google.maps.places.PlaceResult & {
      image?: string;
      address?: string;
      savedPoi?: any;
      savedProperty?: SavedPropertyProps;
      placeId?: string;
      weekly_rent?: number;
    })
  | null;

// 辅助函数：随机选择最多N个元素
function getRandomSample<Type>(array: Type[], maxCount: number): Type[] {
  if (array.length <= maxCount) {
    return array;
  }

  // 创建原数组的副本
  const arrayCopy = [...array];
  const result: Type[] = [];

  // 使用Fisher-Yates洗牌算法随机选择元素
  for (let i = 0; i < maxCount; i++) {
    // 生成一个随机索引
    const randomIndex = Math.floor(Math.random() * arrayCopy.length);
    // 将该索引的元素添加到结果中
    result.push(arrayCopy[randomIndex]);
    // 从原数组中移除该元素（避免重复选择）
    arrayCopy.splice(randomIndex, 1);
  }

  return result;
}

export function MapContent() {
  const map = useMap();
  const { setMapLocation } = useMapLocationStore();
  const currentInfoWindow = useMapStore.use.currentInfoWindow();
  const currentGeometry = useMapStore.use.currentGeometry();
  const clearCurrentInfo = useMapStore.use.clearCurrentInfo();
  const savedPois = useSavedDataStore.use.savedPois();
  const savedProperties = useSavedDataStore.use.savedProperties();
  const properties = useSavedDataStore.use.properties();

  // 存储当前地图边界的状态
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(
    null
  );

  // 添加状态记录渲染标记的种子，当需要重新随机选择房产时更新
  const [renderSeed, setRenderSeed] = useState(Date.now());

  const allProperties = useMemo(() => {
    return [...(savedProperties || []), ...(properties || [])];
  }, [savedProperties, properties]);

  // 监听地图边界变化
  useEffect(() => {
    if (map) {
      const initialBounds = map.getBounds();
      setMapBounds(initialBounds || null);

      // 地图平移和缩放结束后更新边界
      const boundsChangedListener = map.addListener("idle", () => {
        const bounds = map.getBounds();
        setMapBounds(bounds || null);
        // 每次地图边界变化时更新渲染种子，重新随机选择要显示的房产
        setRenderSeed(Date.now());

        const center = map.getCenter();
        if (center) {
          setMapLocation({ lat: center.lat(), lng: center.lng() });
        }
      });

      return () => {
        boundsChangedListener.remove();
      };
    }
  }, [map, setMapLocation]);

  useEffect(() => {
    if (map && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        try {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          if (pos) {
            map.panTo(pos);
            map.setZoom(15);
          } else {
            map.panTo(MAPS_CONFIG.defaultCenter);
            map.setZoom(15);
          }
        } catch (err) {
          console.error("Error updating map with location:", err);
        }
      });
    }
  }, [map]);

  const currentPropertyData: PropertyInfo = useMemo(() => {
    if (!currentInfoWindow) {
      return null;
    }

    const currentPlaceId = currentInfoWindow?.place_id;
    const matchedPoi = savedPois?.find(
      (poi) => poi.place_id === currentPlaceId
    );

    const matchedProperty = allProperties?.find(
      (property) => property.place_id === currentPlaceId
    );

    return {
      ...currentInfoWindow,
      place_id: currentInfoWindow.place_id,
      name: currentInfoWindow.name,
      geometry: currentInfoWindow.geometry,
      types: currentInfoWindow.types,
      utc_offset_minutes: currentInfoWindow.utc_offset_minutes,
      image:
        matchedProperty?.photo?.[0] ||
        currentInfoWindow?.photos?.[0]?.getUrl() ||
        "",
      address: currentInfoWindow?.formatted_address,
      isSavedPoi: !!matchedPoi,
      isSavedProperty: !!matchedProperty,
      savedPoi: matchedPoi,
      savedProperty: matchedProperty,
    };
  }, [currentInfoWindow, savedPois, allProperties]);

  // 过滤在当前视野内的房产，并随机最多选择50个
  const visibleProperties = useMemo(() => {
    if (!mapBounds || !allProperties?.length) {
      return [];
    }

    // 先筛选在视野内的所有房产
    const propertiesInView = allProperties.filter((property) => {
      // 检查该点是否在当前地图边界内
      return (
        property.latitude &&
        property.longitude &&
        mapBounds.contains({
          lat: property.latitude,
          lng: property.longitude,
        })
      );
    });

    // 确保当前选中的房产（如果有）一定会被包含在渲染列表中
    let selectedProperties: PropertyInfo[] = [];
    if (currentPropertyData && currentPropertyData.place_id) {
      const selectedProperty = propertiesInView.find(
        (prop) => prop.place_id === currentPropertyData.place_id
      );
      if (selectedProperty) {
        selectedProperties = [selectedProperty];
      }
    }

    // 从剩余房产中随机选择，确保总数不超过50个
    let remainingProperties = propertiesInView.filter(
      (prop) =>
        !selectedProperties.some(
          (selected) => selected?.place_id === prop.place_id
        )
    );

    // 随机选择剩余的房产（最多选择50-已选房产数）
    const randomProperties = getRandomSample(
      remainingProperties,
      50 - selectedProperties.length
    );

    // 合并已选和随机选择的房产
    return [...selectedProperties, ...randomProperties];
  }, [mapBounds, allProperties, currentPropertyData, renderSeed]);

  const visiblePois = useMemo(() => {
    if (!mapBounds || !savedPois?.length) {
      return [];
    }

    return savedPois.filter((poi) => {
      return (
        poi.latitude &&
        poi.longitude &&
        mapBounds.contains({
          lat: poi.latitude,
          lng: poi.longitude,
        })
      );
    });
  }, [mapBounds, savedPois]);

  return (
    <>
      <RoutePolylineLayer />

      {currentGeometry &&
        typeof currentGeometry.lat === "number" &&
        typeof currentGeometry.lng === "number" && (
          <AdvancedMarker position={currentGeometry} />
        )}

      {/* 只渲染随机选择的最多50个视野内的房产标记 */}
      {visibleProperties?.map((property, index) => {
        const matchedSaved = savedProperties?.find(
          (saved) => saved.place_id === property?.place_id
        );

        const weeklyRent =
          (matchedSaved as PropertyInfo)?.weekly_rent ??
          (property as { weekly_rent?: number })?.weekly_rent ??
          0;

        const isSaved = !!matchedSaved;

        return (
          <PropertyMarker
            property={property}
            key={`${property?.place_id}-${index}`}
          >
            <Badge badgeContent={weeklyRent} color="primary" max={10000}>
              <HouseIcon
                id={property?.place_id}
                sx={{ color: isSaved ? green[400] : blue[400] }}
                fontSize="large"
              />
            </Badge>
          </PropertyMarker>
        );
      })}

      {visiblePois?.map((property) => {
        return (
          <PropertyMarker property={property} key={property.saved_poi_id}>
            <FavoriteRoundedIcon sx={{ color: red[400] }} fontSize="large" />
          </PropertyMarker>
        );
      })}

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
