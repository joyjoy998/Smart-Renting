"use client";

import { MapContainer } from "@/components/maps/MapContainer";
import { Header } from "@/components/home/Header";
import { SearchBox } from "@/components/home/SearchBox";

export default function Home() {
  return (
    <main className="h-screen w-screen relative">
      <Header />
      <SearchBox onSearch={(value) => console.log("Search:", value)} />
      <MapContainer />
    </main>
  );
}
