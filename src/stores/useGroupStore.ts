import { create } from "zustand";

interface GroupIdStore {
  currentGroupId: number | null;
  setGroupId: (groupId: number) => void;
  reset: () => void;
}

interface GroupStore {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  reset: () => void;
}

export interface Group {
  group_id: number;
  group_name: string;
  created_at: string;
}

export const useGroupIdStore = create<GroupIdStore>((set) => ({
  currentGroupId: null,
  setGroupId: (currentGroupId) => set({ currentGroupId }),
  reset: () => set({ currentGroupId: null }),
}));

export const useGroupStore = create<GroupStore>((set) => ({
  groups: [],
  setGroups: (groups) => set({ groups }),
  reset: () => set({ groups: [] }),
}));
