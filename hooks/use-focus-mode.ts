import { create } from "zustand";

type FocusModeStore = {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (enabled: boolean) => void;
};

export const useFocusMode = create<FocusModeStore>((set) => ({
  enabled: false,
  toggle: () => set((state) => ({ enabled: !state.enabled })),
  setEnabled: (enabled) => set({ enabled }),
}));
