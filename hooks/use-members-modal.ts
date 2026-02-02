import { create } from "zustand";

type MembersModalStore = {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
};

export const useMembersModal = create<MembersModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));
