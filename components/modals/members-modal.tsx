"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog";
import { useMembersModal } from "@/hooks/use-members-modal";
import {
    useMembers,
    useChangeRole,
    useDeactivateUser,
    useActivateUser,
    useCreateInvitation,
} from "@/hooks/use-members";
import { useIsAdmin, useIsOwner } from "@/hooks/use-current-role";
import { useChatT } from "@/hooks/use-chat-t";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Search,
    UserPlus,
    ChevronDown,
    Copy,
    Check,
    Shield,
    Crown,
    UserX,
    UserCheck,
    Link as LinkIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { WorkspaceRole } from "@/lib/types";
import { WorkspaceUser } from "@/lib/api";
import type { ChatTranslations } from "@/lib/chat-i18n";

function getRoleLabelMap(t: ChatTranslations): Record<WorkspaceRole, string> {
    return {
        owner: t.roleOwner,
        admin: t.roleAdmin,
        member: t.roleMember,
    };
}

function RoleBadge({ role, t }: { role: WorkspaceRole; t: ChatTranslations }) {
    const roleLabelMap = getRoleLabelMap(t);
    if (role === "owner") {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-r1 bg-brand/10 text-brand text-[12px] font-medium w-fit">
                <Crown className="h-3 w-3" />
                {roleLabelMap[role]}
            </span>
        );
    }
    if (role === "admin") {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-r1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[12px] font-medium w-fit">
                <Shield className="h-3 w-3" />
                {roleLabelMap[role]}
            </span>
        );
    }
    return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-r1 bg-secondary text-muted-foreground text-[12px] font-medium w-fit">
            {roleLabelMap[role]}
        </span>
    );
}

