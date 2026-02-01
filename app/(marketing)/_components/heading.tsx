"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/spinner";
import Link from "next/link";

export const Heading = () => {
    const { status } = useSession();
    return (
        <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
                Your Ideas, Documents, & Plans. Unified. Welcome to <span className="underline">Mentis</span>
            </h1>
            <h3 className="text-base sm:text-xl md:text-2xl font-medium">
                Mentis is the connected workspace where <br /> better, faster work happens.
            </h3>
            {status === "loading" && (
                <div className="w-full flex items-center justify-center">
                    <Spinner size="lg" />
                </div>
            )}
            {status === "authenticated" && (
                <Button asChild>
                    <Link href="/documents">
                        Enter Mentis
                    <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                </Button>
            )}
            {status === "unauthenticated" && (
                <Button asChild>
                    <Link href="/login">
                        Get Mentis free
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                </Button>
            )}
        </div>
    )
}
