"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { usePresence, PresenceUser } from "@/hooks/use-presence";
import { useSyncStatus } from "@/hooks/use-sync-status";
import { useActivityLog } from "@/hooks/use-activity-log";
import { useFocusMode } from "@/hooks/use-focus-mode";

const COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
  "#BB8FCE", "#85C1E9", "#F0B27A", "#82E0AA",
];

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function useYjs(documentId: string, userName?: string, userColor?: string) {
  const setUsers = usePresence((s) => s.setUsers);
  const clearPresence = usePresence((s) => s.clear);
  const colorRef = useRef(userColor || getRandomColor());

  const { doc, provider, fragment, titleText } = useMemo(() => {
    if (!documentId) return { doc: null, provider: null, fragment: null, titleText: null };

    const yDoc = new Y.Doc();
    const wsUrl =
      process.env.NEXT_PUBLIC_YJS_WS_URL ||
      (typeof window !== "undefined"
        ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.hostname}:1234`
        : "ws://localhost:1234");

    const yProvider = new WebsocketProvider(wsUrl, `doc-${documentId}`, yDoc);
    const yFragment = yDoc.getXmlFragment("document-store");
    const yTitle = yDoc.getText("title");

    yProvider.awareness.setLocalStateField("user", {
      name: userName || "Anonymous",
      color: colorRef.current,
      lastSeen: Date.now(),
      isTyping: false,
      focusMode: false,
    });

    return { doc: yDoc, provider: yProvider, fragment: yFragment, titleText: yTitle };
  }, [documentId]);

  // Track previous awareness client IDs to detect join/leave
  const prevClientIdsRef = useRef<Set<number>>(new Set());
  // Map clientId -> user info for logging leaves with correct name/color
  const clientInfoRef = useRef<Map<number, { name: string; color: string }>>(new Map());

  useEffect(() => {
    if (!provider || !doc) {
      return () => { clearPresence(); };
    }

    const heartbeatInterval = setInterval(() => {
      const current = provider.awareness.getLocalState();
      provider.awareness.setLocalStateField("user", {
        name: userName || "Anonymous",
        color: colorRef.current,
        lastSeen: Date.now(),
        isTyping: current?.user?.isTyping || false,
        focusMode: useFocusMode.getState().enabled,
      });
    }, 30_000);

    const addEntry = useActivityLog.getState().addEntry;

    const onAwarenessChange = () => {
      const states = provider.awareness.getStates();
      const localId = provider.awareness.clientID;
      const others: PresenceUser[] = [];

      // Build current set of remote client IDs with user info
      const currentClientIds = new Set<number>();
      states.forEach((state, clientId) => {
        if (clientId !== localId && state.user) {
          currentClientIds.add(clientId);
          others.push({
            clientId,
            name: state.user.name || "Anonymous",
            color: state.user.color || "#999",
            lastSeen: state.user.lastSeen || Date.now(),
            isTyping: state.user.isTyping || false,
          });
          // Keep track of user info per clientId
          clientInfoRef.current.set(clientId, {
            name: state.user.name || "Anonymous",
            color: state.user.color || "#999",
          });
        }
      });

      const prevIds = prevClientIdsRef.current;

      // Detect newly joined clients
      currentClientIds.forEach((clientId) => {
        if (!prevIds.has(clientId)) {
          const info = clientInfoRef.current.get(clientId);
          if (info) {
            addEntry({
              userName: info.name,
              userColor: info.color,
              action: "joined",
              timestamp: Date.now(),
            });
          }
        }
      });

      // Detect clients that left
      prevIds.forEach((clientId) => {
        if (!currentClientIds.has(clientId)) {
          const info = clientInfoRef.current.get(clientId);
          if (info) {
            addEntry({
              userName: info.name,
              userColor: info.color,
              action: "left",
              timestamp: Date.now(),
            });
            // Clean up the info map
            clientInfoRef.current.delete(clientId);
          }
        }
      });

      // Update previous ids for next change
      prevClientIdsRef.current = currentClientIds;

      setUsers(others);
    };

    provider.awareness.on("change", onAwarenessChange);
    onAwarenessChange();

    const onStatus = ({ status: wsStatus }: { status: string }) => {
      if (wsStatus === "disconnected") {
        useSyncStatus.getState().setOffline();
      } else if (wsStatus === "connecting") {
        useSyncStatus.getState().setSyncing();
      } else if (wsStatus === "connected") {
        useSyncStatus.getState().setSaved();
      }
    };
    provider.on("status", onStatus);

    return () => {
      clearInterval(heartbeatInterval);
      provider.awareness.off("change", onAwarenessChange);
      provider.off("status", onStatus);
      clearPresence();
      provider.disconnect();
      doc.destroy();
    };
  }, [provider, doc, setUsers, clearPresence]);

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!provider) return;
      const current = provider.awareness.getLocalState();
      provider.awareness.setLocalStateField("user", {
        ...current?.user,
        isTyping,
      });
    },
    [provider],
  );

  const setFocusMode = useCallback(
    (focusMode: boolean) => {
      if (!provider) return;
      const current = provider.awareness.getLocalState();
      provider.awareness.setLocalStateField("user", {
        ...current?.user,
        focusMode,
      });
    },
    [provider],
  );

  return { doc, provider, fragment, titleText, setTyping, setFocusMode };
}
