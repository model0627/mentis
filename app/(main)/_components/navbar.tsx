"use client";

import { useDocument, useBreadcrumbs } from "@/hooks/use-documents";
import { ChevronRight, Lock, MenuIcon, Shield } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Title } from "./title";
import { Banner } from "./banner";
import { Menu } from "./menu";
import { Publish } from "./publish";
import { Collaborators } from "./collaborators";
import { ActiveEditorsBanner } from "./active-editors-banner";
import { Button } from "@/components/ui/button";
import { usePermissionsModal } from "@/hooks/use-permissions-modal";
import { ChatPageButton } from "@/components/chat/chat-page-button";

interface NavbarProps {
    isCollapsed: boolean;
    onResetWidth: () => void;
};

export const Navbar = ({
    isCollapsed,
    onResetWidth
}: NavbarProps) => {
    const params = useParams();
    const { data: session } = useSession();
    const permissionsModal = usePermissionsModal();

    const router = useRouter();
    const documentId = params.documentId as string;
    const { data: document, isLoading } = useDocument(documentId);
    const { data: ancestors } = useBreadcrumbs(documentId);

    const userId = session?.user?.id;
    const isShared = document?.workspace === "shared";
    // Owner or admin can manage permissions (simplified client-side check)
    const canManage = isShared && document && (document.userId === userId);
    // For edit access: private = owner only, shared = owner (viewers can't edit)
    const canEditDoc = document
        ? document.workspace === "private"
            ? document.userId === userId
            : true // shared docs default editable; server will reject if no role
        : false;

    if (isLoading) {
        return (
            <nav className="bg-background px-3 py-2 w-full flex items-center justify-between">
                <Title.Skeleton />
                <div className="flex items-center gap-x-2">
                    <Menu.Skeleton />
                </div>
            </nav>
        )
    }

    if (!document) {
        return null;
    }

    return (
        <>
            <nav className="bg-background px-3 py-2 w-full flex items-center gap-x-4">
                {isCollapsed && (
                    <MenuIcon
                        role="button"
                        onClick={onResetWidth}
                        className="h-6 w-2 text-muted-foreground"
                    />
                )}
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center min-w-0">
                        {ancestors && ancestors.length > 0 && (
                            <div className="hidden md:flex items-center">
                                {ancestors.map((ancestor) => (
                                    <div key={ancestor.id} className="flex items-center">
                                        <button
                                            onClick={() => router.push(`/documents/${ancestor.id}`)}
                                            className="flex items-center gap-x-1 text-sm text-muted-foreground hover:text-foreground transition truncate max-w-[120px]"
                                        >
                                            {ancestor.icon && <span className="shrink-0">{ancestor.icon}</span>}
                                            <span className="truncate">{ancestor.title}</span>
                                        </button>
                                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground mx-1" />
                                    </div>
                                ))}
                            </div>
                        )}
                        <Title initialData={document} editable={canEditDoc} />
                    </div>
                    <div className="flex items-center gap-x-2">
                        {document.isLocked && (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Collaborators />
                        {canManage && (
                            <Button
                                onClick={() => permissionsModal.onOpen(document.id)}
                                variant="ghost"
                                size="sm"
                            >
                                <Shield className="h-4 w-4" />
                            </Button>
                        )}
                        {isShared && (
                            <ChatPageButton documentId={document.id} />
                        )}
                        <Publish initialData={document} />
                        <Menu documentId={document.id} workspace={document.workspace} />
                    </div>
                </div>
            </nav>
            <ActiveEditorsBanner />
            {document.isArchived && (
                <Banner documentId={document.id} />
            )}
        </>
    )
}
