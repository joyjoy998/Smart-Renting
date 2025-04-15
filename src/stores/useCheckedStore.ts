import { create } from "zustand";

interface CheckedStore {
  isChecked: boolean;
  setisChecked: (open: boolean) => void;
}

export const useCheckedStore = create<CheckedStore>((set) => ({
  isChecked: false,
  setisChecked: (status) => set({ isChecked: status }),
}));
