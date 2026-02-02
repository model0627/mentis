import { db } from "@/lib/db";
import { documents, documentPermissions, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { DocumentRole, WorkspaceRole } from "@/lib/types";

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

  // Shared: all authenticated workspace members can edit
  return true;
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

// ── Workspace-level permission helpers ─────────────────────

export async function getWorkspaceRole(
  userId: string
): Promise<WorkspaceRole> {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId));
  return (user?.role as WorkspaceRole) ?? "member";
}

export async function isWorkspaceAdmin(userId: string): Promise<boolean> {
  const role = await getWorkspaceRole(userId);
  return role === "owner" || role === "admin";
}

export async function isWorkspaceOwner(userId: string): Promise<boolean> {
  const role = await getWorkspaceRole(userId);
  return role === "owner";
}
