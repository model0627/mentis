import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatMessages, chatRoomMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// PATCH /api/chat/rooms/:roomId/messages/:messageId — edit message
export async function PATCH(
  req: Request,
  {
    params,
  }: { params: Promise<{ roomId: string; messageId: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { roomId, messageId } = await params;

  // Check membership
  const [membership] = await db
    .select()
    .from(chatRoomMembers)
    .where(
      and(
        eq(chatRoomMembers.roomId, roomId),
        eq(chatRoomMembers.userId, userId)
      )
    );

  if (!membership) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  // Check message ownership
  const [existing] = await db
    .select()
    .from(chatMessages)
    .where(
      and(eq(chatMessages.id, messageId), eq(chatMessages.roomId, roomId))
    );

  if (!existing) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  if (existing.userId !== userId) {
    return NextResponse.json(
      { error: "Can only edit your own messages" },
      { status: 403 }
    );
  }

  if (existing.isDeleted) {
    return NextResponse.json(
      { error: "Cannot edit a deleted message" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { content } = body;

  const [updated] = await db
    .update(chatMessages)
    .set({
      content,
      isEdited: true,
      updatedAt: new Date(),
    })
    .where(eq(chatMessages.id, messageId))
    .returning();

  return NextResponse.json(updated);
}

// DELETE /api/chat/rooms/:roomId/messages/:messageId — soft delete
export async function DELETE(
  _req: Request,
  {
    params,
  }: { params: Promise<{ roomId: string; messageId: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { roomId, messageId } = await params;

  // Check membership
  const [membership] = await db
    .select()
    .from(chatRoomMembers)
    .where(
      and(
        eq(chatRoomMembers.roomId, roomId),
        eq(chatRoomMembers.userId, userId)
      )
    );

  if (!membership) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  // Check message ownership
  const [existing] = await db
    .select()
    .from(chatMessages)
    .where(
      and(eq(chatMessages.id, messageId), eq(chatMessages.roomId, roomId))
    );

  if (!existing) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  if (existing.userId !== userId) {
    return NextResponse.json(
      { error: "Can only delete your own messages" },
      { status: 403 }
    );
  }

  const [updated] = await db
    .update(chatMessages)
    .set({
      isDeleted: true,
      content: null,
      attachmentUrl: null,
      attachmentName: null,
      updatedAt: new Date(),
    })
    .where(eq(chatMessages.id, messageId))
    .returning();

  return NextResponse.json(updated);
}
