import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET /api/documents/trash
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const docs = await db
    .select()
    .from(documents)
    .where(and(eq(documents.userId, userId), eq(documents.isArchived, true)))
    .orderBy(desc(documents.createdAt));

  return NextResponse.json(docs);
}
