import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { and, or, ilike, ne } from "drizzle-orm";

// GET /api/users/search?q=query
export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const query = req.nextUrl.searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json([]);
  }

  const searchPattern = `%${query}%`;

  const results = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(users)
    .where(
      and(
        ne(users.id, userId),
        or(
          ilike(users.email, searchPattern),
          ilike(users.name, searchPattern)
        )
      )
    )
    .limit(10);

  return NextResponse.json(results);
}
