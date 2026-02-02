import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invitations, users } from "@/lib/db/schema";
import { eq, and, isNull, gt } from "drizzle-orm";

// POST /api/invitations/[token]/accept — accept an invitation
export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { token } = await params;

  // Find valid invitation
  const [invitation] = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.token, token),
        isNull(invitations.usedBy),
        gt(invitations.expiresAt, new Date())
      )
    );

  if (!invitation) {
    return NextResponse.json(
      { error: "Invitation not found, already used, or expired" },
      { status: 404 }
    );
  }

  // If invitation has a specific email, verify it matches
  if (invitation.email) {
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId));
    if (user?.email !== invitation.email) {
      return NextResponse.json(
        { error: "This invitation is for a different email address" },
        { status: 403 }
      );
    }
  }

  // Update user role if they are currently a member (don't downgrade)
  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId));

  if (currentUser?.role === "member" && invitation.role !== "member") {
    await db
      .update(users)
      .set({ role: invitation.role })
      .where(eq(users.id, userId));
  }

  // Mark invitation as used
  await db
    .update(invitations)
    .set({ usedBy: userId, usedAt: new Date() })
    .where(eq(invitations.id, invitation.id));

  return NextResponse.json({ success: true, role: invitation.role });
}
