"use client";

import { useState } from "react";
import { useChatStore } from "@/hooks/use-chat-store";
import { ChatRoomList } from "./chat-room-list";
import { ChatConversation } from "./chat-conversation";
import { ChatThread } from "./chat-thread";
import { ChatUserPicker } from "./chat-user-picker";
import { X } from "lucide-react";

export const ChatWindow = () => {
  const { isOpen, closeWidget, activeTab } = useChatStore();
  const [showUserPicker, setShowUserPicker] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50 flex h-[500px] w-[400px] flex-col overflow-hidden rounded-lg border bg-background shadow-xl">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/30">
        <span className="text-sm font-semibold">Chat</span>
        <button
          onClick={closeWidget}
          className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-accent transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {showUserPicker ? (
          <ChatUserPicker onBack={() => setShowUserPicker(false)} />
        ) : (
          <>
            {activeTab === "rooms" && (
              <ChatRoomList onNewDm={() => setShowUserPicker(true)} />
            )}
            {activeTab === "conversation" && <ChatConversation />}
            {activeTab === "thread" && <ChatThread />}
          </>
        )}
      </div>
    </div>
  );
};
