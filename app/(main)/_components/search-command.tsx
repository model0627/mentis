"use client";

import { useEffect, useState } from "react";
import { Command, File } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import { useSearch } from "@/hooks/use-search";
import { useSearchDocs } from "@/hooks/use-documents";

export const SearchCommand = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const { data: documents } = useSearchDocs();
    const [isMounted, setIsMounted] = useState(false);

    const toggle = useSearch((store) => store.toggle);
    const isOpen = useSearch((store) => store.isOpen);
    const onClose = useSearch((store) => store.onClose);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const down  = (e: KeyboardEvent) => {
            if (e.key == "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                toggle();
            }
        }
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [toggle]);

    const onSelect = (id: string) => {
        router.push(`/documents/${id}`);
        onClose();
    }
    
    if (!isMounted) return null;

    return (
        <CommandDialog open={isOpen} onOpenChange={onClose}>
            <CommandInput
                placeholder={`Search ${session?.user?.name}'s Mentis...`}
            />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup title="Documents">
                    {documents?.map((document) => (
                        <CommandItem
                            key={document.id}
                            value={`${document.id}-${document.title}`}
                            title={document.title}
                            onSelect={onSelect}
                        >
                            {document.icon ?(
                                <p className="mr-2 text-[18px]">
                                    {document.icon}
                                </p>
                            ) :(
                                <File className="mr-2 h-4 w-4" />
                            )}
                            <span>
                                {document.title}
                            </span>
                        </CommandItem>    
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}