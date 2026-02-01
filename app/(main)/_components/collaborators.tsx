"use client";

import { usePresence } from "@/hooks/use-presence";

function formatTimeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return "방금 전";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;

    const days = Math.floor(hours / 24);
    return `${days}일 전`;
}

export const Collaborators = () => {
    const accounts = usePresence((s) => s.accounts);

    if (accounts.length === 0) return null;

    return (
        <div className="flex items-center -space-x-2">
            {accounts.slice(0, 5).map((account) => (
                <div
                    key={account.name}
                    className="relative group"
                >
                    <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium ring-2 ring-background cursor-default"
                        style={{ backgroundColor: account.color }}
                    >
                        {account.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-r2 shadow-s2 border whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                        <p className="font-medium">{account.name}</p>
                        <p className="text-muted-foreground mt-0.5">
                            {formatTimeAgo(account.lastSeen)}
                        </p>
                    </div>
                </div>
            ))}
            {accounts.length > 5 && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-muted text-muted-foreground text-xs font-medium ring-2 ring-background">
                    +{accounts.length - 5}
                </div>
            )}
        </div>
    );
};
