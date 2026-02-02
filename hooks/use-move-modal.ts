"use client";

import { create } from "zustand";

type MoveModalStore = {
  documentId?: string;
  isOpen: boolean;
  onOpen: (documentId: string) => void;
  onClose: () => void;
};

export const useMoveModal = create<MoveModalStore>((set) => ({
  documentId: undefined,
  isOpen: false,
  onOpen: (documentId: string) => set({ isOpen: true, documentId }),
  onClose: () => set({ isOpen: false, documentId: undefined }),
}));
