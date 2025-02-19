import { create } from "zustand";

interface SettingsStore {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
}));
