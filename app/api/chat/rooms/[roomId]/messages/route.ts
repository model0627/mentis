import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  chatMessages,
  chatRoomMembers,
  chatReactions,
  users,
} from "@/lib/db/schema";
import { eq, and, desc, lt, sql, isNull } from "drizzle-orm";

const PAGE_SIZE = 30;

// GET /api/chat/rooms/:roomId/messages — paginated messages
export async function GET(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { roomId } = await params;

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

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const parentMessageId = searchParams.get("parentMessageId");

  // Build conditions
  const conditions = [eq(chatMessages.roomId, roomId)];

  if (parentMessageId) {
    conditions.push(eq(chatMessages.parentMessageId, parentMessageId));
  } else {
    conditions.push(isNull(chatMessages.parentMessageId));
  }

  if (cursor) {
    conditions.push(lt(chatMessages.createdAt, new Date(cursor)));
  }

  const messages = await db
    .select({
      id: chatMessages.id,
      roomId: chatMessages.roomId,
      userId: chatMessages.userId,
      content: chatMessages.content,
      attachmentUrl: chatMessages.attachmentUrl,
      attachmentName: chatMessages.attachmentName,
      parentMessageId: chatMessages.parentMessageId,
      isEdited: chatMessages.isEdited,
      isDeleted: chatMessages.isDeleted,
      createdAt: chatMessages.createdAt,
      updatedAt: chatMessages.updatedAt,
      userName: users.name,
      userImage: users.image,
    })
    .from(chatMessages)
    .leftJoin(users, sql`${chatMessages.userId}::text = ${users.id}::text`)
    .where(and(...conditions))
    .orderBy(desc(chatMessages.createdAt))
    .limit(PAGE_SIZE + 1);

  const hasMore = messages.length > PAGE_SIZE;
  const page = hasMore ? messages.slice(0, PAGE_SIZE) : messages;
  const nextCursor = hasMore
    ? page[page.length - 1].createdAt?.toISOString() ?? null
    : null;

  // Enrich with reactions and reply counts
  const enriched = await Promise.all(
    page.map(async (msg) => {
      // Reactions
      const reactions = await db
        .select({
          id: chatReactions.id,
          messageId: chatReactions.messageId,
          userId: chatReactions.userId,
          emoji: chatReactions.emoji,
          createdAt: chatReactions.createdAt,
          userName: users.name,
        })
        .from(chatReactions)
        .leftJoin(
          users,
          sql`${chatReactions.userId}::text = ${users.id}::text`
        )
        .where(eq(chatReactions.messageId, msg.id));

      // Reply count (only for top-level messages)
      let replyCount = 0;
      if (!msg.parentMessageId) {
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(chatMessages)
          .where(
            and(
              eq(chatMessages.parentMessageId, msg.id),
              eq(chatMessages.isDeleted, false)
            )
          );
        replyCount = count;
      }

      return {
        ...msg,
        reactions,
        replyCount,
      };
    })
  );

  return NextResponse.json({
    messages: enriched,
    nextCursor,
  });
}

// POST /api/chat/rooms/:roomId/messages — send a message
export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { roomId } = await params;

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
  const { content, attachmentUrl, attachmentName, parentMessageId } = body;

  if (!content && !attachmentUrl) {
    return NextResponse.json(
      { error: "Content or attachment required" },
      { status: 400 }
    );
  }

  const [message] = await db
    .insert(chatMessages)
    .values({
      roomId,
      userId,
      content: content || null,
      attachmentUrl: attachmentUrl || null,
      attachmentName: attachmentName || null,
      parentMessageId: parentMessageId || null,
    })
    .returning();

  // Get user info
  const [user] = await db
    .select({ name: users.name, image: users.image })
    .from(users)
    .where(sql`${users.id}::text = ${userId}`);

  return NextResponse.json({
    ...message,
    userName: user?.name || null,
    userImage: user?.image || null,
    reactions: [],
    replyCount: 0,
  });
}
