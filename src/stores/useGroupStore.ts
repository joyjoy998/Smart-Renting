import { create } from "zustand";

interface GroupIdStore {
  currentGroupId: number | null;
  setGroupId: (groupId: number) => void;
}

interface GroupStore {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
}

export interface Group {
  group_id: number;
  group_name: string;
  created_at: string;
}

export const useGroupIdStore = create<GroupIdStore>((set) => ({
  currentGroupId: null,
  setGroupId: (currentGroupId) => set({ currentGroupId }),
}));

export const useGroupStore = create<GroupStore>((set) => ({
  groups: [],
  setGroups: (groups) => set({ groups }),
}));
