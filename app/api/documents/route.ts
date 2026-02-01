import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET /api/documents — search (non-archived docs for current user)
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const docs = await db
    .select()
    .from(documents)
    .where(and(eq(documents.userId, userId), eq(documents.isArchived, false)))
    .orderBy(desc(documents.createdAt));

  return NextResponse.json(docs);
}

// POST /api/documents — create
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { title, parentDocument } = body;

  const [doc] = await db
    .insert(documents)
    .values({
      title: title || "Untitled",
      userId,
      parentDocument: parentDocument || null,
      isArchived: false,
      isPublished: false,
    })
    .returning();

  return NextResponse.json(doc);
}
