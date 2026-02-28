"use client";

import dynamic from "next/dynamic";
import { useDocument, useUpdateDocument } from "@/hooks/use-documents";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useCallback, useRef, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useYjs } from "@/hooks/use-yjs";
import { useSyncStatus } from "@/hooks/use-sync-status";
import { useVersionHistory } from "@/hooks/use-version-history";
import { useFocusMode } from "@/hooks/use-focus-mode";

interface DocumentIdPageProps {
    params: Promise<{
        documentId: string;
    }>;
};

const DocumentIdPage = ({
    params
}: DocumentIdPageProps) => {
    const { documentId } = use(params);
    const Editor = useMemo(() => dynamic(() => import("@/components/editor"), { ssr: false } ), [])
    const { data: document, isLoading } = useDocument(documentId);
    const updateMutation = useUpdateDocument();
    const { data: session } = useSession();
    const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const userId = session?.user?.id;
    const focusModeEnabled = useFocusMode((s) => s.enabled);
    const { provider, fragment, titleText, setTyping } = useYjs(documentId, session?.user?.name || undefined);

    const canEditDoc = document
        ? document.isLocked
            ? false
            : document.workspace === "private"
                ? document.userId === userId
                : true
        : false;

    const onChange = useCallback((content: string) => {
        setTyping(true);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setTyping(false), 3000);

        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            useSyncStatus.getState().setSaving();
            updateMutation.mutate(
                {
                    id: documentId,
                    content
                },
                {
                    onSuccess: () => {
                        useSyncStatus.getState().setSaved();

                        // Capture a version snapshot
                        let contentPreview = "";
                        try {
                            const blocks = JSON.parse(content);
                            if (Array.isArray(blocks)) {
                                const textParts: string[] = [];
                                for (const block of blocks) {
                                    if (block.content && Array.isArray(block.content)) {
                                        for (const item of block.content) {
                                            if (item.text) textParts.push(item.text);
                                        }
                                    }
                                    if (textParts.join(" ").length > 100) break;
                                }
                                contentPreview = textParts.join(" ").slice(0, 100);
                            }
                        } catch {
                            contentPreview = content.slice(0, 100);
                        }

                        const currentUserName = session?.user?.name || "Anonymous";
                        useVersionHistory.getState().addVersion({
                            timestamp: Date.now(),
                            userName: currentUserName,
                            userColor: "#4ECDC4",
                            contentPreview,
                            contentSnapshot: content,
                        });
                    },
                    onError: () => {
                        useSyncStatus.getState().setOffline();
                    },
                }
            );
        }, 2000);
    }, [documentId, updateMutation, setTyping, session?.user?.name]);

    // Handle restore from version history
    const pendingRestore = useVersionHistory((s) => s.pendingRestore);
    useEffect(() => {
        if (!pendingRestore) return;
        useSyncStatus.getState().setSaving();
        updateMutation.mutate(
            {
                id: documentId,
                content: pendingRestore,
            },
            {
                onSuccess: () => {
                    useSyncStatus.getState().setSaved();
                },
                onError: () => {
                    useSyncStatus.getState().setOffline();
                },
            }
        );
        useVersionHistory.getState().clearRestore();
    }, [pendingRestore, documentId, updateMutation]);

    if (isLoading) {
        return (
            <div>
                <Cover.Skeleton />
                <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
                    <div className="space-y-4 pl-8 pt-4">
                        <Skeleton className="h-14 w-[50%]" />
                        <Skeleton className="h-4 w-[50%]" />
                        <Skeleton className="h-4 w-[50%]" />
                        <Skeleton className="h-4 w-[50%]" />
                    </div>
                </div>
            </div>
        )
    }

    if (!document) {
        return (
            <div>
                Not found
            </div>
        )
    }

    return (
        <div className={`pb-40 ${document.smallText ? "text-sm" : ""} ${focusModeEnabled ? "focus-mode" : ""}`}>
            <Cover url={document.coverImage ?? undefined} />
            <div className="h-[10vh]" />
            <div className={document.fullWidth ? "mx-auto px-12" : "md:max-w-3xl lg:max-w-4xl mx-auto"}>
                <Toolbar initialData={document} editable={canEditDoc} titleText={titleText} />
                <Editor
                    onChange={onChange}
                    initialContent={document.content ?? undefined}
                    editable={canEditDoc}
                    provider={provider}
                    fragment={fragment}
                    userName={session?.user?.name || undefined}
                />
            </div>
        </div>
    )
}

export default DocumentIdPage;
