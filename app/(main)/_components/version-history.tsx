"use client";

import { useVersionHistory, type VersionEntry } from "@/hooks/use-version-history";
import { useChatT } from "@/hooks/use-chat-t";
import type { ChatTranslations } from "@/lib/chat-i18n";
import { Clock, X } from "lucide-react";
import { useEffect, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatRelativeTime(timestamp: number, t: ChatTranslations): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return t.timeJustNow;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t.timeMinutesAgo(minutes);

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t.timeHoursAgo(hours);

  const days = Math.floor(hours / 24);
  return t.timeDaysAgo(days);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface VersionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (content: string) => void;
}

export const VersionHistory = ({ isOpen, onClose, onRestore }: VersionHistoryProps) => {
  const versions = useVersionHistory((s) => s.versions);
  const t = useChatT();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 z-50 h-full w-80 bg-popover border-l shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">{t.versionHistory}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-accent text-muted-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Clock className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">{t.noVersions}</p>
            </div>
          ) : (
            <div className="py-2">
              {versions.map((entry: VersionEntry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-x-3 px-4 py-2.5 hover:bg-accent/50 transition-colors"
                >
                  {/* Avatar */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-0.5"
                    style={{ backgroundColor: entry.userColor }}
                  >
                    {entry.userName.charAt(0).toUpperCase()}
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold leading-snug truncate">
                        {entry.userName}
                      </p>
                      <button
                        onClick={() => onRestore(entry.contentSnapshot)}
                        className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium shrink-0 ml-2 transition-colors"
                      >
                        {t.restore}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.versionSaved} &middot; {formatRelativeTime(entry.timestamp, t)}
                    </p>
                    {entry.contentPreview && (
                      <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2 leading-relaxed">
                        {entry.contentPreview}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
