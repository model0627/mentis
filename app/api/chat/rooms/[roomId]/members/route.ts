import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatRoomMembers, users } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

// GET /api/chat/rooms/:roomId/members — list room members
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

  return NextResponse.json(members);
}
