import { NextResponse } from "next/server";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";


export async function GET() {
    const archive = useMutation(api.documents.archive);

    return NextResponse.json({ok : true});
}