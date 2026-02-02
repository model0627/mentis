import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";

// GET /api/users — all users, ordered by creation date
export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const includeInactive = searchParams.get("includeInactive") === "true";

  let query = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.createdAt));

  if (!includeInactive) {
    query = query.where(eq(users.isActive, true)) as typeof query;
  }

  const allUsers = await query;

  return NextResponse.json(allUsers);
}
