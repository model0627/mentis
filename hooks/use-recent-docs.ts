import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENT = 5;

type RecentDocsStore = {
  recentIds: string[];
  addRecent: (id: string) => void;
  clear: () => void;
};

export const useRecentDocs = create<RecentDocsStore>()(
  persist(
    (set) => ({
      recentIds: [],
      addRecent: (id) =>
        set((state) => {
          const filtered = state.recentIds.filter((rid) => rid !== id);
          const updated = [id, ...filtered];
          if (updated.length > MAX_RECENT) updated.length = MAX_RECENT;
          return { recentIds: updated };
        }),
      clear: () => set({ recentIds: [] }),
    }),
    {
      name: "mentis-recent-docs",
    }
  )
);
