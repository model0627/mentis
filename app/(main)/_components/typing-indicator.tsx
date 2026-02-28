"use client";

import { usePresence } from "@/hooks/use-presence";
import { useChatT } from "@/hooks/use-chat-t";

export const TypingIndicator = () => {
    const accounts = usePresence((s) => s.accounts);
    const t = useChatT();

    const typingAccounts = accounts.filter(
        (a) => a.isTyping && a.status === "online"
    );

    if (typingAccounts.length === 0) return null;

    const names =
        typingAccounts.length <= 2
            ? typingAccounts.map((a) => a.name).join(", ")
            : `${typingAccounts[0].name}, ${typingAccounts[1].name} +${typingAccounts.length - 2}`;

    return (
        <div className="flex items-center gap-x-2 px-4 py-1 border-b border-muted text-xs text-muted-foreground">
            <span className="flex items-center gap-x-0.5">
                <span className="typing-dot" style={{ animationDelay: "0ms" }}>●</span>
                <span className="typing-dot" style={{ animationDelay: "150ms" }}>●</span>
                <span className="typing-dot" style={{ animationDelay: "300ms" }}>●</span>
            </span>
            <span>{t.typingIndicator(names)}</span>
        </div>
    );
};
