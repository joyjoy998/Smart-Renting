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
// Basic user authentication information
export type AuthCredentials = {
email: string;
password: string;
};

// Registration information extends basic credentials
export type RegisterData = AuthCredentials & {
name: string;
phone?: string;
avatar?: string;
confirmPassword: string;
};

// Password reset request
export type PasswordResetRequest = {
email: string;
};

// Password reset confirmation
export type PasswordResetConfirm = {
token: string;
newPassword: string;
confirmPassword: string;
};

// Password change (when user is logged in)
export type PasswordChangeData = {
currentPassword: string;
newPassword: string;
confirmPassword: string;
};

// User profile update data
export type UserProfileUpdate = {
name?: string;
phone?: string;
avatar?: string;
};

// Authentication responses
export type AuthResponse = {
token: string;
user: {
userId: string;
email: string;
name: string;
avatar?: string;
phone?: string;
};
};

// Auth error response
export type AuthError = {
code: string;
message: string;
field?: string;
};

// Authentication state
export type AuthState = {
isAuthenticated: boolean;
user: AuthResponse['user'] | null;
token: string | null;
loading: boolean;
error: AuthError | null;
};

// Authentication actions interface
export type AuthActions = {
// Sign up
register: (data: RegisterData) => Promise<AuthResponse>;

    // Log in
    login: (credentials: AuthCredentials) => Promise<AuthResponse>;

    // Password reset
    requestPasswordReset: (data: PasswordResetRequest) => Promise<void>;
    confirmPasswordReset: (data: PasswordResetConfirm) => Promise<void>;

    // User profile management
    updateProfile: (data: UserProfileUpdate) => Promise<AuthResponse['user']>;
    changePassword: (data: PasswordChangeData) => Promise<void>;

    // Log out
    logout: () => Promise<void>;

    // Session management
    refreshToken: () => Promise<AuthResponse>;
    validateSession: () => Promise<boolean>;

};

// Storage interface for auth data
export type AuthStorage = {
saveToken: (token: string) => Promise<void>;
getToken: () => Promise<string | null>;
removeToken: () => Promise<void>;
saveUser: (user: AuthResponse['user']) => Promise<void>;
getUser: () => Promise<AuthResponse['user'] | null>;
clearAuth: () => Promise<void>;
};

# feature module

## Yara

-Svaed Interested Points
// POI 数据结构
export type POIMarker = {
id: string; // 唯一标识符
name: string; // POI 的名称，例如 "Work"
address: string; // POI 的地址
type: "Work" | "Gym" | "School" | "Grocery" | "Hospital"| "Other"; // POI 类型
customType?: string; // 当 type 为 "Other" 时，可提供自定义类型
linkedProperties: string[]; // 与此 POI 相关联的 PropertyMarker ID 列表
createdAt: Date; // POI 创建时间
notes?: string; // 可选备注
};

// 保存的 POI 列表数据结构
export type SavedPOI = {
id: string; // 唯一标识符
name: string; // POI 分组名称，例如 "My Favorite Places"
poiList: POIMarker[]; // 该分组内的 POI 列表
createdAt: Date; // 创建时间
};
//APP 数据存储结构
export type AppData = {
savedPOIs: SavedPOI[]; // 保存的 POI 分组列表
properties: PropertyMarker[]; // 所有物业的列表
};

-Saved Properties
//saved location schema
export type SavedLocation = {
id: string; // 唯一标识符
name: string; // 保存位置的名称，例如 "Downtown"
address: string; // 位置地址，例如 "Downtown, Wollongong"
description?: string; // 可选的额外描述
linkedProperties: string[]; // 与此位置关联的物业 ID 列表
createdAt: Date; // 保存位置的创建时间
};

//property schema
export type PropertyMarker = {
id: string; // 唯一标识符，例如 "1"
location: LatLng;
address: string; // 详细地址，例如 "123 Main St, Wollongong, 2500"
bedrooms: number; // 卧室数量
bathrooms: number; // 浴室数量
parkingSpaces: number; // 车位数量
weeklyRent: number; // 每周租金，单位：澳元
propertyType: "house" | "apartment" | "townhouse" | "unit"; // 房子类型
status: 'available' | 'pending' | 'unavailable';
poiGrade?: number; // 可选：综合评分（百分比）
createdAt: Date; // 物业数据创建时间
updatedAt: Date; // 物业数据最近更新时间
notes?: {
text?: string; // 备注文本
photos?: string[]; // 照片列表
};  
};

//APP data 整个应用程序的数据存储结构，包含保存的位置和物业的列表
export type AppData = {
savedLocations: SavedLocation[]; // 保存位置的列表
properties: PropertyMarker[]; // 所有物业的列表
};

## Claire

-Preference
export type PreferenceOption =
| "Price"
| "Transportation"
| "Proximity to work/school"
| "Proximity to shops/restaurants"
| "Amenities"
| "Neighborhood safety";

// 2. Define the type for user preferences
export type UserPreferences = {
preferences: Record<PreferenceOption, boolean>;
savePreference: () => void;
cancelPreferences: () => void;
};

-Report Generation
export type ReportGeneration = PropertyMarker &
POIMarker & {
preferences: UserPreferences;
finalScore: number;
download: () => Promise<void>;
};

## Yushu

-Recommendation
export type recommendationInput = {
POIs?: POIMarker[];// List of user-defined POIs
preferences: UserPreferences;
availableProperties: PropertyMarker[] // List of available properties in the area
};

export type recommendedProperty = PropertyMarker & {
recommendScore: number; // A score calculated by the recommendation model
};

export type recommendationOutput = {
recommendations: recommendedProperty[]// List of ranked recommendations

}

export type Recommendation = {
input: recommendationInput; // Data needed for generating recommendations
output: recommendationOutput; // Result of the recommendation process
};

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
