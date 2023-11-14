import { NextRequest, NextResponse } from "next/server";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";


export async function GET(request: Request) {
    // const archive = useMutation(api.documents.archive);

    return new Response("Hello, Cron")
}
