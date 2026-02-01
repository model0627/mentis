import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

// GET /api/documents/sidebar?parentDocument=xxx&workspace=shared|private
export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const parentDocument = req.nextUrl.searchParams.get("parentDocument");
  const workspace = req.nextUrl.searchParams.get("workspace") || "private";

  const conditions = [
    eq(documents.isArchived, false),
  ];

  if (workspace === "shared") {
    conditions.push(eq(documents.workspace, "shared"));
  } else {
    conditions.push(eq(documents.workspace, "private"));
    conditions.push(eq(documents.userId, userId));
  }

  if (parentDocument) {
    conditions.push(eq(documents.parentDocument, parentDocument));
  } else {
    conditions.push(isNull(documents.parentDocument));
  }

  const docs = await db
    .select()
    .from(documents)
    .where(and(...conditions))
    .orderBy(desc(documents.createdAt));

  return NextResponse.json(docs);
}
