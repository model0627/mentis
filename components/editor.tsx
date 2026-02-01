"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";

import "@blocknote/shadcn/style.css";
import { useTheme } from "next-themes";
import { fileStorage } from "@/lib/upload";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useEffect, useMemo, useRef } from "react";
import { usePresence, PresenceUser } from "@/hooks/use-presence";

interface EditorProps {
    onChange: (value: string) => void;
    initialContent?: string;
    editable?: boolean;
    documentId?: string;
    userName?: string;
    userColor?: string;
}

const COLORS = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
    "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
    "#BB8FCE", "#85C1E9", "#F0B27A", "#82E0AA",
];

function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export const Editor = ({
    onChange,
    initialContent,
    editable,
    documentId,
    userName,
    userColor,
}: EditorProps) => {
    const { resolvedTheme } = useTheme();
    const providerRef = useRef<WebsocketProvider | null>(null);
    const setUsers = usePresence((s) => s.setUsers);
    const clearPresence = usePresence((s) => s.clear);

    const handleUpload = async (file: File) => {
        const response = await fileStorage.upload(file);
        return response.url;
    };

    const { doc, provider, fragment } = useMemo(() => {
        if (!documentId) return { doc: null, provider: null, fragment: null };

        const yDoc = new Y.Doc();
        const wsUrl = process.env.NEXT_PUBLIC_YJS_WS_URL
            || (typeof window !== "undefined"
                ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.hostname}:1234`
                : "ws://localhost:1234");

        const yProvider = new WebsocketProvider(wsUrl, `doc-${documentId}`, yDoc);
        const yFragment = yDoc.getXmlFragment("document-store");

        yProvider.awareness.setLocalStateField("user", {
            name: userName || "Anonymous",
            color: userColor || getRandomColor(),
            lastSeen: Date.now(),
        });

        return { doc: yDoc, provider: yProvider, fragment: yFragment };
    }, [documentId]);

    useEffect(() => {
        providerRef.current = provider;

        if (provider) {
            // Periodically update lastSeen so other clients see fresh timestamps
            const heartbeatInterval = setInterval(() => {
                provider.awareness.setLocalStateField("user", {
                    name: userName || "Anonymous",
                    color: userColor || getRandomColor(),
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
                doc?.destroy();
            };
        }

        return () => {
            clearPresence();
        };
    }, [provider, doc, setUsers, clearPresence]);

    const editor = useCreateBlockNote(
        documentId && provider && fragment
            ? {
                  collaboration: {
                      provider,
                      fragment,
                      user: {
                          name: userName || "Anonymous",
                          color: userColor || getRandomColor(),
                      },
                  },
                  uploadFile: handleUpload,
              }
            : {
                  initialContent: initialContent
                      ? JSON.parse(initialContent)
                      : undefined,
                  uploadFile: handleUpload,
              },
        [documentId, provider, fragment]
    );

    return (
        <div>
            <BlockNoteView
                editor={editor}
                editable={editable}
                theme={resolvedTheme === "dark" ? "dark" : "light"}
                onChange={() => {
                    onChange(JSON.stringify(editor.document, null, 2));
                }}
            />
        </div>
    );
};

export default Editor;
