import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents, documentPermissions } from "@/lib/db/schema";
import { eq, and, desc, or } from "drizzle-orm";

// GET /api/documents — search (non-archived docs for current user + shared)
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const docs = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.isArchived, false),
        or(
          eq(documents.userId, userId),
          eq(documents.workspace, "shared")
        )
      )
    )
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
  const { title, parentDocument, workspace } = body;

  const ws = workspace === "shared" ? "shared" : "private";

  const [doc] = await db
    .insert(documents)
    .values({
      title: title || "Untitled",
      userId,
      parentDocument: parentDocument || null,
      isArchived: false,
      isPublished: false,
      workspace: ws,
    })
    .returning();

  // If shared, auto-assign admin permission to creator
  if (ws === "shared") {
    await db.insert(documentPermissions).values({
      documentId: doc.id,
      userId,
      role: "admin",
    });
  }

  return NextResponse.json(doc);
}
