"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  useChatMessages,
  useSendMessage,
  useEditMessage,
  useDeleteMessage,
  useAddReaction,
  useRemoveReaction,
} from "@/hooks/use-chat";
import { useChatStore } from "@/hooks/use-chat-store";
import { useChatWs } from "@/hooks/use-chat-ws";
import { ChatMessageItem } from "./chat-message-item";
import { ChatInput } from "./chat-input";
import { useSession } from "next-auth/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ChatMessage } from "@/lib/types";

export const ChatThread = () => {
  const {
    activeRoomId,
    activeRoomSlug,
    threadMessageId,
    backToConversation,
  } = useChatStore();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useChatMessages(activeRoomId, threadMessageId ?? undefined);

  const sendMessage = useSendMessage();
  const editMessage = useEditMessage();
  const deleteMessage = useDeleteMessage();
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();
  const { broadcast } = useChatWs(activeRoomSlug, activeRoomId);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data?.pages?.[0]) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [data?.pages?.[0]?.messages?.[0]?.id]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop < 50 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSend = (content: string) => {
    if (!activeRoomId || !threadMessageId) return;
    sendMessage.mutate(
      { roomId: activeRoomId, content, parentMessageId: threadMessageId },
      {
        onSuccess: (newMessage) => {
          broadcast({ type: "new_message", message: newMessage });
          // Also invalidate the parent message list to update reply counts
          queryClient.invalidateQueries({
            queryKey: ["chat", "messages", activeRoomId, "root"],
          });
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

  // Find the parent message from the root query cache
  let parentMessage: ChatMessage | undefined;
  const rootData = queryClient.getQueryData<{ pages: { messages: ChatMessage[] }[] }>(
    ["chat", "messages", activeRoomId, "root"]
  );
  if (rootData) {
    for (const page of rootData.pages) {
      const found = page.messages.find((m) => m.id === threadMessageId);
      if (found) {
        parentMessage = found;
        break;
      }
    }
  }

  const replies = data?.pages?.flatMap((p) => p.messages) ?? [];
  const displayReplies = [...replies].reverse();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-3 py-2 shrink-0">
        <button
          onClick={backToConversation}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold">Thread</span>
      </div>

      {/* Parent message */}
      {parentMessage && (
        <div className="border-b bg-muted/20">
          <ChatMessageItem
            message={parentMessage}
            isOwn={parentMessage.userId === currentUserId}
            currentUserId={currentUserId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReact={handleReact}
            onRemoveReaction={handleRemoveReaction}
          />
        </div>
      )}

      <div className="px-3 py-1.5 text-xs text-muted-foreground border-b">
        {displayReplies.length} {displayReplies.length === 1 ? "reply" : "replies"}
      </div>

      {/* Thread replies */}
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
            Loading replies...
          </div>
        ) : displayReplies.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-8 text-sm text-muted-foreground">
            No replies yet
          </div>
        ) : (
          <div className="py-2">
            {displayReplies.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                isOwn={msg.userId === currentUserId}
                currentUserId={currentUserId}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReact={handleReact}
                onRemoveReaction={handleRemoveReaction}
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
          if (!activeRoomId || !threadMessageId) return;
          sendMessage.mutate(
            { roomId: activeRoomId, attachmentUrl: url, attachmentName: name, parentMessageId: threadMessageId },
            {
              onSuccess: (newMessage) => {
                broadcast({ type: "new_message", message: newMessage });
                queryClient.invalidateQueries({ queryKey: ["chat", "messages", activeRoomId, "root"] });
              },
            }
          );
        }}
        placeholder="Reply in thread..."
        disabled={sendMessage.isPending}
      />
    </div>
  );
};
