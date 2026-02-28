import { create } from "zustand";

type JumpToUserStore = {
  targetClientId: number | null;
  trigger: (clientId: number) => void;
  clear: () => void;
};

export const useJumpToUser = create<JumpToUserStore>((set) => ({
  targetClientId: null,
  trigger: (clientId) => set({ targetClientId: clientId }),
  clear: () => set({ targetClientId: null }),
}));
