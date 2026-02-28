import { create } from "zustand";

export interface ActivityEntry {
  id: string;
  userName: string;
  userColor: string;
  action:
    | "joined"
    | "left"
    | "started_editing"
    | "stopped_editing"
    | "permission_changed";
  timestamp: number;
}

const MAX_ENTRIES = 50;

type ActivityLogStore = {
  entries: ActivityEntry[];
  addEntry: (entry: Omit<ActivityEntry, "id">) => void;
  clear: () => void;
};

export const useActivityLog = create<ActivityLogStore>((set) => ({
  entries: [],
  addEntry: (entry) =>
    set((state) => {
      const id =
        Date.now().toString(36) + Math.random().toString(36).slice(2);
      const newEntry: ActivityEntry = { ...entry, id };
      const updated = [newEntry, ...state.entries];
      if (updated.length > MAX_ENTRIES) {
        updated.length = MAX_ENTRIES;
      }
      return { entries: updated };
    }),
  clear: () => set({ entries: [] }),
}));
