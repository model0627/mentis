"use client";

import dynamic from "next/dynamic";
import { useDocument, useUpdateDocument } from "@/hooks/use-documents";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

interface DocumentIdPageProps {
    params: {
        documentId: string;
    };
};

const DocumentIdPage = ({
    params
}: DocumentIdPageProps) => {
    const Editor = useMemo(() => dynamic(() => import("@/components/editor"), { ssr: false } ), [])
    const { data: document, isLoading } = useDocument(params.documentId);
    const updateMutation = useUpdateDocument();
    const { data: session } = useSession();
    const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

    const onChange = useCallback((content: string) => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            updateMutation.mutate({
                id: params.documentId,
                content
            });
        }, 2000);
    }, [params.documentId, updateMutation]);

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
        <div className="pb-40">
            <Cover url={document.coverImage ?? undefined} />
            <div className="h-[35vh]" />
            <div className="md:max-w-3xl lg:md-max-w-4xl mx-auto">
                <Toolbar initialData={document} />
                <Editor
                    onChange={onChange}
                    initialContent={document.content ?? undefined}
                    documentId={params.documentId}
                    userName={session?.user?.name || undefined}
                />
            </div>
        </div>
    )
}

export default DocumentIdPage;
