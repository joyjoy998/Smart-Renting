import { create } from "zustand";

interface GroupIdStore {
  currentGroupId: number | null;
  setGroupId: (groupId: number) => void;
}

export const useGroupIdStore = create<GroupIdStore>((set) => ({
  currentGroupId: null,
  setGroupId: (currentGroupId) => set({ currentGroupId }),
}));
