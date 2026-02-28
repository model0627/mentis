"use client";

import { Document } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useSidebar, useUpdateDocument } from "@/hooks/use-documents";
import { toast } from "sonner";
import { Item } from "./item";
import { cn } from "@/lib/utils";
import { FileIcon } from "lucide-react";

interface DocumentListProps {
    parentDocumentId?: string;
    level?: number;
    data?: Document[];
    workspace?: string;
}
export const DocumentList = ({
    parentDocumentId,
    level = 0,
    workspace = "private",
}: DocumentListProps) => {
    const params = useParams();
    const router = useRouter();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const onExpand = (documentId: string) => {
        setExpanded(prevExpanded => ({
            ...prevExpanded,
            [documentId]: !prevExpanded[documentId]
        }));
    };

    const { data: documents, isLoading } = useSidebar(parentDocumentId, workspace);

    const onRedirect = (documentId: string) => {
        router.push(`/documents/${documentId}`);
    };

    const updateMutation = useUpdateDocument();
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, docId: string) => {
        e.dataTransfer.setData("text/plain", docId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, docId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverId(docId);
    };

    const handleDragLeave = () => {
        setDragOverId(null);
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        setDragOverId(null);
        const sourceId = e.dataTransfer.getData("text/plain");
        if (!sourceId || sourceId === targetId) return;

        const promise = updateMutation.mutateAsync({
            id: sourceId,
            parentDocument: targetId,
        });

        toast.promise(promise, {
            loading: "Moving document...",
            success: "Document moved!",
            error: "Failed to move document.",
        });

        // Auto-expand the target so user sees the moved doc
        if (!expanded[targetId]) {
            onExpand(targetId);
        }
    };

    if (isLoading) {
        return (
            <>
                <Item.Skeleton level={level} />
                {level === 0 && (
                    <>
                        <Item.Skeleton level={level} />
                        <Item.Skeleton level={level} />
                    </>
                )}
            </>
        )
    }

    return (
    <>
        <p
            style={{
            paddingLeft: level ? `${(level * 12) + 25}px` : undefined
            }}
            className={cn(
            "hidden text-sm font-medium text-muted-foreground/80",
            expanded && "last:block",
            level === 0 && "hidden"
            )}
        >
            No pages inside
        </p>
        {documents?.map((document) => (
            <div
                key={document.id}
                draggable
                onDragStart={(e) => handleDragStart(e, document.id)}
                onDragOver={(e) => handleDragOver(e, document.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, document.id)}
                className={dragOverId === document.id ? "bg-primary/10 rounded-sm" : ""}
            >
                <Item
                    id={document.id}
                    onClick={() => onRedirect(document.id)}
                    label={document.title}
                    icon={FileIcon}
                    documentIcon={document.icon ?? undefined}
                    active={params.documentId === document.id}
                    level={level}
                    onExpand={() => onExpand(document.id)}
                    expanded={expanded[document.id]}
                    workspace={workspace}
                />
                {expanded[document.id] && (
                    <DocumentList
                        parentDocumentId={document.id}
                        level={level + 1}
                        workspace={workspace}
                    />
                )}
            </div>
        ))}
        {level === 0 && (
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setDragOverId("__root__");
                }}
                onDragLeave={handleDragLeave}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragOverId(null);
                    const sourceId = e.dataTransfer.getData("text/plain");
                    if (!sourceId) return;
                    const promise = updateMutation.mutateAsync({
                        id: sourceId,
                        parentDocument: null,
                    });
                    toast.promise(promise, {
                        loading: "Moving to root...",
                        success: "Moved to root!",
                        error: "Failed to move document.",
                    });
                }}
                className={cn(
                    "h-6 mx-2 my-1 rounded border-2 border-dashed border-transparent transition-colors",
                    dragOverId === "__root__" && "border-primary/30 bg-primary/5"
                )}
            />
        )}
    </>
    )
}
