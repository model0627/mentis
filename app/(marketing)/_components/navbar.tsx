"use client";

import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { ModeToggle } from "@/components/mode-toggle";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import Link from "next/link";

export const Navbar =() => {
    const { status } = useSession();
    const scrolled = useScrollTop();

    return (
        <div className={cn("z-50 bg-background fixed top-0 flex items-center w-full p-6", scrolled && "border-b shadow-sm")}>
            <Logo />
            <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
                {status === "loading" && (
                    <Spinner />
                )}
                {status === "unauthenticated" && (
                    <>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/login">
                                Login
                            </Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/register">
                                Get Mentis free
                            </Link>
                        </Button>
                    </>
                )}
                {status === "authenticated" && (
                    <>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/documents">
                                Enter Mentis
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => signOut({ callbackUrl: "/" })}
                        >
                            Log out
                        </Button>
                    </>
                )}
                <ModeToggle />
            </div>
        </div>
    );
}
