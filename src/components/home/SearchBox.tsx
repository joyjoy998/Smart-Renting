import React, { useEffect, useState } from "react";
import { MenuButton } from "./MenuButton";
import { Search } from "lucide-react";
import { Sidebar } from "../sidebar/Sidebar";
import { useMap } from "@vis.gl/react-google-maps";
import { Autocomplete, debounce, TextField, Box } from "@mui/material";
import { usePlacesService } from "@/hooks/map/usePlacesService";
import useMapStore from "@/stores/useMapStore";

interface SearchBoxProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder = "Search Google Maps",
  onSearch,
}) => {
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
        // 附近搜索
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
  }, 300);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem("search") as HTMLInputElement;
    onSearch?.(input.value);
  };
  console.log("options========", options);
  return (
    <>
      <div className="absolute left-4 top-[0.5rem] w-full max-w-[280px] z-[1000]">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="relative w-full">
            <Autocomplete
              style={{ zIndex: 10000 }}
              size="small"
              getOptionLabel={(option) => option.name || "Unknow"}
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
                  className="bg-white"
                  {...params}
                  // slotProps={{
                  //   input: {
                  //     startAdornment: <MenuButton />,
                  //     endAdornment: (
                  //       <Search className="h-5 w-5 text-gray-400 -mr-6" />
                  //     ),
                  //   },
                  // }}
                  label="Search Google Maps"
                  fullWidth
                />
              )}
            />
          </div>
        </form>
      </div>
      <Sidebar />
    </>
  );
};
