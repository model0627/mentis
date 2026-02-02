"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  useChatMessages,
  useSendMessage,
  useEditMessage,
  useDeleteMessage,
  useAddReaction,
  useRemoveReaction,
  useMarkRead,
} from "@/hooks/use-chat";
import { useChatStore } from "@/hooks/use-chat-store";
import { useChatT } from "@/hooks/use-chat-t";
import { useChatWs } from "@/hooks/use-chat-ws";
import { ChatMessageItem } from "./chat-message-item";
import { ChatInput } from "./chat-input";
import { useSession } from "next-auth/react";
import { ArrowLeft, Loader2 } from "lucide-react";

export const ChatConversation = () => {
  const { activeRoomId, activeRoomSlug, backToRooms } = useChatStore();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useChatMessages(activeRoomId);

  const sendMessage = useSendMessage();
  const editMessage = useEditMessage();
  const deleteMessage = useDeleteMessage();
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();
  const markRead = useMarkRead();
  const { broadcast } = useChatWs(activeRoomSlug, activeRoomId);
  const { openThread } = useChatStore();
  const t = useChatT();

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Mark as read on open
  useEffect(() => {
    if (activeRoomId) {
      markRead.mutate(activeRoomId);
    }
  }, [activeRoomId]);

  // Scroll to bottom on new messages (first page only)
  useEffect(() => {
    if (data?.pages?.[0]) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [data?.pages?.[0]?.messages?.[0]?.id]);

  // Infinite scroll - load more on scroll to top
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop < 50 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSend = (content: string) => {
    if (!activeRoomId) return;
    sendMessage.mutate(
      { roomId: activeRoomId, content },
      {
        onSuccess: (newMessage) => {
          broadcast({ type: "new_message", message: newMessage });
        },
      }
    );
  };

  const handleEdit = (messageId: string, content: string) => {
    if (!activeRoomId) return;
    editMessage.mutate(
      { roomId: activeRoomId, messageId, content },
      {
        onSuccess: (updated) => {
          broadcast({ type: "edit_message", message: updated });
        },
      }
    );
  };

  const handleDelete = (messageId: string) => {
    if (!activeRoomId) return;
    deleteMessage.mutate(
      { roomId: activeRoomId, messageId },
      {
        onSuccess: () => {
          broadcast({ type: "delete_message", messageId, roomId: activeRoomId });
        },
      }
    );
  };

  const handleReact = (messageId: string, emoji: string) => {
    if (!activeRoomId || !currentUserId) return;
    addReaction.mutate(
      { roomId: activeRoomId, messageId, emoji },
      {
        onSuccess: () => {
          broadcast({ type: "reaction_add", messageId, roomId: activeRoomId, emoji, userId: currentUserId });
        },
      }
    );
  };

  const handleRemoveReaction = (messageId: string, emoji: string) => {
    if (!activeRoomId || !currentUserId) return;
    removeReaction.mutate(
      { roomId: activeRoomId, messageId, emoji },
      {
        onSuccess: () => {
          broadcast({ type: "reaction_remove", messageId, roomId: activeRoomId, emoji, userId: currentUserId });
        },
      }
    );
  };

  const handleOpenThread = (messageId: string) => {
    openThread(messageId);
  };

  const messages = data?.pages?.flatMap((p) => p.messages) ?? [];
  // Messages come newest-first from API, reverse for display
  const displayMessages = [...messages].reverse();

  // Derive room name from slug
  const roomTitle = activeRoomSlug?.startsWith("chat-page-")
    ? t.pageChat
    : t.directMessage;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-3 py-2 shrink-0">
        <button
          onClick={backToRooms}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold truncate">{roomTitle}</span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-8 text-sm text-muted-foreground">
            {t.loadingMessages}
          </div>
        ) : displayMessages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-8 text-sm text-muted-foreground">
            {t.noMessages}
          </div>
        ) : (
          <div className="py-2">
            {displayMessages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                isOwn={msg.userId === currentUserId}
                currentUserId={currentUserId}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReact={handleReact}
                onRemoveReaction={handleRemoveReaction}
                onOpenThread={handleOpenThread}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onSendAttachment={(url, name) => {
          if (!activeRoomId) return;
          sendMessage.mutate(
            { roomId: activeRoomId, attachmentUrl: url, attachmentName: name },
            {
              onSuccess: (newMessage) => {
                broadcast({ type: "new_message", message: newMessage });
              },
            }
          );
        }}
        disabled={sendMessage.isPending}
      />
    </div>
  );
};
