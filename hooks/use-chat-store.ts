import { create } from "zustand";

export type ChatTab = "rooms" | "conversation" | "thread";

interface ChatStore {
  isOpen: boolean;
  activeRoomId: string | null;
  activeRoomSlug: string | null;
  activeTab: ChatTab;
  threadMessageId: string | null;

  openWidget: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;
  openRoom: (roomId: string, slug: string) => void;
  openThread: (messageId: string) => void;
  backToRooms: () => void;
  backToConversation: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  activeRoomId: null,
  activeRoomSlug: null,
  activeTab: "rooms",
  threadMessageId: null,

  openWidget: () => set({ isOpen: true }),
  closeWidget: () => set({ isOpen: false }),
  toggleWidget: () => set((s) => ({ isOpen: !s.isOpen })),

  openRoom: (roomId, slug) =>
    set({
      activeRoomId: roomId,
      activeRoomSlug: slug,
      activeTab: "conversation",
      threadMessageId: null,
    }),

  openThread: (messageId) =>
    set({
      activeTab: "thread",
      threadMessageId: messageId,
    }),

  backToRooms: () =>
    set({
      activeRoomId: null,
      activeRoomSlug: null,
      activeTab: "rooms",
      threadMessageId: null,
    }),

  backToConversation: () =>
    set({
      activeTab: "conversation",
      threadMessageId: null,
    }),
}));
