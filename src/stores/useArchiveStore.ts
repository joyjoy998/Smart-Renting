import { create } from "zustand";

interface ArchiveStore {
  isArchiveOpen: boolean;
  setArchiveOpen: (open: boolean) => void;
}

export const useArchiveStore = create<ArchiveStore>((set) => ({
  isArchiveOpen: false,
  setArchiveOpen: (open) => set({ isArchiveOpen: open }),
}));
