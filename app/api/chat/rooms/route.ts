import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  chatRooms,
  chatRoomMembers,
  chatMessages,
  users,
  documents,
} from "@/lib/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

// GET /api/chat/rooms — list rooms for current user
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get all rooms the user is a member of
  const memberRows = await db
    .select({ roomId: chatRoomMembers.roomId })
    .from(chatRoomMembers)
    .where(eq(chatRoomMembers.userId, userId));

  if (memberRows.length === 0) {
    return NextResponse.json([]);
  }

  const roomIds = memberRows.map((r) => r.roomId);

  const rooms = await db
    .select()
    .from(chatRooms)
    .where(inArray(chatRooms.id, roomIds))
    .orderBy(desc(chatRooms.createdAt));

  // Enrich rooms with last message, unread count, members, and document info
  const enriched = await Promise.all(
    rooms.map(async (room) => {
      // Last message
      const [lastMessage] = await db
        .select()
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.roomId, room.id),
            eq(chatMessages.isDeleted, false)
          )
        )
        .orderBy(desc(chatMessages.createdAt))
        .limit(1);

      // Unread count
      const [membership] = await db
        .select({ lastReadAt: chatRoomMembers.lastReadAt })
        .from(chatRoomMembers)
        .where(
          and(
            eq(chatRoomMembers.roomId, room.id),
            eq(chatRoomMembers.userId, userId)
          )
        );

      let unreadCount = 0;
      if (membership) {
        const condition = membership.lastReadAt
          ? and(
              eq(chatMessages.roomId, room.id),
              eq(chatMessages.isDeleted, false),
              sql`${chatMessages.createdAt} > ${membership.lastReadAt.toISOString()}`
            )
          : and(
              eq(chatMessages.roomId, room.id),
              eq(chatMessages.isDeleted, false)
            );

        const [{ count }] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(chatMessages)
          .where(condition);
        unreadCount = count;
      }

      // Members with user info
      const members = await db
        .select({
          id: chatRoomMembers.id,
          roomId: chatRoomMembers.roomId,
          userId: chatRoomMembers.userId,
          lastReadAt: chatRoomMembers.lastReadAt,
          joinedAt: chatRoomMembers.joinedAt,
          userName: users.name,
          userImage: users.image,
          userEmail: users.email,
        })
        .from(chatRoomMembers)
        .leftJoin(
          users,
          sql`${chatRoomMembers.userId}::text = ${users.id}::text`
        )
        .where(eq(chatRoomMembers.roomId, room.id));

      // Document info for page rooms
      let documentTitle = null;
      let documentIcon = null;
      if (room.type === "page" && room.documentId) {
        const [doc] = await db
          .select({ title: documents.title, icon: documents.icon })
          .from(documents)
          .where(eq(documents.id, room.documentId));
        if (doc) {
          documentTitle = doc.title;
          documentIcon = doc.icon;
        }
      }

      return {
        ...room,
        lastMessage: lastMessage || null,
        unreadCount,
        members,
        documentTitle,
        documentIcon,
      };
    })
  );

  return NextResponse.json(enriched);
}

// POST /api/chat/rooms — create or get a room
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { type, documentId, targetUserId } = body;

  if (!type || (type !== "page" && type !== "dm")) {
    return NextResponse.json({ error: "Invalid room type" }, { status: 400 });
  }

  let slug: string;

  if (type === "page") {
    if (!documentId) {
      return NextResponse.json(
        { error: "documentId required for page rooms" },
        { status: 400 }
      );
    }
    slug = `chat-page-${documentId}`;
  } else {
    if (!targetUserId) {
      return NextResponse.json(
        { error: "targetUserId required for DM rooms" },
        { status: 400 }
      );
    }
    const sorted = [userId, targetUserId].sort();
    slug = `chat-dm-${sorted[0]}-${sorted[1]}`;
  }

  // Check if room exists
  const [existing] = await db
    .select()
    .from(chatRooms)
    .where(eq(chatRooms.slug, slug));

  if (existing) {
    // Ensure current user is a member
    const [membership] = await db
      .select()
      .from(chatRoomMembers)
      .where(
        and(
          eq(chatRoomMembers.roomId, existing.id),
          eq(chatRoomMembers.userId, userId)
        )
      );

    if (!membership) {
      await db.insert(chatRoomMembers).values({
        roomId: existing.id,
        userId,
      });
    }

    return NextResponse.json(existing);
  }

  // Create new room
  const [room] = await db
    .insert(chatRooms)
    .values({
      type,
      documentId: type === "page" ? documentId : null,
      slug,
    })
    .returning();

  // Add creator as member
  await db.insert(chatRoomMembers).values({
    roomId: room.id,
    userId,
  });

  // For DM, also add the target user
  if (type === "dm" && targetUserId) {
    await db.insert(chatRoomMembers).values({
      roomId: room.id,
      userId: targetUserId,
    });
  }

  return NextResponse.json(room);
}
