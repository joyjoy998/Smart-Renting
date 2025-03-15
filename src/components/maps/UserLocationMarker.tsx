import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

interface UserLocationMarkerProps {
  position: google.maps.LatLngLiteral;
}

export function UserLocationMarker({ position }: UserLocationMarkerProps) {
  console.log("position=======", position);
  return (
    <AdvancedMarker position={position}>
      <Pin
        background={"#3B82F6"} // Tailwind blue-500
        borderColor={"#1D4ED8"} // Tailwind blue-700
        glyphColor={"#FFFFFF"}
        scale={1.2}
      />
    </AdvancedMarker>
  );
}
