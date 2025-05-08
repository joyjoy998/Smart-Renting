import React, { useCallback } from "react";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { SavedPropertyProps } from "@/stores/useSavedData";
import useMapStore from "@/stores/useMapStore";

type PropertyMarkerProps = {
  property: SavedPropertyProps | any; // 接受任何带有经纬度的对象
  children: React.ReactNode;
  onClick?: () => void;
};

const PropertyMarker: React.FC<PropertyMarkerProps> = ({
  property,
  children,
  onClick,
}) => {
  const setCurrentInfoWindow = useMapStore.use.setCurrentInfoWindow();
  const setCurrentGeometry = useMapStore.use.setCurrentGeometry();

  // 提取位置信息，确保兼容不同数据结构
  const position = {
    lat: property.latitude || property.geometry?.location?.lat(),
    lng: property.longitude || property.geometry?.location?.lng(),
  };

  // 仅在确认有有效的位置数据时渲染
  if (!position.lat || !position.lng) {
    return null;
  }

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
      return;
    }

    setCurrentInfoWindow(property);
    setCurrentGeometry(position);
  }, [property, position, onClick, setCurrentInfoWindow, setCurrentGeometry]);

  return (
    <AdvancedMarker position={position} onClick={handleClick}>
      {children}
    </AdvancedMarker>
  );
};

export default React.memo(PropertyMarker);
