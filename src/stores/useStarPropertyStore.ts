import { create } from "zustand";

interface StarPropertyStore {
  starredProperties: Set<string>;
  toggleStar: (id: string) => void;
}

export const useStarPropertyStore = create<StarPropertyStore>((set) => ({
  starredProperties: new Set(),
  toggleStar: (id) =>
    set((state) => {
      const newStars = new Set(state.starredProperties);
      if (newStars.has(id)) {
        newStars.delete(id);
      } else {
        newStars.add(id);
      }
      return { starredProperties: newStars };
    }),
}));
