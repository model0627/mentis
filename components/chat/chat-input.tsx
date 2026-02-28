"use client";

import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { useChatT } from "@/hooks/use-chat-t";

interface ChatInputProps {
  onSend: (content: string) => void;
  onSendAttachment?: (url: string, name: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatInput = ({
  onSend,
  onSendAttachment,
  onTypingChange,
  placeholder,
  disabled,
}: ChatInputProps) => {
  const t = useChatT();
  const resolvedPlaceholder = placeholder ?? t.inputPlaceholder;
  const [value, setValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const stopTyping = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingChange?.(false);
    }
  }, [onTypingChange]);

  const handleTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingChange?.(true);
    }
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    typingTimerRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [onTypingChange, stopTyping]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    const trimmed = value.trim();
    stopTyping();
    if (pendingFile) {
      onSendAttachment?.(pendingFile.url, pendingFile.name);
      setPendingFile(null);
      setValue("");
      return;
    }
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setPendingFile({ url, name: file.name });
    } catch {
      // Upload failed silently
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isDisabled = disabled || uploading;

  return (
    <div className="border-t bg-background">
      {pendingFile && (
        <div className="flex items-center gap-2 px-3 pt-2">
          <div className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-1 text-xs">
            <Paperclip className="h-3 w-3 text-muted-foreground" />
            <span className="truncate max-w-[200px]">{pendingFile.name}</span>
            <button
              onClick={() => setPendingFile(null)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-end gap-2 p-3">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isDisabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border hover:bg-accent transition disabled:opacity-50"
          title={t.attachFile}
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); handleTyping(); }}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={pendingFile ? t.pressEnterToSendFile : resolvedPlaceholder}
          disabled={isDisabled}
          rows={1}
          className="flex-1 resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={isDisabled || (!value.trim() && !pendingFile)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50 hover:opacity-90 transition"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
