这次 types/interface 主要是分成 core 跟 feature 模块来写,其中一些人只需要写 feature 模块的就行.尽量在 due 前完成,留点时间给我 review

数据库设计的时候并不需要考虑功能区的 type,主要是看各个 type 的数据类型,哪些应该是结构性数据库,哪些应该是 nosql,然后又应该怎么分 table

# core module

-map

//用于定位地图中心
export type LatLng = {
lat: string;
lng: string;
altitude?: number; //?代表可能有也可能没有
}

//用于初始化 Map 中的其中一个 attribute option,这个到时候应该是写死的,所以没那么重要
export type MapControls = {
panControl: boolean;
zoomControl: boolean;
mapTypeControl: boolean;
scaleControl: boolean;
streetViewControl: boolean;
rotateControl: boolean;
fullscreenControl: boolean;
}

//这个要根据到时候用户的实际地址来进行地图初始化
export type MapConfig = {
defaultCenter: LatLng;
defaultZoom: number;
mapOptions: MapControls;
}

//地图容器样式,这个估计到时候也是写死的
export type MapContainerStyle = {
width: string;
height: string
}

//定义初始显示范围
export type MapBounds = {
ne: LatLng;
sw: LatLng;
}

//地图当前的状态
export type MapState = {
center: LatLng;
zoom: number;
bounds: MapBounds;
selectedMarker?: string; //当前在地图上选中的点
}

//固定死 POI 的类型
export type POICategory =
| 'restaurant'
| 'school'
| 'hospital'
| 'park'
| 'shopping'
| 'transport'
| 'parking'
| 'other';

//用户在地图上标的 Point of Interested(除 properties 以外)
export type POIMarker = {
id: string;
name: string;
category: POICategory;
location: LatLng;
address: string;
notes?: {
text?: string;
photos?: string[];
};
}

//用户在地图上标 properties 的点
export type PropertyMarker = {
id: string; //本身的唯一标识符，用于在地图上管理标记
location: LatLng;
address: string;
propertyId: string; //关联到实际房产数据的 ID，用于连接我们的 property 数据,亦或者是自定义的 property 数据
price?: number;
status: 'available' | 'pending' | 'unavailable';
bedroom?: number;
bathroom?: number;
parking?: number;
type?: 'house' | 'apartment' | 'unit' | 'other';
notes?: {
text?: string;
photos?: string[];
};
}

//地图上标的点,property 与 POI 的统合
export type MapMarker = {
id: string;
position: LatLng;
markerType: 'property' | 'poi';
icon?: string;
data: PropertyMarker | POI; // Union type
}

-user//这部分是部分 features 的合集,比如说 Preference,Saved Properties, Saved Interested Points

//用户当前档的相关信息
export type User = {
userId: string;
email: string;
name: string;
avatar?: string;
phone?: string;
archiveId: string; //这个用于 History Management 那部分的功能
preferences: UserPreferences;
savedPoints: MapMarker[];
}

//Claire 写的
export type UserPreferences = {
}

## quling

-auth(这个 quling 写,关于 login,register 那些)

# feature module

## Yara

-Svaed Interested Points
-Saved Properties

## Claire

-Preference
-Report Generation

## Yushu

-Recommendation

## me

History Management

//单个存档的内容
export type Archive = {
archiveId: string;
name: string;
timestamp: string;
mapState: MapState;
savedPoints: MapMarker[];
}

//存档列表
export type ArchiveList = {
archives: Archive[];
currentArchiveId?: string;
}

//面向用户的主要功能,UI 层
export type ArchiveActions = {
createArchive: (name: string) => Promise<void>; //Promise 异步操作,表示需要与 localStorage 或者数据库进行交互
loadArchive: (id: string) => Promise<void>; //void 表示不返回任何值
deleteArchive: (id: string) => Promise<void>;
saveCurrentState: () => Promise<void>;
}

//底层功能,用于返回具体数据,是数据层
export type ArchiveStorage = {
save: (archive: Archive) => Promise<void>;
load: (id: string) => Promise<Archive>;
list: () => Promise<ArchiveList>;
delete: (id: string) => Promise<void>;
}
