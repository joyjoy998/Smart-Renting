"use client";

import { MapContainer } from "@/components/maps/MapContainer";
import { Header } from "@/components/home/Header";
import RatingPageTest from "@/components/ratingSystem/ratingReport";

export default function Home() {
  return (
    <main className="h-screen w-screen relative">
      <Header />
      <MapContainer />
      <RatingPageTest />
    </main>
  );
}
