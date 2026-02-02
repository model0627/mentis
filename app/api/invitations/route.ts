import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invitations } from "@/lib/db/schema";
import { isWorkspaceAdmin } from "@/lib/permissions";
import { isNull, and, gt } from "drizzle-orm";
import crypto from "crypto";

// POST /api/invitations — create an invitation link
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const callerIsAdmin = await isWorkspaceAdmin(userId);
  if (!callerIsAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const role = body.role || "member";
  const email = body.email || null;

  if (!["admin", "member"].includes(role)) {
    return NextResponse.json(
      { error: "Role must be 'admin' or 'member'" },
      { status: 400 }
    );
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [invitation] = await db
    .insert(invitations)
    .values({
      token,
      invitedBy: userId,
      email,
      role,
      expiresAt,
    })
    .returning();

  return NextResponse.json(invitation, { status: 201 });
}

// GET /api/invitations — list active (unused, not expired) invitations
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const callerIsAdmin = await isWorkspaceAdmin(userId);
  if (!callerIsAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const active = await db
    .select()
    .from(invitations)
    .where(
      and(isNull(invitations.usedBy), gt(invitations.expiresAt, new Date()))
    );

  return NextResponse.json(active);
}
