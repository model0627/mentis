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
