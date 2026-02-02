"use client";

import { useEffect, useState } from "react";
import { File, FolderInput } from "lucide-react";
import { toast } from "sonner";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useMoveModal } from "@/hooks/use-move-modal";
import { useSearchDocs, useUpdateDocument } from "@/hooks/use-documents";

export const MoveModal = () => {
  const { isOpen, onClose, documentId } = useMoveModal();
  const { data: documents } = useSearchDocs();
  const updateMutation = useUpdateDocument();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const filteredDocs = documents?.filter((doc) => doc.id !== documentId && !doc.isArchived);

  const onSelect = (targetId: string) => {
    if (!documentId) return;

    const promise = updateMutation.mutateAsync({
      id: documentId,
      parentDocument: targetId,
    });

    toast.promise(promise, {
      loading: "Moving page...",
      success: "Page moved!",
      error: "Failed to move page.",
    });

    onClose();
  };

  const onMoveToRoot = () => {
    if (!documentId) return;

    const promise = updateMutation.mutateAsync({
      id: documentId,
      parentDocument: null,
    });

    toast.promise(promise, {
      loading: "Moving page...",
      success: "Page moved to root!",
      error: "Failed to move page.",
    });

    onClose();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder="Move to..." />
      <CommandList>
        <CommandEmpty>No pages found.</CommandEmpty>
        <CommandGroup heading="Move to">
          <CommandItem onSelect={onMoveToRoot}>
            <FolderInput className="mr-2 h-4 w-4" />
            <span>Root (no parent)</span>
          </CommandItem>
          {filteredDocs?.map((doc) => (
            <CommandItem
              key={doc.id}
              value={`${doc.id}-${doc.title}`}
              title={doc.title}
              onSelect={() => onSelect(doc.id)}
            >
              {doc.icon ? (
                <p className="mr-2 text-[18px]">{doc.icon}</p>
              ) : (
                <File className="mr-2 h-4 w-4" />
              )}
              <span>{doc.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
