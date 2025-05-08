"use client";

import { MapContainer } from "@/components/maps/MapContainer";
import { Header } from "@/components/home/Header";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useMemo, useState } from "react";
import Loading from "@/components/ui/Loading";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import useSWR from "swr";
import useSavedDataStore from "@/stores/useSavedData";
import { SnackbarProvider } from "notistack";
import { useGroupIdStore } from "@/stores/useGroupStore";
import { ThemeProvider } from "@mui/material";
import { useTheme } from "next-themes";
import { getTheme } from "@/theme";

// 创建 fetcher 函数用于 SWR
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function Home() {
  const userInfo = useAuth();
  const savedPois = useSavedDataStore.use.savedPois();
  const savedProperties = useSavedDataStore.use.savedProperties();
  const setSavedPois = useSavedDataStore.use.setSavedPois();
  const setSavedProperties = useSavedDataStore.use.setSavedProperties();
  const setProperties = useSavedDataStore.use.setProperties();
  const currentGroupId = useGroupIdStore((state) => state.currentGroupId);

  // 使用 SWR 获取 properties 数据
  const { data: propertiesData, error: propertiesError } = useSWR(
    "/api/properties",
    fetcher,
    { revalidateOnFocus: true, revalidateOnReconnect: true }
  );

  // 当数据加载成功时更新 store
  useMemo(() => {
    if (propertiesData) {
      setProperties(propertiesData);
    }
  }, [propertiesData, setProperties]);

  // 构建 savedProperties 和 savedPois 的 SWR 键
  const savedPropertiesKey =
    userInfo.userId && currentGroupId
      ? `/api/savedProperties?user_id=${userInfo.userId}&group_id=${currentGroupId}`
      : null;

  const savedPoisKey =
    userInfo.userId && currentGroupId
      ? `/api/savedPois?user_id=${userInfo.userId}&group_id=${currentGroupId}`
      : null;

  // 使用 SWR 获取 savedProperties 数据
  const { data: savedPropertiesData } = useSWR(savedPropertiesKey, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  // 使用 SWR 获取 savedPois 数据
  const { data: savedPoisData } = useSWR(savedPoisKey, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  // 当数据加载成功时更新 store
  useMemo(() => {
    if (savedPropertiesData) {
      setSavedProperties(savedPropertiesData);
    }
  }, [savedPropertiesData, setSavedProperties]);

  useMemo(() => {
    if (savedPoisData) {
      setSavedPois(savedPoisData);
    }
  }, [savedPoisData, setSavedPois]);

  const [isMapLoading, setIsMapLoading] = useState<boolean>(true);
  const [isMapError, setIsMapError] = useState<boolean>(false);

  const { theme } = useTheme();
  const materialTheme = useMemo(() => getTheme(theme), [theme]);

  const isLoading = isMapLoading || (!propertiesData && !propertiesError);

  return (
    <ThemeProvider theme={materialTheme}>
      <SnackbarProvider maxSnack={3}>
        <APIProvider
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
          libraries={["places", "marker", "geocoding"]}
          onError={() => {
            setIsMapLoading(false);
            setIsMapError(true);
          }}
          onLoad={() => {
            setIsMapLoading(false);
          }}
        >
          <main className="h-screen w-screen relative">
            <Header />
            {isLoading && <Loading />}
            {isMapError && (
              <div className="flex h-screen w-full items-center justify-center bg-gray-100">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-red-600">
                    Map cannot be loaded right now, sorry.
                  </h2>
                  <p className="mt-2 text-gray-600">{isMapError}</p>
                </div>
              </div>
            )}
            {propertiesError && (
              <div className="absolute top-16 left-0 right-0 bg-red-100 p-2 text-center text-red-700">
                Failed to load properties data
              </div>
            )}

            <MapContainer />
          </main>
        </APIProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
