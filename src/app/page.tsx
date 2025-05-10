"use client";

import { MapContainer } from "@/components/maps/MapContainer";
import { Header } from "@/components/home/Header";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useEffect, useMemo, useState } from "react";
import Loading from "@/components/ui/Loading";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import useSavedDataStore from "@/stores/useSavedData";
import { SnackbarProvider } from "notistack";
import { useGroupIdStore } from "@/stores/useGroupStore";
import { ThemeProvider } from "@mui/material";
import { useTheme } from "next-themes";
import { getTheme } from "@/theme";

export default function Home() {
  const userInfo = useAuth();
  const savedPois = useSavedDataStore.use.savedPois();
  const savedProperties = useSavedDataStore.use.savedProperties();
  const setSavedPois = useSavedDataStore.use.setSavedPois();
  const setSavedProperties = useSavedDataStore.use.setSavedProperties();
  const setProperties = useSavedDataStore.use.setProperties();
  const currentGroupId = useGroupIdStore((state) => state.currentGroupId);

  const [person, setPerson] = useState("Alice");
  const [bio, setBio] = useState(null);

  useEffect(() => {
    axios.get("/api/properties").then((res) => {
      if (res.status === 200) {
        //TODO: 临时取前100个，后续优化代讨论
        setProperties(res.data);
      }
    });
  }, []);
  useEffect(() => {
    if (userInfo.userId && currentGroupId) {
      //groupid 读取
      axios.defaults.params = {
        user_id: userInfo.userId,
        group_id: currentGroupId,
      };
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
    }
  }, [currentGroupId, userInfo.userId]);
  console.log("savedProperties=======", savedProperties);
  console.log("savedPois=======", savedPois);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const { theme } = useTheme();
  const materialTheme = useMemo(() => getTheme(theme), [theme]);

  console.log("theme========", theme);
  return (
    <ThemeProvider theme={materialTheme}>
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
          </main>
        </APIProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
