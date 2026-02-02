import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isWorkspaceAdmin } from "@/lib/permissions";

// PATCH /api/users/[id]/activate — re-activate a member
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: targetUserId } = await params;

  // Only admin/owner can activate
  const callerIsAdmin = await isWorkspaceAdmin(currentUserId);
  if (!callerIsAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [updated] = await db
    .update(users)
    .set({ isActive: true })
    .where(eq(users.id, targetUserId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      isActive: users.isActive,
    });

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
