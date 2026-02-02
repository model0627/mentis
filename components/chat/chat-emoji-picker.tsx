"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile } from "lucide-react";

const COMMON_EMOJIS = [
  "👍", "👎", "😂", "❤️", "🔥", "👀", "🎉", "🤔",
  "👏", "😍", "💯", "🙌", "😊", "🚀", "✅", "⭐",
];

interface ChatEmojiPickerProps {
  onSelect: (emoji: string) => void;
  children?: React.ReactNode;
}

export const ChatEmojiPicker = ({ onSelect, children }: ChatEmojiPickerProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ?? (
          <button className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition">
            <Smile className="h-3.5 w-3.5" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-2"
        side="top"
        align="start"
      >
        <div className="grid grid-cols-8 gap-1">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSelect(emoji)}
              className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent transition text-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
