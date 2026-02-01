import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { canView, canEdit, canDelete } from "@/lib/permissions";

// GET /api/documents/:id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;
  const { id } = await params;

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id));

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canView(doc, userId)) {
    if (!userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json(doc);
}

// PATCH /api/documents/:id
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const [existing] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id));

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await canEdit(existing, userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { title, content, coverImage, icon, isPublished } = body;

  const updateData: Record<string, any> = { updatedAt: new Date() };
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (coverImage !== undefined) updateData.coverImage = coverImage;
  if (icon !== undefined) updateData.icon = icon;
  if (isPublished !== undefined) updateData.isPublished = isPublished;

  const [doc] = await db
    .update(documents)
    .set(updateData)
    .where(eq(documents.id, id))
    .returning();

  return NextResponse.json(doc);
}

// DELETE /api/documents/:id
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const [existing] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id));

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await canDelete(existing, userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await db.delete(documents).where(eq(documents.id, id));

  return NextResponse.json({ success: true });
}
