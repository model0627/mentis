import { Document } from "./types";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || "Request failed");
  }
  return res.json();
}

export const documentsApi = {
  getSearch: () => fetchJson<Document[]>("/api/documents"),

  getSidebar: (parentDocument?: string) => {
    const params = new URLSearchParams();
    if (parentDocument) params.set("parentDocument", parentDocument);
    return fetchJson<Document[]>(`/api/documents/sidebar?${params}`);
  },

  getTrash: () => fetchJson<Document[]>("/api/documents/trash"),

  getById: (id: string) => fetchJson<Document>(`/api/documents/${id}`),

  getPublicById: (id: string) =>
    fetchJson<Document>(`/api/documents/public/${id}`),

  create: (data: { title: string; parentDocument?: string }) =>
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
};
