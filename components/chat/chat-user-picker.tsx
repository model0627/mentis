"use client";

import { useState } from "react";
import { useSearchUsers, useUsers } from "@/hooks/use-documents";
import { useCreateChatRoom } from "@/hooks/use-chat";
import { useChatStore } from "@/hooks/use-chat-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Search, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useChatT } from "@/hooks/use-chat-t";

interface ChatUserPickerProps {
  onBack: () => void;
}

export const ChatUserPicker = ({ onBack }: ChatUserPickerProps) => {
  const [query, setQuery] = useState("");
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(query);
  const { data: allUsers, isLoading: isLoadingAll } = useUsers();
  const createRoom = useCreateChatRoom();
  const { openRoom } = useChatStore();
  const t = useChatT();

  // Show search results when typing, otherwise show all users
  const isSearchMode = query.length >= 2;
  const users = isSearchMode
    ? searchResults
    : allUsers?.filter((u) => u.id !== currentUserId);
  const isLoading = isSearchMode ? isSearching : isLoadingAll;

  const handleSelect = (targetUserId: string) => {
    createRoom.mutate(
      { type: "dm", targetUserId },
      {
        onSuccess: (room) => {
          onBack();
          openRoom(room.id, room.slug);
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 border-b px-3 py-2 shrink-0">
        <button
          onClick={onBack}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold">{t.newMessage}</span>
      </div>

      <div className="px-3 py-2 border-b">
        <div className="flex items-center gap-2 rounded-md border px-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            {t.searching}
          </div>
        ) : !users || users.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            {t.noUsersFound}
          </div>
        ) : (
          users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelect(user.id)}
              disabled={createRoom.isPending}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent/50 transition text-left disabled:opacity-50"
            >
              <Avatar className="h-8 w-8">
                {user.image && <AvatarImage src={user.image} />}
                <AvatarFallback className="text-xs">
                  {user.name?.[0]?.toUpperCase() ?? <User className="h-3 w-3" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.name ?? t.unknownUser}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
