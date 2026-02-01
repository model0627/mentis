import { db } from "@/lib/db";
import { documents, documentPermissions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { DocumentRole } from "@/lib/types";

type DocLike = {
  id: string;
  userId: string;
  workspace: string;
  isArchived?: boolean;
  isPublished?: boolean;
};

export async function getUserRole(
  documentId: string,
  userId: string
): Promise<DocumentRole | null> {
  const [perm] = await db
    .select()
    .from(documentPermissions)
    .where(
      and(
        eq(documentPermissions.documentId, documentId),
        eq(documentPermissions.userId, userId)
      )
    );
  return (perm?.role as DocumentRole) ?? null;
}

export function canView(doc: DocLike, userId: string | undefined): boolean {
  // Published docs are publicly accessible
  if (doc.isPublished && !doc.isArchived) return true;

  if (!userId) return false;

  // Private: owner only
  if (doc.workspace === "private") {
    return doc.userId === userId;
  }

  // Shared: all logged-in users can view
  return true;
}

export async function canEdit(
  doc: DocLike,
  userId: string | undefined
): Promise<boolean> {
  if (!userId) return false;

  // Owner can always edit
  if (doc.userId === userId) return true;

  // Private: owner only
  if (doc.workspace === "private") return false;

  // Shared: admin or editor
  const role = await getUserRole(doc.id, userId);
  return role === "admin" || role === "editor";
}

export async function canDelete(
  doc: DocLike,
  userId: string | undefined
): Promise<boolean> {
  if (!userId) return false;

  // Owner can always delete
  if (doc.userId === userId) return true;

  // Private: owner only
  if (doc.workspace === "private") return false;

  // Shared: admin only
  const role = await getUserRole(doc.id, userId);
  return role === "admin";
}

export async function canManagePermissions(
  doc: DocLike,
  userId: string | undefined
): Promise<boolean> {
  if (!userId) return false;

  // Owner can always manage permissions
  if (doc.userId === userId) return true;

  // Private: owner only
  if (doc.workspace === "private") return false;

  // Shared: admin only
  const role = await getUserRole(doc.id, userId);
  return role === "admin";
}
