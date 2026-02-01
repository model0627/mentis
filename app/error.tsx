"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

const Error = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center space-y-4">
            <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="150" cy="150" r="120" className="fill-destructive/5" />
                <circle cx="150" cy="130" r="60" className="fill-background stroke-border" strokeWidth="2" />
                <circle cx="132" cy="120" r="5" className="fill-muted-foreground" />
                <circle cx="168" cy="120" r="5" className="fill-muted-foreground" />
                <path d="M130 148C130 148 138 140 150 140C162 140 170 148 170 148" className="stroke-muted-foreground" strokeWidth="3" strokeLinecap="round" fill="none" />
                <circle cx="150" cy="130" r="60" className="stroke-destructive/30" strokeWidth="2" fill="none" />
                <path d="M150 200V220" className="stroke-destructive" strokeWidth="8" strokeLinecap="round" />
                <circle cx="150" cy="240" r="5" className="fill-destructive" />
            </svg>
            <h2 className="text-xl font-medium">
                Something went wrong.
            </h2>
            <Button asChild>
                <Link href="/documents">
                    Go back
                </Link>
            </Button>
        </div>
    )
}

export default Error;
