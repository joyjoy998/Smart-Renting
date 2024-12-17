"use client";

import dynamic from "next/dynamic";
import Loading from "@/components/ui/Loading";

const MapComponent = dynamic(() => import("@/components/maps/MapComponent"), {
  loading: () => <Loading />,
  ssr: false,
});

export default function Home() {
  return (
    <main className="h-screen w-full">
      <MapComponent />
    </main>
  );
}
