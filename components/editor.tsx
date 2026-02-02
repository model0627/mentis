"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";

import "@blocknote/shadcn/style.css";
import { useTheme } from "next-themes";
import { fileStorage } from "@/lib/upload";
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
