import { create } from "zustand";

export interface VersionEntry {
  id: string;
  timestamp: number;
  userName: string;
  userColor: string;
  contentPreview: string; // first ~100 chars of text content
  contentSnapshot: string; // full JSON content for restore
}

const MAX_VERSIONS = 30;

type VersionHistoryStore = {
  versions: VersionEntry[];
  pendingRestore: string | null;
  addVersion: (entry: Omit<VersionEntry, "id">) => void;
  requestRestore: (content: string) => void;
  clearRestore: () => void;
  clear: () => void;
};

export const useVersionHistory = create<VersionHistoryStore>((set) => ({
  versions: [],
  pendingRestore: null,
  addVersion: (entry) =>
    set((state) => {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
      const newEntry: VersionEntry = { ...entry, id };
      const updated = [newEntry, ...state.versions];
      if (updated.length > MAX_VERSIONS) updated.length = MAX_VERSIONS;
      return { versions: updated };
    }),
  requestRestore: (content) => set({ pendingRestore: content }),
  clearRestore: () => set({ pendingRestore: null }),
  clear: () => set({ versions: [], pendingRestore: null }),
}));
