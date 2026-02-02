"use client";

import { useEffect, useState } from "react";
import { SettingsModal } from "@/components/modals/settings-modal";
import { CoverImageStore } from "@/components/modals/cover-image-modal";
import { PermissionsModal } from "@/components/modals/permissions-modal";
import { MembersModal } from "@/components/modals/members-modal";
import { MoveModal } from "@/components/modals/move-modal";

export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;
    
    return (
        <>
            <SettingsModal />
            <CoverImageStore />
            <PermissionsModal />
            <MembersModal />
            <MoveModal />
        </>
    )
}