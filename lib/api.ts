import { Document, DocumentPermission, Invitation, WorkspaceRole, ChatRoom, ChatMessage, ChatMessagesPage, ChatRoomMember } from "./types";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || "Request failed");
  }
  return res.json();
}

export interface SearchUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface WorkspaceUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: WorkspaceRole;
  isActive: boolean;
  createdAt: string;
}

export const documentsApi = {
  getSearch: () => fetchJson<Document[]>("/api/documents"),

  getSidebar: (parentDocument?: string, workspace?: string) => {
    const params = new URLSearchParams();
    if (parentDocument) params.set("parentDocument", parentDocument);
    if (workspace) params.set("workspace", workspace);
    return fetchJson<Document[]>(`/api/documents/sidebar?${params}`);
  },

  getTrash: () => fetchJson<Document[]>("/api/documents/trash"),

  getById: (id: string) => fetchJson<Document>(`/api/documents/${id}`),

  getPublicById: (id: string) =>
    fetchJson<Document>(`/api/documents/public/${id}`),

  create: (data: {
    title: string;
    parentDocument?: string;
    workspace?: string;
  }) =>
    fetchJson<Document>("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: Partial<
      Pick<Document, "title" | "content" | "coverImage" | "icon" | "isPublished" | "fullWidth" | "smallText" | "isLocked" | "parentDocument">
    >
  ) =>
    fetchJson<Document>(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  archive: (id: string) =>
    fetchJson<Document>(`/api/documents/${id}/archive`, { method: "PATCH" }),

  restore: (id: string) =>
    fetchJson<Document>(`/api/documents/${id}/restore`, { method: "PATCH" }),

  remove: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/documents/${id}`, {
      method: "DELETE",
    }),

  removeIcon: (id: string) =>
    fetchJson<Document>(`/api/documents/${id}/icon`, { method: "DELETE" }),

  removeCoverImage: (id: string) =>
    fetchJson<Document>(`/api/documents/${id}/cover`, { method: "DELETE" }),

  // Permissions
  getPermissions: (id: string) =>
    fetchJson<DocumentPermission[]>(`/api/documents/${id}/permissions`),

  addPermission: (id: string, userId: string, role: string) =>
    fetchJson<DocumentPermission>(`/api/documents/${id}/permissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    }),

  removePermission: (id: string, userId: string) =>
    fetchJson<{ success: boolean }>(`/api/documents/${id}/permissions`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }),

  // Users
  getUsers: (includeInactive?: boolean) => {
    const params = includeInactive ? "?includeInactive=true" : "";
    return fetchJson<WorkspaceUser[]>(`/api/users${params}`);
  },

  // User search
  searchUsers: (query: string) => {
    const params = new URLSearchParams({ q: query });
    return fetchJson<SearchUser[]>(`/api/users/search?${params}`);
  },
};

export const membersApi = {
  changeRole: (userId: string, role: WorkspaceRole) =>
    fetchJson<{ id: string; role: string }>(`/api/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    }),

  deactivateUser: (userId: string) =>
    fetchJson<{ id: string; isActive: boolean }>(
      `/api/users/${userId}/deactivate`,
      { method: "PATCH" }
    ),

  activateUser: (userId: string) =>
    fetchJson<{ id: string; isActive: boolean }>(
      `/api/users/${userId}/activate`,
      { method: "PATCH" }
    ),

  createInvitation: (role: string, email?: string) =>
    fetchJson<Invitation>("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, email }),
    }),

  getInvitations: () => fetchJson<Invitation[]>("/api/invitations"),

  acceptInvitation: (token: string) =>
    fetchJson<{ success: boolean; role: string }>(
      `/api/invitations/${token}/accept`,
      { method: "POST" }
    ),
};

export const chatApi = {
  // Rooms
  getRooms: () => fetchJson<ChatRoom[]>("/api/chat/rooms"),

  createRoom: (data: {
    type: "page" | "dm";
    documentId?: string;
    targetUserId?: string;
  }) =>
    fetchJson<ChatRoom>("/api/chat/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  getRoom: (roomId: string) =>
    fetchJson<ChatRoom>(`/api/chat/rooms/${roomId}`),

  // Messages
  getMessages: (roomId: string, cursor?: string, parentMessageId?: string) => {
    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    if (parentMessageId) params.set("parentMessageId", parentMessageId);
    return fetchJson<ChatMessagesPage>(
      `/api/chat/rooms/${roomId}/messages?${params}`
    );
  },

  sendMessage: (
    roomId: string,
    data: {
      content?: string;
      attachmentUrl?: string;
      attachmentName?: string;
      parentMessageId?: string;
    }
  ) =>
    fetchJson<ChatMessage>(`/api/chat/rooms/${roomId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  editMessage: (roomId: string, messageId: string, content: string) =>
    fetchJson<ChatMessage>(
      `/api/chat/rooms/${roomId}/messages/${messageId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }
    ),

  deleteMessage: (roomId: string, messageId: string) =>
    fetchJson<ChatMessage>(
      `/api/chat/rooms/${roomId}/messages/${messageId}`,
      { method: "DELETE" }
    ),

  // Reactions
  addReaction: (roomId: string, messageId: string, emoji: string) =>
    fetchJson(`/api/chat/rooms/${roomId}/messages/${messageId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    }),

  removeReaction: (roomId: string, messageId: string, emoji: string) =>
    fetchJson(`/api/chat/rooms/${roomId}/messages/${messageId}/reactions`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    }),

  // Read status
  markRead: (roomId: string) =>
    fetchJson<{ success: boolean }>(`/api/chat/rooms/${roomId}/read`, {
      method: "POST",
    }),

  // Members
  getMembers: (roomId: string) =>
    fetchJson<ChatRoomMember[]>(`/api/chat/rooms/${roomId}/members`),
};
