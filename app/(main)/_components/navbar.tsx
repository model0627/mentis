"use client";

import { useDocument } from "@/hooks/use-documents";
import { MenuIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { Title } from "./title";
import { Banner } from "./banner";
import { Menu } from "./menu";
import { Publish } from "./publish";
import { Collaborators } from "./collaborators";

interface NavbarProps {
    isCollapsed: boolean;
    onResetWidth: () => void;
};

export const Navbar = ({
    isCollapsed,
    onResetWidth
}: NavbarProps) => {
    const params = useParams();
    
    const { data: document, isLoading } = useDocument(params.documentId as string);

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
                    <Title initialData={document} />
                    <div className="flex items-center gap-x-2">
                        <Collaborators />
                        <Publish initialData={document} />
                        <Menu documentId={document.id} />
                    </div>
                </div>
            </nav>
            {document.isArchived && (
                <Banner documentId={document.id} />
            )}
        </>
    )
}