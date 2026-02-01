"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useCreateDocument } from "@/hooks/use-documents";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const DocumentsPage = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const createMutation = useCreateDocument();
    const onCreate = () => {
        const promise = createMutation.mutateAsync({ title: "Untitled" })
            .then((doc) => router.push(`/documents/${doc.id}`));

        toast.promise(promise, {
            loading: "Creating a new note...",
            success: "New note created!",
            error: "Failed to create a new note."
        });
    }
    return (
        <div className="h-full flex flex-col items-center justify-center space-y-4">
            <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="150" cy="150" r="120" className="fill-primary/5" />
                <rect x="80" y="70" width="140" height="170" rx="12" className="fill-background stroke-border" strokeWidth="2" />
                <rect x="104" y="100" width="72" height="8" rx="4" className="fill-primary" />
                <rect x="104" y="120" width="92" height="6" rx="3" className="fill-muted-foreground/20" />
                <rect x="104" y="136" width="80" height="6" rx="3" className="fill-muted-foreground/20" />
                <rect x="104" y="152" width="92" height="6" rx="3" className="fill-muted-foreground/20" />
                <rect x="104" y="176" width="60" height="8" rx="4" className="fill-primary/40" />
                <rect x="104" y="196" width="92" height="6" rx="3" className="fill-muted-foreground/20" />
                <circle cx="190" cy="90" r="20" className="fill-primary" />
                <path d="M182 90L188 96L200 84" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        <h2 className="text-lg font-medium">
            Welcome to {session?.user?.name?.split(" ")[0]}&apos;s Mentis
        </h2>
        <Button onClick={onCreate}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create a note
        </Button>
        </div>
    )
}

export default DocumentsPage;
