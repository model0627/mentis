import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatRoomMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// POST /api/chat/rooms/:roomId/read — mark room as read
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { roomId } = await params;

  const [updated] = await db
    .update(chatRoomMembers)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(chatRoomMembers.roomId, roomId),
        eq(chatRoomMembers.userId, userId)
      )
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  return NextResponse.json({ success: true });
}