export const MembersModal = () => {
    const { isOpen, onClose } = useMembersModal();
    const { data: session } = useSession();
    const currentUserId = session?.user?.id;
    const isAdmin = useIsAdmin();
    const isOwner = useIsOwner();
    const t = useChatT();

    const [showInactive, setShowInactive] = useState(false);
    const [search, setSearch] = useState("");

    // Invite UI state
    const [showInvite, setShowInvite] = useState(false);
    const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
    const [inviteLink, setInviteLink] = useState("");
    const [copied, setCopied] = useState(false);

    // Confirm dialog state
    const [confirmUser, setConfirmUser] = useState<WorkspaceUser | null>(null);
    const [confirmAction, setConfirmAction] = useState<"deactivate" | "activate" | null>(null);

    const { data: users, isLoading } = useMembers(showInactive);
    const changeRole = useChangeRole();
    const deactivateUser = useDeactivateUser();
    const activateUser = useActivateUser();
    const createInvitation = useCreateInvitation();

    const filtered = useMemo(() => {
        if (!users) return [];
        if (!search.trim()) return users;
        const q = search.toLowerCase();
        return users.filter(
            (u) =>
                u.name?.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q)
        );
    }, [users, search]);

    const activeCount = useMemo(() => {
        if (!users) return 0;
        return users.filter((u) => u.isActive).length;
    }, [users]);

    const handleCreateInvite = async () => {
        try {
            const invitation = await createInvitation.mutateAsync({
                role: inviteRole,
            });
            const link = `${window.location.origin}/invite/${invitation.token}`;
            setInviteLink(link);
        } catch {
            // error handled by mutation
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRoleChange = (userId: string, role: WorkspaceRole) => {
        changeRole.mutate({ userId, role });
    };

    const handleConfirmAction = () => {
        if (!confirmUser || !confirmAction) return;
        if (confirmAction === "deactivate") {
            deactivateUser.mutate(confirmUser.id);
        } else {
            activateUser.mutate(confirmUser.id);
        }
        setConfirmUser(null);
        setConfirmAction(null);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader className="border-b border-border pb-4">
                        <h2 className="text-lg font-medium text-foreground">
                            {t.membersTitle}
                            {users && (
                                <span className="ml-2 text-muted-foreground text-[14px] font-normal">
                                    {t.membersCount(activeCount)}
                                </span>
                            )}
                        </h2>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Action bar */}
                        <div className="flex items-center gap-2">
                            {isAdmin && (
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setShowInvite(true);
                                        setInviteLink("");
                                        setCopied(false);
                                        setInviteRole("member");
                                    }}
                                    className="shrink-0 gap-1.5 bg-brand hover:bg-brand/90 text-white"
                                >
                                    <UserPlus className="h-3.5 w-3.5" />
                                    {t.inviteMembers}
                                </Button>
                            )}
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t.searchByNameOrEmail}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 h-8"
                                />
                            </div>
                            {isAdmin && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowInactive(!showInactive)}
                                    className="shrink-0 text-[13px]"
                                >
                                    {showInactive ? t.activeOnly : t.includeInactive}
                                </Button>
                            )}
                        </div>

                        {/* Invite link creation UI */}
                        {showInvite && isAdmin && (
                            <div className="border border-border rounded-r2 p-4 space-y-3 bg-accent/30">
                                <div className="flex items-center justify-between">
                                    <p className="text-[14px] font-medium text-foreground">
                                        {t.createInviteLink}
                                    </p>
                                    <button
                                        onClick={() => setShowInvite(false)}
                                        className="text-muted-foreground hover:text-foreground text-sm"
                                    >
                                        {t.close}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={inviteRole}
                                        onChange={(e) =>
                                            setInviteRole(e.target.value as "member" | "admin")
                                        }
                                        className="h-8 rounded-r2 border border-border bg-background px-2 text-[13px]"
                                    >
                                        <option value="member">{t.roleMember}</option>
                                        {isOwner && <option value="admin">{t.roleAdmin}</option>}
                                    </select>
                                    <Button
                                        size="sm"
                                        onClick={handleCreateInvite}
                                        disabled={createInvitation.isPending}
                                        className="gap-1.5"
                                    >
                                        <LinkIcon className="h-3.5 w-3.5" />
                                        {createInvitation.isPending
                                            ? t.creating
                                            : t.createLink}
                                    </Button>
                                </div>
                                {inviteLink && (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            readOnly
                                            value={inviteLink}
                                            className="h-8 text-[13px] flex-1"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopy}
                                            className="shrink-0 gap-1.5"
                                        >
                                            {copied ? (
                                                <Check className="h-3.5 w-3.5" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                            {copied ? t.copied : t.copy}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Table header */}
                        <div className="grid grid-cols-[1fr_120px_40px] px-3 pb-1 border-b border-border">
                            <span className="text-muted-foreground text-[13px] font-medium">
                                {t.userColumn}
                            </span>
                            <span className="text-muted-foreground text-[13px] font-medium">
                                {t.roleColumn}
                            </span>
                            <span />
                        </div>

                        {/* Member list */}
                        <div className="max-h-[400px] overflow-y-auto -mx-1">
                            {isLoading ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    {t.loading}
                                </p>
                            ) : filtered.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    {search
                                        ? t.noSearchResults
                                        : t.noMembers}
                                </p>
                            ) : (
                                filtered.map((user) => {
                                    const initials =
                                        (user.name || user.email)[0]?.toUpperCase() || "?";
                                    const userRole = (user.role || "member") as WorkspaceRole;
                                    const isSelf = user.id === currentUserId;
                                    const canChangeRole =
                                        isAdmin &&
                                        !isSelf &&
                                        userRole !== "owner";
                                    const canToggleActive =
                                        isAdmin &&
                                        !isSelf &&
                                        userRole !== "owner";

                                    return (
                                        <div
                                            key={user.id}
                                            className={`grid grid-cols-[1fr_120px_40px] items-center px-3 py-2.5 mx-1 rounded-r1 hover:bg-accent/50 transition-colors ${
                                                !user.isActive ? "opacity-50" : ""
                                            }`}
                                        >
                                            {/* User info */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="h-8 w-8 shrink-0">
                                                    {user.image && (
                                                        <AvatarImage src={user.image} />
                                                    )}
                                                    <AvatarFallback className="text-xs font-bold bg-brand text-white">
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-foreground text-[14px] font-medium truncate">
                                                        {user.name || t.unnamed}
                                                        {isSelf && (
                                                            <span className="ml-1 text-muted-foreground text-[12px]">
                                                                {t.selfLabel}
                                                            </span>
                                                        )}
                                                        {!user.isActive && (
                                                            <span className="ml-1 text-red-500 text-[12px]">
                                                                {t.inactive}
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-muted-foreground text-[13px] truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Role badge / dropdown */}
                                            {canChangeRole ? (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="flex items-center gap-1 hover:bg-accent rounded-r1 px-1 py-0.5 transition-colors">
                                                            <RoleBadge role={userRole} t={t} />
                                                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start">
                                                        {isOwner && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleRoleChange(
                                                                        user.id,
                                                                        "admin"
                                                                    )
                                                                }
                                                            >
                                                                <Shield className="h-4 w-4 mr-2 text-blue-500" />
                                                                {t.roleAdmin}
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleRoleChange(
                                                                    user.id,
                                                                    "member"
                                                                )
                                                            }
                                                        >
                                                            {t.roleMember}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : (
                                                <RoleBadge role={userRole} t={t} />
                                            )}

                                            {/* Actions */}
                                            {canToggleActive ? (
                                                <button
                                                    onClick={() => {
                                                        setConfirmUser(user);
                                                        setConfirmAction(
                                                            user.isActive
                                                                ? "deactivate"
                                                                : "activate"
                                                        );
                                                    }}
                                                    className="flex items-center justify-center h-7 w-7 rounded-r1 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                                                    title={
                                                        user.isActive
                                                            ? t.deactivate
                                                            : t.activate
                                                    }
                                                >
                                                    {user.isActive ? (
                                                        <UserX className="h-4 w-4" />
                                                    ) : (
                                                        <UserCheck className="h-4 w-4" />
                                                    )}
                                                </button>
                                            ) : (
                                                <span />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirm dialog for activate/deactivate */}
            <AlertDialog
                open={!!confirmUser && !!confirmAction}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmUser(null);
                        setConfirmAction(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmAction === "deactivate"
                                ? t.deactivateMember
                                : t.activateMember}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction === "deactivate"
                                ? t.deactivateConfirm(confirmUser?.name || confirmUser?.email || "")
                                : t.activateConfirm(confirmUser?.name || confirmUser?.email || "")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmAction}
                            className={
                                confirmAction === "deactivate"
                                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    : ""
                            }
                        >
                            {confirmAction === "deactivate"
                                ? t.deactivate
                                : t.activate}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
