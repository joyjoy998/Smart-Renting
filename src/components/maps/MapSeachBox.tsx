import { usePlacesService } from '@/hooks/map/usePlacesService';
import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Grid2 from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import debounce from 'lodash/debounce';
import parse from 'autosuggest-highlight/parse';
import { stat } from 'fs';

type Props = {}


const MapSeachBox = (props: Props) => {
    const [options, setOptions] = useState<google.maps.places.PlaceResult[]>([]);
    const places = usePlacesService()
    const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral>(); //用户当前位置
    const textSearch = (value: string, location?: any): Promise<google.maps.places.PlaceResult[]> => {
        return new Promise((resolve,reject) => {        
        if(places) {
             // 附近搜索
            places.nearbySearch({ 
                location: userLocation,
                radius: 50000,
                keyword: value
            }, (results, status) => {
                if(status === 'OK') {
                    resolve(results)
                } else {
                    resolve([])
                }
            })
        //   // 文本搜索
        //     places.textSearch(
        //         {
        //         query: value,
        //         fields: ["name", "formatted_address", "geometry"],
        //         }, (results, status) => {
        //             if(status === 'OK') {
        //                 resolve(results)
        //             } else {
        //                 resolve([])
        //             }
        //         // console.log("搜索结果：", results, status);
        
        //     })
        }
    })
    }
    const handleSearch = debounce(async (value: string) => {    
        const results = await textSearch(value);
        setOptions(results);
    }, 300)
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

  return (
  <Autocomplete
    size='small'
    sx={{ width: 300 }}
    getOptionLabel={(option) => option.name || 'Unknow'}
    style={{position: 'absolute', top: 10,left: 10, background: '#fff', zIndex: 100}}
    filterOptions={(x) => x}
    options={options}
    autoComplete
    includeInputInList
    filterSelectedOptions
    // value={value}
    noOptionsText="No locations"
    onChange={(event, value) => {
    }}
    onInputChange={(event, newInputValue) => {
        if(newInputValue) {
            handleSearch(newInputValue)
        } else {
            setOptions([])
        }
    }}
    renderInput={(params) => (
        <TextField {...params} label="Search Maps" fullWidth />
    )}

    />
)
}

export default MapSeachBox