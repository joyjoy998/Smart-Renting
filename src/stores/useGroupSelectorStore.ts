import { create } from "zustand";

interface GroupSelectorState {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export const useGroupSelectorStore = create<GroupSelectorState>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
}));
