import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

async function recursiveArchive(userId: string, documentId: string) {
  const children = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.userId, userId),
        eq(documents.parentDocument, documentId)
      )
    );

  for (const child of children) {
    await db
      .update(documents)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(eq(documents.id, child.id));

    await recursiveArchive(userId, child.id);
  }
}

// PATCH /api/documents/:id/archive
export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = params;

  const [existing] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id));

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.userId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [doc] = await db
    .update(documents)
    .set({ isArchived: true, updatedAt: new Date() })
    .where(eq(documents.id, id))
    .returning();

  await recursiveArchive(userId, id);

  return NextResponse.json(doc);
}
