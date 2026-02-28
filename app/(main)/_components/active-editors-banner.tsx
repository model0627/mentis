"use client";

import { usePresence } from "@/hooks/use-presence";
import { useChatT } from "@/hooks/use-chat-t";
import { Users } from "lucide-react";

export const ActiveEditorsBanner = () => {
    const accounts = usePresence((s) => s.accounts);
    const t = useChatT();

    const onlineAccounts = accounts.filter((a) => a.status === "online");

    if (onlineAccounts.length === 0) return null;

    return (
        <div className="flex items-center gap-x-2 px-4 py-1.5 bg-emerald-500/10 border-b border-emerald-500/20 text-sm">
            <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="flex items-center gap-x-1.5 overflow-hidden">
                <div className="flex items-center -space-x-1.5">
                    {onlineAccounts.slice(0, 3).map((account) => (
                        <div
                            key={account.name}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-semibold ring-1 ring-emerald-500/20"
                            style={{ backgroundColor: account.color }}
                        >
                            {account.name.charAt(0).toUpperCase()}
                        </div>
                    ))}
                </div>
                <span className="text-xs text-emerald-700 dark:text-emerald-300 truncate">
                    {onlineAccounts.length <= 2
                        ? onlineAccounts.map((a) => a.name).join(", ")
                        : `${onlineAccounts[0].name}, ${onlineAccounts[1].name} +${onlineAccounts.length - 2}`}
                    {" · "}
                    {t.editingNow}
                </span>
            </div>
        </div>
    );
};
