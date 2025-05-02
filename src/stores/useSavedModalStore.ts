import { create } from "zustand";

interface SavedModalStore {
  isSavedPOIModalOpen: boolean;
  isSavedPropertyModalOpen: boolean;
  setSavedPOIModalOpen: (open: boolean) => void;
  setSavedPropertyModalOpen: (open: boolean) => void;
}

export const useSavedModalStore = create<SavedModalStore>((set) => ({
  isSavedPOIModalOpen: false,
  isSavedPropertyModalOpen: false,
  setSavedPOIModalOpen: (open) => set({ isSavedPOIModalOpen: open }),
  setSavedPropertyModalOpen: (open) => set({ isSavedPropertyModalOpen: open }),
}));
