import React, { useEffect, useState } from "react";
import { MenuButton } from "./MenuButton";
import { Sidebar } from "../sidebar/Sidebar";
import { useMap } from "@vis.gl/react-google-maps";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import debounce from "lodash/debounce";
import { usePlacesService } from "@/hooks/map/usePlacesService";
import useMapStore from "@/stores/useMapStore";

interface SearchBoxProps {
  onSearch?: (value: string) => void;
  onSelect?: (place: google.maps.places.PlaceResult) => void;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, onSelect }) => {
  const [options, setOptions] = useState<google.maps.places.PlaceResult[]>([]);
  const places = usePlacesService();
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral>(); //用户当前位置

  const setCurrentGeometry = useMapStore.use.setCurrentGeometry();
  const setCurrentInfoWindow = useMapStore.use.setCurrentInfoWindow();
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude }); // 设置用户位置
        },
        (error) => {
          console.error("获取位置失败：", error);
        }
      );
    } else {
      console.error("浏览器不支持 Geolocation API");
    }
  }, []);
  const textSearch = (
    value: string,
    location?: any
  ): Promise<google.maps.places.PlaceResult[]> => {
    return new Promise((resolve, reject) => {
      if (places) {
        places.nearbySearch(
          {
            location: userLocation,
            radius: 50000,
            keyword: value,
          },
          (results, status) => {
            if (status === "OK") {
              resolve(results);
            } else {
              resolve([]);
            }
          }
        );
      }
    });
  };

  const handleSearch = debounce(async (value: string) => {
    const results = await textSearch(value);
    console.log("rest=======", results);
    setOptions(results);
    onSearch?.(value);
  }, 300);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("获取位置失败：", error);
        }
      );
    } else {
      console.error("浏览器不支持 Geolocation API");
    }
  }, []);

  return (
    <>
      <div className="absolute left-4 top-[0.5rem] w-full max-w-[280px] z-[1000]">
        <div className="relative flex items-center">
          {/* MenuButton 放在左侧 */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <MenuButton />
          </div>
          {/* Autocomplete 组件 */}
          <Autocomplete
            sx={{
              width: 300,
            }}
            getOptionLabel={(option) => option.name || "Unknow"}
            style={{
              width: "100%",
              background: "transparent",
            }}
            size="small"
            filterOptions={(x) => x}
            options={options}
            autoComplete
            includeInputInList
            filterSelectedOptions
            // value={value}
            noOptionsText="No locations"
            onChange={(event, value) => {
              console.log("value=====", value);
              setCurrentGeometry({
                lng: value?.geometry?.location?.lng()!,
                lat: value?.geometry?.location?.lat()!,
              });
              setCurrentInfoWindow(value);
            }}
            onInputChange={(event, newInputValue) => {
              if (newInputValue) {
                handleSearch(newInputValue);
              } else {
                setOptions([]);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                // 这里的 InputProps 虽说被 MUI 弃用,但如果用新的,就会把 autocomplete 的功能给破坏掉,所以保留
                InputProps={{
                  ...params.InputProps,
                  style: {
                    paddingLeft: "48px",
                    borderRadius: "9999px",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "9999px",
                  },
                }}
                className="w-full rounded-full border border-gray-200 bg-white/80 py-1.5 pl-14 pr-4 shadow-lg outline-none focus:border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm"
              />
            )}
          />
        </div>
      </div>
      <Sidebar />
    </>
  );
};
