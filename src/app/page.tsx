"use client";

import { MapContainer } from "@/components/maps/MapContainer";
import { Header } from "@/components/home/Header";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useState } from "react";
import Loading from "@/components/ui/Loading";

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
      libraries={["places"]}
      onError={() => {
        setIsLoading(false);
        setIsError(true);
      }}
      onLoad={() => {
        setIsLoading(false);
      }}
    >
      <main className="h-screen w-screen relative">
        <Header />
        {isLoading && <Loading />}
        {isError && (
          <div className="flex h-screen w-full items-center justify-center bg-gray-100">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600">
                Map cannot be loaded right now, sorry.
              </h2>
              <p className="mt-2 text-gray-600">{isError}</p>
            </div>
          </div>
        )}
        <MapContainer />
      </main>
    </APIProvider>
  );
}
