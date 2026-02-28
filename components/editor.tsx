"use client";

import { useEffect } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";

import "@blocknote/shadcn/style.css";
import { useTheme } from "next-themes";
import { fileStorage } from "@/lib/upload";
import { useJumpToUser } from "@/hooks/use-jump-to-user";
import { WebsocketProvider } from "y-websocket";
import { XmlFragment } from "yjs";

interface EditorProps {
    onChange: (value: string) => void;
    initialContent?: string;
    editable?: boolean;
    provider?: WebsocketProvider | null;
    fragment?: XmlFragment | null;
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
    provider,
    fragment,
    userName,
    userColor,
}: EditorProps) => {
    const { resolvedTheme } = useTheme();

    const handleUpload = async (file: File) => {
        const response = await fileStorage.upload(file);
        return response.url;
    };

    const editor = useCreateBlockNote(
        provider && fragment
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
        [provider, fragment]
    );

    // Jump-to-collaborator: scroll to a remote user's cursor when triggered
    useEffect(() => {
        if (!provider) return;

        const unsub = useJumpToUser.subscribe((state: { targetClientId: number | null }) => {
            if (!state.targetClientId) return;

            const states = provider.awareness.getStates();
            const targetState = states.get(state.targetClientId);
            if (!targetState?.user?.name) {
                useJumpToUser.getState().clear();
                return;
            }

            const targetName = targetState.user.name as string;

            // Strategy 1: Find by collaboration-cursor label (TipTap/BlockNote)
            const labels = Array.from(
                document.querySelectorAll(".collaboration-cursor__label")
            );
            for (const label of labels) {
                if (label.textContent === targetName) {
                    const caret =
                        label.closest(".collaboration-cursor__caret") ||
                        label.parentElement;
                    if (caret) {
                        caret.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        });
                        (caret as HTMLElement).classList.add("jump-highlight");
                        setTimeout(
                            () =>
                                (caret as HTMLElement).classList.remove(
                                    "jump-highlight"
                                ),
                            2000
                        );
                    }
                    useJumpToUser.getState().clear();
                    return;
                }
            }

            // Strategy 2: Find by yRemoteSelectionHead data-user attribute
            const heads = Array.from(
                document.querySelectorAll(".yRemoteSelectionHead")
            );
            for (const head of heads) {
                if (
                    (head as HTMLElement).dataset.user === targetName ||
                    head.getAttribute("data-user") === targetName
                ) {
                    head.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                    (head as HTMLElement).classList.add("jump-highlight");
                    setTimeout(
                        () =>
                            (head as HTMLElement).classList.remove(
                                "jump-highlight"
                            ),
                        2000
                    );
                    useJumpToUser.getState().clear();
                    return;
                }
            }

            // Target cursor not found in DOM (user may not have a visible cursor)
            useJumpToUser.getState().clear();
        });

        return unsub;
    }, [provider]);

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
