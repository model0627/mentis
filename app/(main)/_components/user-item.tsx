"use client";
import { ChevronDown, Settings, Users, MoreHorizontal, Check } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useMembersModal } from "@/hooks/use-members-modal";
import { useMembers } from "@/hooks/use-members";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export const UserItem = () => {
    const { data: session } = useSession();
    const membersModal = useMembersModal();
    const { data: members } = useMembers();

    const memberCount = members?.length ?? 0;
    const userName = session?.user?.name || "User";
    const userEmail = session?.user?.email || "";
    const userImage = session?.user?.image || "";
    const initials = userName.charAt(0).toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div
                    role="button"
                    className="flex items-center gap-x-2 p-3 w-full hover:bg-accent/50 transition-colors"
                >
                    {/* Workspace Icon */}
                    <div className="h-5 w-5 rounded-[4px] bg-brand flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-[10px] leading-none">M</span>
                    </div>
                    <span className="text-sm font-medium truncate flex-1 text-start">
                        {userName}&apos;s Mentis
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-[340px] p-0 rounded-r3 shadow-s3"
                align="start"
                alignOffset={11}
                forceMount
            >
                {/* ── Header: Workspace Info ── */}
                <div className="px-4 pt-4 pb-3">
                    <div className="flex items-center gap-x-3">
                        <div className="h-9 w-9 rounded-r2 bg-brand flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-base leading-none">M</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[0.9375rem] font-bold leading-tight truncate text-foreground">
                                {userName}&apos;s Mentis
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                개인 요금제 - {memberCount}명의 멤버
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3">
                        <button className="inline-flex items-center gap-1.5 px-3 py-[6px] rounded-r2 border border-border bg-background text-[13px] font-medium text-muted-foreground hover:bg-accent transition-colors">
                            <Settings className="h-3.5 w-3.5" />
                            설정
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                membersModal.onOpen();
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-[6px] rounded-r2 border border-border bg-background text-[13px] font-medium text-muted-foreground hover:bg-accent transition-colors"
                        >
                            <Users className="h-3.5 w-3.5" />
                            멤버
                        </button>
                    </div>
                </div>

                <DropdownMenuSeparator className="mx-0" />

                {/* ── Account Section ── */}
                <div className="py-1">
                    {/* Email + More */}
                    <div className="flex items-center justify-between px-4 py-2">
                        <p className="text-[13px] text-muted-foreground truncate">
                            {userEmail}
                        </p>
                        <button
                            className="text-muted-foreground hover:text-foreground p-1 rounded-r1 hover:bg-accent transition-colors shrink-0 ml-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Current Workspace (selected) */}
                    <div className="flex items-center gap-x-3 px-4 py-2 mx-1 rounded-r1 hover:bg-accent transition-colors cursor-default">
                        <Avatar className="h-5 w-5">
                            <AvatarImage src={userImage} />
                            <AvatarFallback className="text-[9px] font-bold bg-brand text-white">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-foreground flex-1 truncate">
                            {userName}&apos;s Mentis
                        </span>
                        <Check className="h-4 w-4 text-foreground shrink-0" />
                    </div>
                </div>

                <DropdownMenuSeparator className="mx-0" />

                {/* ── Footer Actions ── */}
                <div className="py-1">
                    <DropdownMenuItem
                        className="px-4 py-2.5 text-[13px] text-muted-foreground cursor-pointer rounded-none focus:bg-accent focus:text-foreground"
                    >
                        다른 계정 추가
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="px-4 py-2.5 text-[13px] text-muted-foreground cursor-pointer rounded-none focus:bg-accent focus:text-foreground"
                        onClick={() => signOut({ callbackUrl: "/" })}
                    >
                        모든 계정에서 로그아웃
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
