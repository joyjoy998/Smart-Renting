"use client";

import { MapContainer } from "@/components/maps/MapContainer";
import { Header } from "@/components/home/Header";
import RatingReport from "@/components/ratingSystem/RatingReport";

export default function Home() {
  return (
    <main className="h-screen w-screen relative">
      <Header />
      <MapContainer />
      <RatingReport />
    </main>
  );
}
