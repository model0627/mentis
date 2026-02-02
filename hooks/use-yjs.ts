"use client";

import { useEffect, useMemo, useRef } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { usePresence, PresenceUser } from "@/hooks/use-presence";

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
    });

    return { doc: yDoc, provider: yProvider, fragment: yFragment, titleText: yTitle };
  }, [documentId]);

  useEffect(() => {
    if (!provider || !doc) {
      return () => { clearPresence(); };
    }

    const heartbeatInterval = setInterval(() => {
      provider.awareness.setLocalStateField("user", {
        name: userName || "Anonymous",
        color: colorRef.current,
        lastSeen: Date.now(),
      });
    }, 30_000);

    const onAwarenessChange = () => {
      const states = provider.awareness.getStates();
      const localId = provider.awareness.clientID;
      const others: PresenceUser[] = [];
      states.forEach((state, clientId) => {
        if (clientId !== localId && state.user) {
          others.push({
            clientId,
            name: state.user.name || "Anonymous",
            color: state.user.color || "#999",
            lastSeen: state.user.lastSeen || Date.now(),
          });
        }
      });
      setUsers(others);
    };

    provider.awareness.on("change", onAwarenessChange);
    onAwarenessChange();

    return () => {
      clearInterval(heartbeatInterval);
      provider.awareness.off("change", onAwarenessChange);
      clearPresence();
      provider.disconnect();
      doc.destroy();
    };
  }, [provider, doc, setUsers, clearPresence]);

  return { doc, provider, fragment, titleText };
}
