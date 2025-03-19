import { create } from "zustand";

interface SettingsStore {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

interface BudgetStore {
  minPrice: number;
  maxPrice: number;
  setMinPrice: (price: number) => void;
  setMaxPrice: (price: number) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
}));

export const useBudgetStore = create<BudgetStore>((set) => ({
  minPrice: 200,
  maxPrice: 1000,
  setMinPrice: (price) => set((state) => ({ ...state, minPrice: price })),
  setMaxPrice: (price) => set((state) => ({ ...state, maxPrice: price })),
}));
