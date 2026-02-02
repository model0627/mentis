"use client";

import { Spinner } from "@/components/spinner";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Navigation } from "./_components/navigation";
import { SearchCommand } from "./_components/search-command";
import { ChatWidget } from "@/components/chat/chat-widget";

const MainLayout = ({ children }: {
    children: React.ReactNode;
}) => {
    const { status } = useSession();

    if (status === "loading") {
        return (
            <div className="h-full flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        )
    }

    if (status !== "authenticated") {
        return redirect("/");
    }

    return (
        <div className="h-full flex bg-background">
            <Navigation />
            <main className="flex-1 h-full overflow-y-auto">
                <SearchCommand />
                {children}
            </main>
            <ChatWidget />
        </div>
    )
}

export default MainLayout;
