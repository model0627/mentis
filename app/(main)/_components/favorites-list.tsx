"use client";

import { useFavorites } from "@/hooks/use-favorites";
import { useSearchDocs } from "@/hooks/use-documents";
import { useParams, useRouter } from "next/navigation";
import { Item } from "./item";
import { FileIcon } from "lucide-react";

export const FavoritesList = () => {
    const params = useParams();
    const router = useRouter();
    const favoriteIds = useFavorites((s) => s.favoriteIds);
    const { data: allDocs } = useSearchDocs();

    // Filter to only favorites that still exist and aren't archived
    const favoriteDocs = allDocs?.filter(
        (doc) => favoriteIds.includes(doc.id) && !doc.isArchived
    ) || [];

    if (favoriteDocs.length === 0) return null;

    return (
        <>
            {favoriteDocs.map((document) => (
                <Item
                    key={document.id}
                    id={document.id}
                    onClick={() => router.push(`/documents/${document.id}`)}
                    label={document.title}
                    icon={FileIcon}
                    documentIcon={document.icon ?? undefined}
                    active={params.documentId === document.id}
                    level={0}
                    workspace={document.workspace}
                />
            ))}
        </>
    );
};
