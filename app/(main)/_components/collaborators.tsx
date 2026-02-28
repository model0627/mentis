"use client";

import { usePresence, type PresenceStatus } from "@/hooks/use-presence";
import { useChatT } from "@/hooks/use-chat-t";
import type { ChatTranslations } from "@/lib/chat-i18n";
import { useState } from "react";
import { Eye, Users } from "lucide-react";

function formatTimeAgo(timestamp: number, t: ChatTranslations): string {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return t.timeJustNow;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t.timeMinutesAgo(minutes);

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t.timeHoursAgo(hours);

    const days = Math.floor(hours / 24);
    return t.timeDaysAgo(days);
}

function statusColor(status: PresenceStatus): string {
    switch (status) {
        case "online": return "bg-emerald-500";
        case "away": return "bg-amber-400";
        case "offline": return "bg-gray-400";
    }
}

function statusLabel(status: PresenceStatus, t: ChatTranslations): string {
    switch (status) {
        case "online": return t.statusOnline;
        case "away": return t.statusAway;
        case "offline": return t.statusOffline;
    }
}

export const Collaborators = () => {
    const accounts = usePresence((s) => s.accounts);
    const t = useChatT();
    const [showPanel, setShowPanel] = useState(false);

    if (accounts.length === 0) return null;

    const onlineCount = accounts.filter((a) => a.status === "online").length;

    return (
        <div className="relative flex items-center gap-x-2">
            {/* Active editors count badge */}
            {onlineCount > 0 && (
                <div className="flex items-center gap-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span>{t.activeEditors(onlineCount)}</span>
                </div>
            )}

            {/* Avatar stack */}
            <div className="flex items-center -space-x-2">
                {accounts.slice(0, 5).map((account) => (
                    <div
                        key={account.name}
                        className="relative group"
                    >
                        {/* Avatar */}
                        <div className="relative">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ring-2 ring-background cursor-default transition-transform hover:scale-110 hover:z-10 ${
                                    account.status === "online" ? "shadow-md" : "opacity-80"
                                }`}
                                style={{ backgroundColor: account.color }}
                            >
                                {account.name.charAt(0).toUpperCase()}
                            </div>
                            {/* Status dot */}
                            <span
                                className={`absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full ring-2 ring-background ${statusColor(account.status)}`}
                            />
                        </div>

                        {/* Rich tooltip card */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 bg-popover text-popover-foreground rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 overflow-hidden">
                            {/* Color accent bar */}
                            <div className="h-1.5" style={{ backgroundColor: account.color }} />
                            <div className="p-3">
                                <div className="flex items-center gap-x-2">
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                                        style={{ backgroundColor: account.color }}
                                    >
                                        {account.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm truncate">{account.name}</p>
                                        <div className="flex items-center gap-x-1.5 mt-0.5">
                                            <span className={`block h-2 w-2 rounded-full ${statusColor(account.status)}`} />
                                            <span className="text-xs text-muted-foreground">
                                                {statusLabel(account.status, t)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{formatTimeAgo(account.lastSeen, t)}</span>
                                    {account.status === "online" && (
                                        <span className="flex items-center gap-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                            <Eye className="h-3 w-3" />
                                            {t.editingNow}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {accounts.length > 5 && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground text-xs font-semibold ring-2 ring-background">
                        +{accounts.length - 5}
                    </div>
                )}
            </div>

            {/* Expand panel button */}
            {accounts.length > 1 && (
                <button
                    onClick={() => setShowPanel((prev) => !prev)}
                    className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-accent text-muted-foreground transition-colors"
                    title={t.viewAllCollaborators}
                >
                    <Users className="h-4 w-4" />
                </button>
            )}

            {/* Expanded collaborator panel */}
            {showPanel && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowPanel(false)}
                    />
                    <div className="absolute top-full right-0 mt-2 w-64 bg-popover text-popover-foreground rounded-lg shadow-lg border z-50 overflow-hidden">
                        <div className="px-3 py-2 border-b flex items-center justify-between">
                            <span className="text-sm font-semibold">{t.viewAllCollaborators}</span>
                            <span className="text-xs text-muted-foreground">
                                {t.activeEditors(onlineCount)}
                            </span>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {accounts.map((account) => (
                                <div
                                    key={account.name}
                                    className="flex items-center gap-x-3 px-3 py-2 hover:bg-accent/50 transition-colors"
                                >
                                    <div className="relative shrink-0">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                            style={{ backgroundColor: account.color }}
                                        >
                                            {account.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span
                                            className={`absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full ring-2 ring-popover ${statusColor(account.status)}`}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate">{account.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {statusLabel(account.status, t)} · {formatTimeAgo(account.lastSeen, t)}
                                        </p>
                                    </div>
                                    {account.status === "online" && (
                                        <span className="flex items-center gap-x-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                                            <Eye className="h-3 w-3" />
                                            {t.editingNow}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
