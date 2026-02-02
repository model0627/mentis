"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader
} from "@/components/ui/dialog";
import { useSettings } from "@/hooks/use-settings";
import { useChatStore } from "@/hooks/use-chat-store";
import { useChatT } from "@/hooks/use-chat-t";
import { Label }  from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggle";
import type { ChatLocale } from "@/lib/chat-i18n";

export const SettingsModal = () => {
    const settings = useSettings();
    const { locale, setLocale } = useChatStore();
    const t = useChatT();

    return (
        <Dialog open={settings.isOpen} onOpenChange={settings.onClose}>
            <DialogContent>
                <DialogHeader className="border-b pb-3">
                    <h2 className="text-lg font-medium">
                        {t.mySettings}
                    </h2>
                </DialogHeader>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-y-1">
                        <Label>
                            {t.appearance}
                        </Label>
                        <span className="text-[0.8rem] text-muted-foreground">
                            {t.appearanceDesc}
                        </span>
                    </div>
                    <ModeToggle />
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-y-1">
                        <Label>
                            {t.language}
                        </Label>
                        <span className="text-[0.8rem] text-muted-foreground">
                            {t.languageDesc}
                        </span>
                    </div>
                    <select
                        value={locale}
                        onChange={(e) => setLocale(e.target.value as ChatLocale)}
                        className="rounded-md border bg-transparent px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                    >
                        <option value="ko">한국어</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </DialogContent>
        </Dialog>
    );
};