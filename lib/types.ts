export interface Document {
  id: string;
  title: string;
  userId: string;
  isArchived: boolean;
  isPublished: boolean;
  parentDocument: string | null;
  content: string | null;
  coverImage: string | null;
  icon: string | null;
  workspace: "private" | "shared";
  fullWidth: boolean;
  smallText: boolean;
  isLocked: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export type DocumentRole = "admin" | "editor" | "viewer";

export interface DocumentPermission {
  id: string;
  documentId: string;
  userId: string;
  role: DocumentRole;
  createdAt: string | null;
}

export type WorkspaceRole = "owner" | "admin" | "member";

export interface Invitation {
  id: string;
  token: string;
  invitedBy: string;
  email: string | null;
  role: WorkspaceRole;
  usedBy: string | null;
  usedAt: string | null;
  expiresAt: string;
  createdAt: string | null;
}
