"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateChatRoom } from "@/hooks/use-chat";
import { useChatStore } from "@/hooks/use-chat-store";
import { useChatT } from "@/hooks/use-chat-t";

interface ChatPageButtonProps {
  documentId: string;
}

export const ChatPageButton = ({ documentId }: ChatPageButtonProps) => {
  const createRoom = useCreateChatRoom();
  const { openWidget, openRoom } = useChatStore();
  const t = useChatT();

  const handleClick = () => {
    createRoom.mutate(
      { type: "page", documentId },
      {
        onSuccess: (room) => {
          openWidget();
          openRoom(room.id, room.slug);
        },
      }
    );
  };

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      size="sm"
      disabled={createRoom.isPending}
      title={t.pageChatTooltip}
    >
      <MessageCircle className="h-4 w-4" />
    </Button>
  );
};
