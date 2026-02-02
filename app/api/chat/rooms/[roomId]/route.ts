import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  chatRooms,
  chatRoomMembers,
  users,
  documents,
} from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

// GET /api/chat/rooms/:roomId — room detail
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { roomId } = await params;

  const [room] = await db
    .select()
    .from(chatRooms)
    .where(eq(chatRooms.id, roomId));

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

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
    .leftJoin(users, sql`${chatRoomMembers.userId}::text = ${users.id}::text`)
    .where(eq(chatRoomMembers.roomId, roomId));

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

  return NextResponse.json({
    ...room,
    members,
    documentTitle,
    documentIcon,
  });
}
