import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatReactions, chatRoomMembers, chatMessages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// POST /api/chat/rooms/:roomId/messages/:messageId/reactions — add reaction
export async function POST(
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

  // Check message exists
  const [message] = await db
    .select()
    .from(chatMessages)
    .where(
      and(eq(chatMessages.id, messageId), eq(chatMessages.roomId, roomId))
    );

  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const body = await req.json();
  const { emoji } = body;

  if (!emoji) {
    return NextResponse.json({ error: "Emoji required" }, { status: 400 });
  }

  // Upsert - ignore if already exists
  try {
    const [reaction] = await db
      .insert(chatReactions)
      .values({
        messageId,
        userId,
        emoji,
      })
      .onConflictDoNothing()
      .returning();

    if (!reaction) {
      // Already exists
      return NextResponse.json({ exists: true });
    }

    return NextResponse.json(reaction);
  } catch {
    return NextResponse.json({ exists: true });
  }
}

// DELETE /api/chat/rooms/:roomId/messages/:messageId/reactions — remove reaction
export async function DELETE(
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

  const body = await req.json();
  const { emoji } = body;

  if (!emoji) {
    return NextResponse.json({ error: "Emoji required" }, { status: 400 });
  }

  await db
    .delete(chatReactions)
    .where(
      and(
        eq(chatReactions.messageId, messageId),
        eq(chatReactions.userId, userId),
        eq(chatReactions.emoji, emoji)
      )
    );

  return NextResponse.json({ success: true });
}
