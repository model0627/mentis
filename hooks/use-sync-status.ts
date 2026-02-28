import { create } from "zustand";

export type SyncStatus = "saved" | "saving" | "offline" | "syncing";

type SyncStatusStore = {
  status: SyncStatus;
  setSaving: () => void;
  setSaved: () => void;
  setOffline: () => void;
  setSyncing: () => void;
};

export const useSyncStatus = create<SyncStatusStore>((set) => ({
  status: "saved",
  setSaving: () => set({ status: "saving" }),
  setSaved: () => set({ status: "saved" }),
  setOffline: () => set({ status: "offline" }),
  setSyncing: () => set({ status: "syncing" }),
}));
