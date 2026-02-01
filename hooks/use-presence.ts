import { create } from "zustand";

export interface PresenceUser {
    clientId: number;
    name: string;
    color: string;
    userId?: string;
    lastSeen: number; // timestamp ms
}

/** Deduplicated user (by account name) for display */
export interface PresenceAccount {
    name: string;
    color: string;
    lastSeen: number;
}

type PresenceStore = {
    users: PresenceUser[];
    /** Users deduplicated by account name */
    accounts: PresenceAccount[];
    setUsers: (users: PresenceUser[]) => void;
    clear: () => void;
};

function deduplicateByAccount(users: PresenceUser[]): PresenceAccount[] {
    const map = new Map<string, PresenceAccount>();
    for (const u of users) {
        const key = u.name;
        const existing = map.get(key);
        if (!existing || u.lastSeen > existing.lastSeen) {
            map.set(key, {
                name: u.name,
                color: u.color,
                lastSeen: u.lastSeen,
            });
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
