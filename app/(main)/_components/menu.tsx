"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    useArchiveDocument,
    useDocument,
    useDuplicateDocument,
    useUpdateDocument,
} from "@/hooks/use-documents";
import { useMoveModal } from "@/hooks/use-move-modal";
import { usePermissionsModal } from "@/hooks/use-permissions-modal";
import { toast } from "sonner";
import {
    ArrowUpRight,
    Copy,
    Link,
    Lock,
    Maximize,
    MoreHorizontal,
    Shield,
    Trash,
    Type,
    Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuProps {
    documentId: string;
    workspace?: string;
};

export const Menu = ({
    documentId,
    workspace,
}: MenuProps) => {
    const router = useRouter();
    const { data: session } = useSession();
    const permissionsModal = usePermissionsModal();
    const moveModal = useMoveModal();
    const { data: document } = useDocument(documentId);

    const archiveMutation = useArchiveDocument();
    const duplicateMutation = useDuplicateDocument();
    const updateMutation = useUpdateDocument();

    const userId = session?.user?.id;
    const isOwner = document?.userId === userId;

    const onCopyLink = () => {
        navigator.clipboard.writeText(
            `${window.location.origin}/documents/${documentId}`
        );
        toast.success("Link copied!");
    };

    const onDuplicate = () => {
        if (!document) return;
        const promise = duplicateMutation.mutateAsync(document);

        toast.promise(promise, {
            loading: "Duplicating page...",
            success: "Page duplicated!",
            error: "Failed to duplicate page.",
        });
    };

    const onMove = () => {
        moveModal.onOpen(documentId);
    };

    const onArchive = () => {
        const promise = archiveMutation.mutateAsync(documentId);

        toast.promise(promise, {
            loading: "Moving to trash...",
            success: "Note moved to trash!",
            error: "Failed to archive note."
        });

        router.push("/documents");
    };

    const onToggleSmallText = () => {
        if (!document) return;
        updateMutation.mutate({
            id: documentId,
            smallText: !document.smallText,
        });
    };

    const onToggleFullWidth = () => {
        if (!document) return;
        updateMutation.mutate({
            id: documentId,
            fullWidth: !document.fullWidth,
        });
    };

    const onToggleLock = () => {
        if (!document) return;
        const promise = updateMutation.mutateAsync({
            id: documentId,
            isLocked: !document.isLocked,
        });

        toast.promise(promise, {
            loading: document.isLocked ? "Unlocking page..." : "Locking page...",
            success: document.isLocked ? "Page unlocked!" : "Page locked!",
            error: "Failed to update page lock.",
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-60"
                align="end" alignOffset={8} forceMount
            >
                <DropdownMenuItem onClick={onCopyLink}>
                    <Link className="h-4 w-4 mr-2" />
                    Copy link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onMove}>
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Move to
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onArchive}>
                    <Trash className="h-4 w-4 mr-2" />
                    Move to trash
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onToggleSmallText}>
                    <Type className="h-4 w-4 mr-2" />
                    Small text
                    <span className="ml-auto text-xs text-muted-foreground">
                        {document?.smallText ? "On" : "Off"}
                    </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleFullWidth}>
                    <Maximize className="h-4 w-4 mr-2" />
                    Full width
                    <span className="ml-auto text-xs text-muted-foreground">
                        {document?.fullWidth ? "On" : "Off"}
                    </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isOwner && (
                    <>
                        <DropdownMenuItem onClick={onToggleLock}>
                            {document?.isLocked ? (
                                <Unlock className="h-4 w-4 mr-2" />
                            ) : (
                                <Lock className="h-4 w-4 mr-2" />
                            )}
                            {document?.isLocked ? "Unlock page" : "Lock page"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}
                {workspace === "shared" && (
                    <DropdownMenuItem onClick={() => permissionsModal.onOpen(documentId)}>
                        <Shield className="h-4 w-4 mr-2" />
                        Manage Permissions
                    </DropdownMenuItem>
                )}
                <div className="text-xs text-muted-foreground p-2">
                    Last edited by: {session?.user?.name}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

Menu.Skeleton = function MenuSkeleton() {
    return (
        <Skeleton className="h-10 w-10" />
    )
}
