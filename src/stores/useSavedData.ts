import { StoreApi, UseBoundStore, create } from 'zustand'

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) => {
  let store = _store as WithSelectors<typeof _store>
  store.use = {}
  for (let k of Object.keys(store.getState())) {
    ;(store.use as any)[k] = () => store((s) => s[k as keyof typeof s])
  }

  return store
}

export type SavedPropertyProps = {
  saved_property_id: number;
  group_id: number;
  property_id: string | null;
  place_id: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  weekly_rent: number;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  property_type: string | null;
  photo: string[];
  latitude: number;
  longitude: number;
  created_at: string;
  safety_score: number;
  note: string | null;
  category: string | null;
};
export type SavedPoiProps = {
  category: string | null;
  created_at: string;
  group_id: number;
  latitude: number;
  longitude: number;
  name: string;
  note: string | null;
  photo: string[];
  place_id: string;
  poi_id: string | null;
  postcode:string;
  state: string;
  street: string;
  suburb: string;
  saved_poi_id: number;
};



type State = {
  savedPois: SavedPoiProps[];
  savedProperties: SavedPropertyProps[];
  properties: SavedPropertyProps[];

}
interface Action {
  setSavedPois: (savedPois: State['savedPois']) => void
  setSavedProperties: (savedProperties: State['savedProperties']) => void
  setProperties: (savedProperties: State['properties']) => void
}

const useSavedDataStore = createSelectors(create<State & Action>()((set) => ({
  savedPois: [],
  properties: [],
  savedProperties: [],
  setSavedPois: (value: any) => set(() => ({ savedPois: value })),
  setProperties: (value: any) => set(() => ({ properties: value })),
  setSavedProperties: (value: any) => set(() => ({ savedProperties: value }))
})))

export default useSavedDataStore;