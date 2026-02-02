"use client";

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { chatApi } from "@/lib/api";
import { ChatMessage, ChatMessagesPage } from "@/lib/types";

// ─── Room Hooks ────────────────────────────────────────────

export function useChatRooms() {
  return useQuery({
    queryKey: ["chat", "rooms"],
    queryFn: () => chatApi.getRooms(),
    refetchInterval: 5000,
  });
}

export function useChatRoom(roomId: string | null) {
  return useQuery({
    queryKey: ["chat", "rooms", roomId],
    queryFn: () => chatApi.getRoom(roomId!),
    enabled: !!roomId,
  });
}

export function useCreateChatRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      type: "page" | "dm";
      documentId?: string;
      targetUserId?: string;
    }) => chatApi.createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
    },
  });
}

// ─── Message Hooks ─────────────────────────────────────────

export function useChatMessages(
  roomId: string | null,
  parentMessageId?: string
) {
  return useInfiniteQuery({
    queryKey: ["chat", "messages", roomId, parentMessageId ?? "root"],
    queryFn: ({ pageParam }) =>
      chatApi.getMessages(roomId!, pageParam as string | undefined, parentMessageId),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: ChatMessagesPage) => lastPage.nextCursor ?? undefined,
    enabled: !!roomId,
    refetchInterval: 2000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      ...data
    }: {
      roomId: string;
      content?: string;
      attachmentUrl?: string;
      attachmentName?: string;
      parentMessageId?: string;
    }) => chatApi.sendMessage(roomId, data),
    onSuccess: (newMessage) => {
      const parentKey = newMessage.parentMessageId ?? "root";
      // Optimistically add message to the first page
      queryClient.setQueryData<InfiniteData<ChatMessagesPage>>(
        ["chat", "messages", newMessage.roomId, parentKey],
        (old) => {
          if (!old) return old;
          const newPages = [...old.pages];
          newPages[0] = {
            ...newPages[0],
            messages: [newMessage, ...newPages[0].messages],
          };
          return { ...old, pages: newPages };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
    },
  });
}

export function useEditMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      messageId,
      content,
    }: {
      roomId: string;
      messageId: string;
      content: string;
    }) => chatApi.editMessage(roomId, messageId, content),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", updated.roomId],
      });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      messageId,
    }: {
      roomId: string;
      messageId: string;
    }) => chatApi.deleteMessage(roomId, messageId),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", updated.roomId],
      });
      queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
    },
  });
}

// ─── Reaction Hooks ────────────────────────────────────────

export function useAddReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      messageId,
      emoji,
    }: {
      roomId: string;
      messageId: string;
      emoji: string;
    }) => chatApi.addReaction(roomId, messageId, emoji),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", variables.roomId],
      });
    },
  });
}

export function useRemoveReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      messageId,
      emoji,
    }: {
      roomId: string;
      messageId: string;
      emoji: string;
    }) => chatApi.removeReaction(roomId, messageId, emoji),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", variables.roomId],
      });
    },
  });
}

// ─── Read Status ───────────────────────────────────────────

export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => chatApi.markRead(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
    },
  });
}

// ─── Members ───────────────────────────────────────────────

export function useChatMembers(roomId: string | null) {
  return useQuery({
    queryKey: ["chat", "members", roomId],
    queryFn: () => chatApi.getMembers(roomId!),
    enabled: !!roomId,
  });
}
