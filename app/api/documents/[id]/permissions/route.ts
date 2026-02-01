import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents, documentPermissions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { canManagePermissions } from "@/lib/permissions";

// GET /api/documents/:id/permissions
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id));

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await canManagePermissions(doc, userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const perms = await db
    .select()
    .from(documentPermissions)
    .where(eq(documentPermissions.documentId, id));

  return NextResponse.json(perms);
}

// POST /api/documents/:id/permissions — add or update permission
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id));

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await canManagePermissions(doc, userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { userId: targetUserId, role } = body;

  if (!targetUserId || !role) {
    return NextResponse.json(
      { error: "userId and role are required" },
      { status: 400 }
    );
  }

  if (!["admin", "editor", "viewer"].includes(role)) {
    return NextResponse.json(
      { error: "Invalid role. Must be admin, editor, or viewer" },
      { status: 400 }
    );
  }

  // Upsert: update if exists, insert if not
  const [existing] = await db
    .select()
    .from(documentPermissions)
    .where(
      and(
        eq(documentPermissions.documentId, id),
        eq(documentPermissions.userId, targetUserId)
      )
    );

  let perm;
  if (existing) {
    [perm] = await db
      .update(documentPermissions)
      .set({ role })
      .where(eq(documentPermissions.id, existing.id))
      .returning();
  } else {
    [perm] = await db
      .insert(documentPermissions)
      .values({
        documentId: id,
        userId: targetUserId,
        role,
      })
      .returning();
  }

  return NextResponse.json(perm);
}

// DELETE /api/documents/:id/permissions — remove permission
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id));

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await canManagePermissions(doc, userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { userId: targetUserId } = body;

  if (!targetUserId) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  // Don't allow removing the document owner's permission
  if (targetUserId === doc.userId) {
    return NextResponse.json(
      { error: "Cannot remove owner's permission" },
      { status: 400 }
    );
  }

  await db
    .delete(documentPermissions)
    .where(
      and(
        eq(documentPermissions.documentId, id),
        eq(documentPermissions.userId, targetUserId)
      )
    );

  return NextResponse.json({ success: true });
}
