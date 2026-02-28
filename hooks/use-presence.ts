import { create } from "zustand";

export interface PresenceUser {
    clientId: number;
    name: string;
    color: string;
    userId?: string;
    lastSeen: number; // timestamp ms
    isTyping?: boolean;
}

export type PresenceStatus = "online" | "away" | "offline";

/** Deduplicated user (by account name) for display */
export interface PresenceAccount {
    clientId: number;
    name: string;
    color: string;
    lastSeen: number;
    status: PresenceStatus;
    isTyping?: boolean;
}

type PresenceStore = {
    users: PresenceUser[];
    /** Users deduplicated by account name */
    accounts: PresenceAccount[];
    setUsers: (users: PresenceUser[]) => void;
    clear: () => void;
};

function getStatus(lastSeen: number): PresenceStatus {
    const elapsed = Date.now() - lastSeen;
    if (elapsed < 2 * 60 * 1000) return "online";   // < 2 min
    if (elapsed < 10 * 60 * 1000) return "away";     // < 10 min
    return "offline";
}

function deduplicateByAccount(users: PresenceUser[]): PresenceAccount[] {
    const map = new Map<string, PresenceAccount>();
    for (const u of users) {
        const key = u.name;
        const existing = map.get(key);
        if (!existing || u.lastSeen > existing.lastSeen) {
            map.set(key, {
                clientId: u.clientId,
                name: u.name,
                color: u.color,
                lastSeen: u.lastSeen,
                status: getStatus(u.lastSeen),
                isTyping: existing?.isTyping || u.isTyping || false,
            });
        } else if (u.isTyping) {
            existing.isTyping = true;
        }
    }
    return Array.from(map.values());
}

export const usePresence = create<PresenceStore>((set) => ({
    users: [],
    accounts: [],
    setUsers: (users) =>
        set({
            users,
            accounts: deduplicateByAccount(users),
        }),
    clear: () => set({ users: [], accounts: [] }),
}));
