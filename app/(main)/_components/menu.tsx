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
import { useArchiveDocument } from "@/hooks/use-documents";
import { usePermissionsModal } from "@/hooks/use-permissions-modal";
import { toast } from "sonner";
import { MoreHorizontal, Shield, Trash } from "lucide-react";
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

    const archiveMutation = useArchiveDocument();

    const onArchive = () => {
        const promise = archiveMutation.mutateAsync(documentId);

        toast.promise(promise, {
            loading: "Moving to trash...",
            success: "Note moved to trash!",
            error: "Failed to archive note."
        });

        router.push("/documents");
    }

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
                <DropdownMenuItem onClick={onArchive}>
                    <Trash className="h-4 w-4 mr-2" />
                        Delete
                </DropdownMenuItem>
                {workspace === "shared" && (
                    <DropdownMenuItem onClick={() => permissionsModal.onOpen(documentId)}>
                        <Shield className="h-4 w-4 mr-2" />
                        Manage Permissions
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
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
