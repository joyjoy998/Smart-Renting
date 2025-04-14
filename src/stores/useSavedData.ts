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


type State = {
  savedPois: google.maps.places.PlaceResult[];
  savedProperties: google.maps.places.PlaceResult[];
  properties: google.maps.places.PlaceResult[];

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