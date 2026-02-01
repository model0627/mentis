import { Document, DocumentPermission } from "./types";

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
      Pick<Document, "title" | "content" | "coverImage" | "icon" | "isPublished">
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

  // User search
  searchUsers: (query: string) => {
    const params = new URLSearchParams({ q: query });
    return fetchJson<SearchUser[]>(`/api/users/search?${params}`);
  },
};
