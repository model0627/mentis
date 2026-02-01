import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/documents/public/:id — no auth required
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id));

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!doc.isPublished || doc.isArchived) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  return NextResponse.json(doc);
}
