"use client";

import { useActivityLog, type ActivityEntry } from "@/hooks/use-activity-log";
import { useChatT } from "@/hooks/use-chat-t";
import type { ChatTranslations } from "@/lib/chat-i18n";
import { Activity, X } from "lucide-react";
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

type TimeGroup = "today" | "yesterday" | "earlier";

function getTimeGroup(timestamp: number): TimeGroup {
  const now = new Date();
  const date = new Date(timestamp);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86_400_000;

  if (timestamp >= todayStart) return "today";
  if (timestamp >= yesterdayStart) return "yesterday";
  return "earlier";
}

function groupLabel(group: TimeGroup, t: ChatTranslations): string {
  switch (group) {
    case "today":
      return t.activityToday;
    case "yesterday":
      return t.activityYesterday;
    case "earlier":
      return t.activityEarlier;
  }
}

function actionText(action: ActivityEntry["action"], t: ChatTranslations): string {
  switch (action) {
    case "joined":
      return t.activityJoined;
    case "left":
      return t.activityLeft;
    case "started_editing":
      return t.activityStartedEditing;
    case "stopped_editing":
      return t.activityStoppedEditing;
    case "permission_changed":
      return t.activityJoined; // fallback
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface ActivityLogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityLog = ({ isOpen, onClose }: ActivityLogProps) => {
  const entries = useActivityLog((s) => s.entries);
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

  // Group entries by time
  const grouped = entries.reduce<Record<TimeGroup, ActivityEntry[]>>(
    (acc, entry) => {
      const group = getTimeGroup(entry.timestamp);
      acc[group].push(entry);
      return acc;
    },
    { today: [], yesterday: [], earlier: [] },
  );

  const groupOrder: TimeGroup[] = ["today", "yesterday", "earlier"];

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
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">{t.activityLog}</h2>
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
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Activity className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">{t.noActivity}</p>
            </div>
          ) : (
            <div className="py-2">
              {groupOrder.map((group) => {
                const items = grouped[group];
                if (items.length === 0) return null;
                return (
                  <div key={group}>
                    <div className="px-4 py-1.5">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {groupLabel(group, t)}
                      </span>
                    </div>
                    {items.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-x-3 px-4 py-2 hover:bg-accent/50 transition-colors"
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
                          <p className="text-sm leading-snug">
                            <span className="font-semibold">{entry.userName}</span>{" "}
                            <span className="text-muted-foreground">
                              {actionText(entry.action, t)}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatRelativeTime(entry.timestamp, t)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
