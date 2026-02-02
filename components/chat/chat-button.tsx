"use client";

import { MessageCircle } from "lucide-react";
import { useChatStore } from "@/hooks/use-chat-store";
import { useChatRooms } from "@/hooks/use-chat";

export const ChatButton = () => {
  const { toggleWidget, isOpen } = useChatStore();
  const { data: rooms } = useChatRooms();

  const totalUnread =
    rooms?.reduce((sum, room) => sum + (room.unreadCount ?? 0), 0) ?? 0;

  return (
    <button
      onClick={toggleWidget}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition"
    >
      <MessageCircle className="h-5 w-5" />
      {totalUnread > 0 && !isOpen && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
          {totalUnread > 99 ? "99+" : totalUnread}
        </span>
      )}
    </button>
  );
};
