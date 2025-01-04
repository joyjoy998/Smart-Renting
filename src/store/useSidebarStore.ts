import { create } from "zustand";

interface SidebarStore {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
}));
