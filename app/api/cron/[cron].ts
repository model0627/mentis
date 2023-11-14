import { NextRequest, NextResponse } from "next/server";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";


export default async function handler(req: NextRequest) {
    // const archive = useMutation(api.documents.archive);
    const cron = req.nextUrl.pathname.split("/")[3];
    console.log(cron);

    return NextResponse.json({ok : true});
}
