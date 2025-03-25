"use client";

import { MapContainer } from "@/components/maps/MapContainer";
import { Header } from "@/components/home/Header";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import Loading from "@/components/ui/Loading";
import RatingReport from "@/components/ratingSystem/ratingReport";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import useSavedDataStore from "@/stores/useSavedData";
import { SnackbarProvider } from "notistack";
import GroupSelector from "@/components/ratingSystem/GroupSelector";

export default function Home() {
  const userInfo = useAuth();
  const savedPois = useSavedDataStore.use.savedPois();
  const savedProperties = useSavedDataStore.use.savedProperties();
  const setSavedPois = useSavedDataStore.use.setSavedPois();
  const setSavedProperties = useSavedDataStore.use.setSavedProperties();

  const [person, setPerson] = useState("Alice");
  const [bio, setBio] = useState(null);

  useEffect(() => {
    axios.get("/api/savedProperties").then((res) => {
      if (res.status === 200) {
        setSavedProperties(res.data);
      }
    });
    axios.get("/api/savedPois").then((res) => {
      if (res.status === 200) {
        setSavedPois(res.data);
      }
    });
  }, []);
  console.log("savedProperties=======", savedProperties);
  console.log("savedPois=======", savedPois);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  return (
    <SnackbarProvider maxSnack={3}>
      <APIProvider
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
        libraries={["places", "marker", "geocoding"]}
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
          <GroupSelector />
          <RatingReport />
        </main>
      </APIProvider>
    </SnackbarProvider>
  );
}
