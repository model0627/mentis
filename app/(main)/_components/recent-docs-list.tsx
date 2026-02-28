"use client";

import { useRecentDocs } from "@/hooks/use-recent-docs";
import { useSearchDocs } from "@/hooks/use-documents";
import { useParams, useRouter } from "next/navigation";
import { Item } from "./item";
import { FileIcon } from "lucide-react";

export const RecentDocsList = () => {
    const params = useParams();
    const router = useRouter();
    const recentIds = useRecentDocs((s) => s.recentIds);
    const { data: allDocs } = useSearchDocs();

    if (!allDocs || recentIds.length === 0) return null;

    // Resolve doc objects in recent order, skip archived/deleted
    const recentDocs = recentIds
        .map((id) => allDocs.find((d) => d.id === id))
        .filter((d): d is NonNullable<typeof d> => !!d && !d.isArchived);

    if (recentDocs.length === 0) return null;

    return (
        <>
            {recentDocs.map((doc) => (
                <Item
                    key={doc.id}
                    id={doc.id}
                    onClick={() => router.push(`/documents/${doc.id}`)}
                    label={doc.title}
                    icon={FileIcon}
                    documentIcon={doc.icon ?? undefined}
                    active={params.documentId === doc.id}
                    level={0}
                    workspace={doc.workspace}
                />
            ))}
        </>
    );
};
