"use client";

import { useState } from "react";
import { ChatMessage } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatEmojiPicker } from "./chat-emoji-picker";
import { formatDistanceToNow } from "@/lib/chat-utils";
import { User, Pencil, Trash2, MessageSquare } from "lucide-react";

interface ChatMessageItemProps {
  message: ChatMessage;
  isOwn: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onOpenThread?: (messageId: string) => void;
  currentUserId?: string;
}

export const ChatMessageItem = ({
  message,
  isOwn,
  onEdit,
  onDelete,
  onReact,
  onRemoveReaction,
  onOpenThread,
  currentUserId,
}: ChatMessageItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content ?? "");

  if (message.isDeleted) {
    return (
      <div className="flex items-start gap-2 px-3 py-1.5 opacity-50">
        <div className="h-7 w-7 shrink-0" />
        <p className="text-xs italic text-muted-foreground">
          This message was deleted
        </p>
      </div>
    );
  }

  const handleEditSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== message.content) {
      onEdit?.(message.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(message.content ?? "");
    }
  };

  const grouped = groupReactions(message.reactions ?? []);

  return (
    <div className="group relative flex items-start gap-2 px-3 py-1.5 hover:bg-accent/30 transition">
      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
        {message.userImage && <AvatarImage src={message.userImage} />}
        <AvatarFallback className="text-[10px]">
          {message.userName?.[0]?.toUpperCase() ?? <User className="h-3 w-3" />}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold">
            {message.userName ?? "Unknown"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {message.createdAt && formatDistanceToNow(message.createdAt)}
          </span>
          {message.isEdited && (
            <span className="text-[10px] text-muted-foreground">(edited)</span>
          )}
        </div>

        {isEditing ? (
          <div className="mt-1">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleEditKeyDown}
              className="w-full resize-none rounded-md border bg-transparent px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
              rows={2}
              autoFocus
            />
            <div className="flex gap-1 mt-1">
              <button
                onClick={handleEditSave}
                className="text-xs text-primary hover:underline"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditValue(message.content ?? "");
                }}
                className="text-xs text-muted-foreground hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
          </>
        )}

        {message.attachmentUrl && (
          <a
            href={message.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-1 text-xs text-blue-500 hover:underline"
          >
            {message.attachmentName ?? "Attachment"}
          </a>
        )}

        {/* Reactions */}
        {grouped.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {grouped.map(({ emoji, count, userIds }) => {
              const hasReacted = currentUserId ? userIds.includes(currentUserId) : false;
              return (
                <button
                  key={emoji}
                  onClick={() => {
                    if (hasReacted) {
                      onRemoveReaction?.(message.id, emoji);
                    } else {
                      onReact?.(message.id, emoji);
                    }
                  }}
                  className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs transition ${
                    hasReacted
                      ? "border-primary/50 bg-primary/10"
                      : "hover:bg-accent/50"
                  }`}
                >
                  {emoji} <span className="text-muted-foreground">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Reply count */}
        {(message.replyCount ?? 0) > 0 && (
          <button
            onClick={() => onOpenThread?.(message.id)}
            className="mt-1 text-xs text-blue-500 hover:underline"
          >
            {message.replyCount} {message.replyCount === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      {/* Hover actions */}
      <div className="absolute right-2 top-1 hidden group-hover:flex items-center gap-0.5 rounded-md border bg-background shadow-sm p-0.5">
        <ChatEmojiPicker onSelect={(emoji) => onReact?.(message.id, emoji)} />
        {onOpenThread && !message.parentMessageId && (
          <button
            onClick={() => onOpenThread(message.id)}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition"
            title="Reply in thread"
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </button>
        )}
        {isOwn && (
          <>
            <button
              onClick={() => {
                setEditValue(message.content ?? "");
                setIsEditing(true);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete?.(message.id)}
              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-destructive/10 text-destructive transition"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

function groupReactions(reactions: NonNullable<ChatMessage["reactions"]>) {
  const map = new Map<string, { count: number; userIds: string[] }>();
  for (const r of reactions) {
    const existing = map.get(r.emoji);
    if (existing) {
      existing.count++;
      existing.userIds.push(r.userId);
    } else {
      map.set(r.emoji, { count: 1, userIds: [r.userId] });
    }
  }
  return Array.from(map.entries()).map(([emoji, { count, userIds }]) => ({
    emoji,
    count,
    userIds,
  }));
}
