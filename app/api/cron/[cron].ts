import { NextRequest, NextResponse } from "next/server";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";


export async function GET() {
    // const archive = useMutation(api.documents.archive);
    const cron = "Hello Cron"
    console.log(cron);

    return NextResponse.json({ok : true});
}
