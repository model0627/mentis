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

const roleLabelMap: Record<WorkspaceRole, string> = {
    owner: "소유자",
    admin: "관리자",
    member: "멤버",
};

function RoleBadge({ role }: { role: WorkspaceRole }) {
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
                            멤버
                            {users && (
                                <span className="ml-2 text-muted-foreground text-[14px] font-normal">
                                    {activeCount}명
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
                                    멤버 초대
                                </Button>
                            )}
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="이름 또는 이메일로 검색..."
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
                                    {showInactive ? "활성만" : "비활성 포함"}
                                </Button>
                            )}
                        </div>

                        {/* Invite link creation UI */}
                        {showInvite && isAdmin && (
                            <div className="border border-border rounded-r2 p-4 space-y-3 bg-accent/30">
                                <div className="flex items-center justify-between">
                                    <p className="text-[14px] font-medium text-foreground">
                                        초대 링크 생성
                                    </p>
                                    <button
                                        onClick={() => setShowInvite(false)}
                                        className="text-muted-foreground hover:text-foreground text-sm"
                                    >
                                        닫기
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
                                        <option value="member">멤버</option>
                                        {isOwner && <option value="admin">관리자</option>}
                                    </select>
                                    <Button
                                        size="sm"
                                        onClick={handleCreateInvite}
                                        disabled={createInvitation.isPending}
                                        className="gap-1.5"
                                    >
                                        <LinkIcon className="h-3.5 w-3.5" />
                                        {createInvitation.isPending
                                            ? "생성 중..."
                                            : "링크 생성"}
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
                                            {copied ? "복사됨" : "복사"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Table header */}
                        <div className="grid grid-cols-[1fr_120px_40px] px-3 pb-1 border-b border-border">
                            <span className="text-muted-foreground text-[13px] font-medium">
                                사용자
                            </span>
                            <span className="text-muted-foreground text-[13px] font-medium">
                                역할
                            </span>
                            <span />
                        </div>

                        {/* Member list */}
                        <div className="max-h-[400px] overflow-y-auto -mx-1">
                            {isLoading ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    불러오는 중...
                                </p>
                            ) : filtered.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    {search
                                        ? "검색 결과가 없습니다."
                                        : "멤버가 없습니다."}
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
                                                        {user.name || "이름 없음"}
                                                        {isSelf && (
                                                            <span className="ml-1 text-muted-foreground text-[12px]">
                                                                (나)
                                                            </span>
                                                        )}
                                                        {!user.isActive && (
                                                            <span className="ml-1 text-red-500 text-[12px]">
                                                                비활성
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
                                                            <RoleBadge role={userRole} />
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
                                                                관리자
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
                                                            멤버
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : (
                                                <RoleBadge role={userRole} />
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
                                                            ? "비활성화"
                                                            : "활성화"
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
                                ? "멤버 비활성화"
                                : "멤버 활성화"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction === "deactivate"
                                ? `${confirmUser?.name || confirmUser?.email}님을 비활성화하시겠습니까? 비활성화된 멤버는 로그인할 수 없습니다.`
                                : `${confirmUser?.name || confirmUser?.email}님을 다시 활성화하시겠습니까?`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmAction}
                            className={
                                confirmAction === "deactivate"
                                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    : ""
                            }
                        >
                            {confirmAction === "deactivate"
                                ? "비활성화"
                                : "활성화"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
