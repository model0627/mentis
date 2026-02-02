import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isWorkspaceAdmin, isWorkspaceOwner } from "@/lib/permissions";

// PATCH /api/users/[id]/role — change a member's workspace role
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
  const { role } = await req.json();

  if (!["admin", "member"].includes(role)) {
    return NextResponse.json(
      { error: "Role must be 'admin' or 'member'" },
      { status: 400 }
    );
  }

  // Only owner or admin can change roles
  const callerIsAdmin = await isWorkspaceAdmin(currentUserId);
  if (!callerIsAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Cannot change owner's role
  const targetIsOwner = await isWorkspaceOwner(targetUserId);
  if (targetIsOwner) {
    return NextResponse.json(
      { error: "Cannot change owner's role" },
      { status: 403 }
    );
  }

  // Only owner can promote to admin
  if (role === "admin") {
    const callerIsOwner = await isWorkspaceOwner(currentUserId);
    if (!callerIsOwner) {
      return NextResponse.json(
        { error: "Only owner can promote to admin" },
        { status: 403 }
      );
    }
  }

  const [updated] = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, targetUserId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    });

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
