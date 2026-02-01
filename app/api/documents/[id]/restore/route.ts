import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

async function recursiveRestore(userId: string, documentId: string) {
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
      .set({ isArchived: false, updatedAt: new Date() })
      .where(eq(documents.id, child.id));

    await recursiveRestore(userId, child.id);
  }
}

// PATCH /api/documents/:id/restore
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

  const updateData: Record<string, any> = {
    isArchived: false,
    updatedAt: new Date(),
  };

  // If parent is archived, detach from parent
  if (existing.parentDocument) {
    const [parent] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, existing.parentDocument));

    if (parent?.isArchived) {
      updateData.parentDocument = null;
    }
  }

  const [doc] = await db
    .update(documents)
    .set(updateData)
    .where(eq(documents.id, id))
    .returning();

  await recursiveRestore(userId, id);

  return NextResponse.json(doc);
}
