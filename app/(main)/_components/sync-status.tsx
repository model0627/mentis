"use client";

import { Check, Loader2, WifiOff, RefreshCw } from "lucide-react";
import { useSyncStatus } from "@/hooks/use-sync-status";
import { useChatT } from "@/hooks/use-chat-t";

export const SyncStatus = () => {
  const status = useSyncStatus((s) => s.status);
  const t = useChatT();

  switch (status) {
    case "saved":
      return (
        <div className="flex items-center gap-x-1 text-xs text-muted-foreground">
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          <span>{t.syncSaved}</span>
        </div>
      );
    case "saving":
      return (
        <div className="flex items-center gap-x-1 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>{t.syncSaving}</span>
        </div>
      );
    case "offline":
      return (
        <div className="flex items-center gap-x-1 text-xs text-destructive">
          <WifiOff className="h-3.5 w-3.5" />
          <span>{t.syncOffline}</span>
        </div>
      );
    case "syncing":
      return (
        <div className="flex items-center gap-x-1 text-xs text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          <span>{t.syncSyncing}</span>
        </div>
      );
  }
};
