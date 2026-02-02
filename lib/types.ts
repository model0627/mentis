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

// ── Chat types ──────────────────────────────────────────────

export type ChatRoomType = "page" | "dm";

export interface ChatRoom {
  id: string;
  type: ChatRoomType;
  documentId: string | null;
  slug: string;
  createdAt: string | null;
  // Joined fields
  lastMessage?: ChatMessage | null;
  unreadCount?: number;
  members?: ChatRoomMember[];
  documentTitle?: string | null;
  documentIcon?: string | null;
}

export interface ChatRoomMember {
  id: string;
  roomId: string;
  userId: string;
  lastReadAt: string | null;
  joinedAt: string | null;
  // Joined fields
  userName?: string | null;
  userImage?: string | null;
  userEmail?: string | null;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  content: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  parentMessageId: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  // Joined fields
  userName?: string | null;
  userImage?: string | null;
  reactions?: ChatReaction[];
  replyCount?: number;
}

export interface ChatReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string | null;
  // Joined fields
  userName?: string | null;
}

export interface ChatMessagesPage {
  messages: ChatMessage[];
  nextCursor: string | null;
}
