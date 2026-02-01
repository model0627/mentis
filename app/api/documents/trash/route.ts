import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents, documentPermissions } from "@/lib/db/schema";
import { eq, and, desc, or, inArray } from "drizzle-orm";

// GET /api/documents/trash
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Private archived docs owned by user
  const privateDocs = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.userId, userId),
        eq(documents.isArchived, true)
      )
    )
    .orderBy(desc(documents.createdAt));

  // Shared archived docs where user is admin
  const adminPerms = await db
    .select({ documentId: documentPermissions.documentId })
    .from(documentPermissions)
    .where(
      and(
        eq(documentPermissions.userId, userId),
        eq(documentPermissions.role, "admin")
      )
    );

  const adminDocIds = adminPerms.map((p) => p.documentId);

  let sharedDocs: typeof privateDocs = [];
  if (adminDocIds.length > 0) {
    sharedDocs = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.workspace, "shared"),
          eq(documents.isArchived, true),
          inArray(documents.id, adminDocIds)
        )
      )
      .orderBy(desc(documents.createdAt));
  }

  // Merge and deduplicate
  const seen = new Set<string>();
  const allDocs = [];
  for (const doc of [...privateDocs, ...sharedDocs]) {
    if (!seen.has(doc.id)) {
      seen.add(doc.id);
      allDocs.push(doc);
    }
  }

  return NextResponse.json(allDocs);
}
