"use client";

import { useChatRooms } from "@/hooks/use-chat";
import { useChatStore } from "@/hooks/use-chat-store";
import { useChatT } from "@/hooks/use-chat-t";
import { ChatRoom } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, User, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "@/lib/chat-utils";
import type { ChatTranslations } from "@/lib/chat-i18n";
import type { ChatLocale } from "@/lib/chat-i18n";

interface ChatRoomListProps {
  onNewDm?: () => void;
}

export const ChatRoomList = ({ onNewDm }: ChatRoomListProps = {}) => {
  const { data: rooms, isLoading } = useChatRooms();
  const { openRoom, locale } = useChatStore();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const t = useChatT();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
        {t.loading}
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-4 text-center">
        {t.noConversations}
        <br />
        {t.noConversationsHint}
      </div>
    );
  }

  const pageRooms = rooms.filter((r) => r.type === "page");
  const dmRooms = rooms.filter((r) => r.type === "dm");

  return (
    <div className="flex-1 overflow-y-auto">
      {onNewDm && (
        <div className="px-3 py-2 border-b">
          <button
            onClick={onNewDm}
            className="flex w-full items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition"
          >
            <Plus className="h-4 w-4" />
            {t.newMessage}
          </button>
        </div>
      )}
      {pageRooms.length > 0 && (
        <div>
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
            {t.pages}
          </div>
          {pageRooms.map((room) => (
            <RoomItem key={room.id} room={room} currentUserId={currentUserId} onClick={() => openRoom(room.id, room.slug)} t={t} locale={locale} />
          ))}
        </div>
      )}
      {dmRooms.length > 0 && (
        <div>
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
            {t.directMessages}
          </div>
          {dmRooms.map((room) => (
            <RoomItem key={room.id} room={room} currentUserId={currentUserId} onClick={() => openRoom(room.id, room.slug)} t={t} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
};

function RoomItem({
  room,
  currentUserId,
  onClick,
  t,
  locale,
}: {
  room: ChatRoom;
  currentUserId?: string;
  onClick: () => void;
  t: ChatTranslations;
  locale: ChatLocale;
}) {
  const otherMember = room.type === "dm"
    ? room.members?.find((m) => m.userId !== currentUserId)
    : null;

  const title =
    room.type === "page"
      ? `${room.documentIcon ?? ""} ${room.documentTitle ?? t.untitled}`.trim()
      : otherMember?.userName ?? otherMember?.userEmail ?? t.directMessage;

  const lastMsg = room.lastMessage;
  const preview = lastMsg?.isDeleted
    ? t.deletedMessage
    : lastMsg?.content
      ? lastMsg.content.length > 50
        ? lastMsg.content.slice(0, 50) + "..."
        : lastMsg.content
      : lastMsg?.attachmentName ?? "";

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent/50 transition text-left"
    >
      <div className="shrink-0">
        {room.type === "page" ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
            {room.documentIcon ? (
              <span className="text-sm">{room.documentIcon}</span>
            ) : (
              <FileText className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ) : (
          <Avatar className="h-8 w-8">
            {otherMember?.userImage && (
              <AvatarImage src={otherMember.userImage} />
            )}
            <AvatarFallback className="text-xs">
              {otherMember?.userName?.[0]?.toUpperCase() ?? <User className="h-3 w-3" />}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium truncate">{title}</span>
          {lastMsg?.createdAt && (
            <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
              {formatDistanceToNow(lastMsg.createdAt, locale)}
            </span>
          )}
        </div>
        {preview && (
          <p className="text-xs text-muted-foreground truncate">{preview}</p>
        )}
      </div>
      {(room.unreadCount ?? 0) > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shrink-0">
          {room.unreadCount}
        </span>
      )}
    </button>
  );
}
