"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { ChatMessage, ChatMessagesPage } from "@/lib/types";

const MESSAGE_CHAT = 2;

function getWsUrl(): string {
  if (process.env.NEXT_PUBLIC_YJS_WS_URL) {
    return process.env.NEXT_PUBLIC_YJS_WS_URL;
  }
  if (typeof window !== "undefined") {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${window.location.hostname}:1234`;
  }
  return "ws://localhost:1234";
}

// Simple binary encoding helpers (matching lib0 protocol)
function encodeVarUint(num: number): number[] {
  const bytes: number[] = [];
  while (num > 127) {
    bytes.push(128 | (num & 127));
    num >>>= 7;
  }
  bytes.push(num & 127);
  return bytes;
}

function encodeVarUint8Array(data: Uint8Array): number[] {
  const lenBytes = encodeVarUint(data.length);
  return [...lenBytes, ...Array.from(data)];
}

function decodeVarUint(data: Uint8Array, offset: number): [number, number] {
  let num = 0;
  let mult = 1;
  let pos = offset;
  while (pos < data.length) {
    const byte = data[pos];
    num += (byte & 127) * mult;
    pos++;
    if (byte < 128) break;
    mult *= 128;
  }
  return [num, pos];
}

function decodeVarUint8Array(data: Uint8Array, offset: number): [Uint8Array, number] {
  const [len, newOffset] = decodeVarUint(data, offset);
  return [data.slice(newOffset, newOffset + len), newOffset + len];
}

export type ChatWsEvent =
  | { type: "new_message"; message: ChatMessage }
  | { type: "edit_message"; message: ChatMessage }
  | { type: "delete_message"; messageId: string; roomId: string }
  | { type: "reaction_add"; messageId: string; roomId: string; emoji: string; userId: string }
  | { type: "reaction_remove"; messageId: string; roomId: string; emoji: string; userId: string };

export function useChatWs(
  roomSlug: string | null,
  roomId: string | null
) {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!roomSlug || !roomId) return;

    const wsUrl = `${getWsUrl()}/${roomSlug}`;
    const ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = new Uint8Array(event.data);
        const [msgType, offset] = decodeVarUint(data, 0);

        if (msgType !== MESSAGE_CHAT) return;

        const [payload] = decodeVarUint8Array(data, offset);
        const jsonStr = new TextDecoder().decode(payload);
        const chatEvent: ChatWsEvent = JSON.parse(jsonStr);

        handleChatEvent(chatEvent, roomId, queryClient);
      } catch {
        // Ignore non-chat messages
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomSlug, roomId, queryClient]);

  const broadcast = useCallback(
    (event: ChatWsEvent) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      const jsonBytes = new TextEncoder().encode(JSON.stringify(event));
      const header = encodeVarUint(MESSAGE_CHAT);
      const payload = encodeVarUint8Array(jsonBytes);
      const msg = new Uint8Array([...header, ...payload]);
      ws.send(msg);
    },
    []
  );

  return { broadcast };
}

function handleChatEvent(
  event: ChatWsEvent,
  roomId: string,
  queryClient: ReturnType<typeof useQueryClient>
) {
  switch (event.type) {
    case "new_message": {
      const parentKey = event.message.parentMessageId ?? "root";
      queryClient.setQueryData<InfiniteData<ChatMessagesPage>>(
        ["chat", "messages", roomId, parentKey],
        (old) => {
          if (!old) return old;
          // Avoid duplicates
          const exists = old.pages.some((p) =>
            p.messages.some((m) => m.id === event.message.id)
          );
          if (exists) return old;
          const newPages = [...old.pages];
          newPages[0] = {
            ...newPages[0],
            messages: [event.message, ...newPages[0].messages],
          };
          return { ...old, pages: newPages };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
      break;
    }
    case "edit_message":
    case "delete_message": {
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", roomId],
      });
      break;
    }
    case "reaction_add":
    case "reaction_remove": {
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", roomId],
      });
      break;
    }
  }
}
