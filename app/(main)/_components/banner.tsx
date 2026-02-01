"use client";

import { Button } from "@/components/ui/button";
import { useRemoveDocument, useRestoreDocument } from "@/hooks/use-documents";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/modals/confirm-modal";
interface BannerProps {
    documentId: string;
}

export const Banner = ({
    documentId
}: BannerProps) => {
    const router = useRouter();
    const removeMutation = useRemoveDocument();
    const restoreMutation = useRestoreDocument();

    const onRemove = () => {
        const promise = removeMutation.mutateAsync(documentId)

        toast.promise(promise, {
            loading: "Deleting note...",
            success: "Note deleted!",
            error: "Failed to delete note."
        });

        router.push("/documents");
    }
    const onRestore = () => {
        const promise = restoreMutation.mutateAsync(documentId);

        toast.promise(promise, {
            loading: "Restoring note...",
            success: "Note resotred!",
            error: "Failed to resotre note."
        });
    }

    return (
        <div className="w-full bg-destructive text-center text-sm p-2 text-white flex items-center gap-x-2 justify-center">
            <p>
                This page is in the Trash
            </p>
            <Button
                size="sm"
                onClick={onRestore}
                variant="outline"
                className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
            >
                Restore page
            </Button>
            <ConfirmModal onConfirm={onRemove}>
                <Button
                    size="sm"
                    variant="outline"
                    className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
                >
                    Delete forever    
                </Button>
            </ConfirmModal>
        </div>
    )
}