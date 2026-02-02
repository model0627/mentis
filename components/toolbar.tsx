"use client";

import { Document } from "@/lib/types";
import { IconPicker } from "./icon-picker";
import { Button } from "./ui/button";
import { ImageIcon, Smile, X } from "lucide-react";
import { ElementRef, useCallback, useEffect, useRef, useState } from "react";
import { useUpdateDocument, useRemoveIcon } from "@/hooks/use-documents";
import { useQueryClient } from "@tanstack/react-query";
import TextareaAutosize from "react-textarea-autosize";
import { useCoverImage } from "@/hooks/use-cover-image";
import * as Y from "yjs";

interface ToolbarProps {
    initialData: Document;
    preview?: boolean;
    editable?: boolean;
    titleText?: Y.Text | null;
}

export const Toolbar = ({
    initialData,
    preview,
    editable = true,
    titleText,
}: ToolbarProps) => {
    const inputRef = useRef<ElementRef<"textarea">>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialData.title);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const updateMutation = useUpdateDocument();
    const removeIconMutation = useRemoveIcon();
    const queryClient = useQueryClient();

    const coverImage = useCoverImage();

    const canEdit = !preview && editable;

    // Optimistically update React Query cache so sidebar/navbar reflect title instantly
    const updateTitleInCache = useCallback((newTitle: string) => {
        queryClient.setQueryData(
            ["documents", initialData.id],
            (old: any) => old ? { ...old, title: newTitle } : old
        );
        queryClient.setQueriesData(
            { queryKey: ["documents", "sidebar"] },
            (old: any) => Array.isArray(old)
                ? old.map((doc: any) => doc.id === initialData.id ? { ...doc, title: newTitle } : doc)
                : old
        );
        queryClient.setQueriesData(
            { queryKey: ["documents", "search"] },
            (old: any) => Array.isArray(old)
                ? old.map((doc: any) => doc.id === initialData.id ? { ...doc, title: newTitle } : doc)
                : old
        );
    }, [queryClient, initialData.id]);

    // Initialize YJS title text with DB value on first sync
    useEffect(() => {
        if (!titleText) return;

        const initTitle = () => {
            // Only set initial value if YJS text is empty (first client to connect)
            if (titleText.length === 0 && initialData.title) {
                titleText.insert(0, initialData.title);
            } else if (titleText.length > 0) {
                setValue(titleText.toString());
            }
        };

        // Wait for sync before initializing
        initTitle();
    }, [titleText, initialData.title]);

    // Observe YJS title changes from other clients
    useEffect(() => {
        if (!titleText) return;

        const observer = () => {
            const newVal = titleText.toString();
            setValue(newVal);
            updateTitleInCache(newVal || "Untitled");

            // Debounce save to API
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => {
                updateMutation.mutate({
                    id: initialData.id,
                    title: newVal || "Untitled",
                });
            }, 2000);
        };

        titleText.observe(observer);
        return () => {
            titleText.unobserve(observer);
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, [titleText, initialData.id]);

    const enableInput = () => {
        if (!canEdit) return;

        setIsEditing(true);
        setTimeout(() => {
            if (titleText) {
                setValue(titleText.toString());
            } else {
                setValue(initialData.title);
            }
            inputRef.current?.focus();
        }, 0);
    };

    const disableInput = () => setIsEditing(false);

    const onInput = (newValue: string) => {
        setValue(newValue);
        updateTitleInCache(newValue || "Untitled");

        if (titleText) {
            // Update via YJS for real-time sync
            titleText.delete(0, titleText.length);
            titleText.insert(0, newValue);
        } else {
            // Fallback: direct API update
            updateMutation.mutate({
                id: initialData.id,
                title: newValue || "Untitled",
            });
        }
    };

    const onKeyDown = (
        event: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (event.key === "Enter") {
            event.preventDefault();
            disableInput();
        }
    };

    const onIconSelect = (icon: string) => {
        updateMutation.mutate({
            id: initialData.id,
            icon,
        });
    };
    const onRemoveIcon = () => {
        removeIconMutation.mutate(initialData.id);
    };

    return (
        <div className="pl-[54px] group relative">
            {!!initialData.icon && canEdit && (
                <div className="flex items-center gap-x-2 group/icon pt-6">
                    <IconPicker onChange={onIconSelect}>
                        <p className="text-6xl hover:opacity-75 transition">
                            {initialData.icon}
                        </p>
                    </IconPicker>
                    <Button
                        onClick={onRemoveIcon}
                        className="rounded-full opacity-0 group-hover/icon:opacity-100 transition text-muted-foreground text-xs"
                        variant="outline"
                        size="icon"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            {!!initialData.icon && !canEdit && (
                <p className="text-6xl pt-6">
                    {initialData.icon}
                </p>
            )}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-1 py-4">
                {!initialData.icon && canEdit && (
                    <IconPicker asChild onChange={onIconSelect}>
                        <Button
                            className="text-muted-foreground text-xs"
                            variant="outline"
                            size="sm"
                        >
                            <Smile className="h-4 w-4" />
                            Add icon
                        </Button>
                    </IconPicker>
                )}
                {!initialData.coverImage && canEdit && (
                    <Button
                        onClick={coverImage.onOpen}
                        className="text-muted-foreground text-xs"
                        variant="outline"
                        size="sm"
                    >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Add cover
                    </Button>
                )}
            </div>
            {isEditing && canEdit ? (
                <TextareaAutosize
                    ref={inputRef}
                    onBlur={disableInput}
                    onKeyDown={onKeyDown}
                    value={value}
                    onChange={(e) => onInput(e.target.value)}
                    className="text-5xl bg-transparent font-bold break-words outline-none text-foreground resize-none"
                />
            ): (
                <div
                    onClick={enableInput}
                    className="pb-[11.5px] text-5xl font-bold break-words outline-none text-foreground"
                >
                    {value}
                </div>
            )}
        </div>
    );
};
