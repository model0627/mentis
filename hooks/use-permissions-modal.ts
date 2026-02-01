import { create } from "zustand";

type PermissionsModalStore = {
    isOpen: boolean;
    documentId: string | null;
    onOpen: (documentId: string) => void;
    onClose: () => void;
};

export const usePermissionsModal = create<PermissionsModalStore>((set) => ({
    isOpen: false,
    documentId: null,
    onOpen: (documentId: string) => set({ isOpen: true, documentId }),
    onClose: () => set({ isOpen: false, documentId: null }),
}));
