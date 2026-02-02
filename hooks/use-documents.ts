"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "@/lib/api";
import { Document } from "@/lib/types";

// ─── Breadcrumb Hook ───────────────────────────────────────

export function useBreadcrumbs(documentId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["documents", "breadcrumbs", documentId],
    queryFn: async () => {
      const ancestors: { id: string; title: string; icon: string | null }[] = [];
      let currentId: string | null = documentId;
      const MAX_DEPTH = 10;

      for (let i = 0; i < MAX_DEPTH && currentId; i++) {
        // Try React Query cache first, otherwise fetch
        let doc: Document | undefined = queryClient.getQueryData<Document>(["documents", currentId]);
        if (!doc) {
          doc = await queryClient.fetchQuery<Document>({
            queryKey: ["documents", currentId],
            queryFn: () => documentsApi.getById(currentId!),
          });
        }
        if (!doc) break;

        // Skip the current document itself — we only want ancestors
        if (doc.id !== documentId) {
          ancestors.unshift({ id: doc.id, title: doc.title, icon: doc.icon });
        }
        currentId = doc.parentDocument;
      }

      return ancestors;
    },
    enabled: !!documentId,
  });
}

// ─── Query Hooks ────────────────────────────────────────────

export function useSearchDocs() {
  return useQuery({
    queryKey: ["documents", "search"],
    queryFn: () => documentsApi.getSearch(),
  });
}

export function useSidebar(parentDocument?: string, workspace?: string) {
  return useQuery({
    queryKey: ["documents", "sidebar", workspace ?? "private", parentDocument ?? "root"],
    queryFn: () => documentsApi.getSidebar(parentDocument, workspace),
  });
}

export function useTrash() {
  return useQuery({
    queryKey: ["documents", "trash"],
    queryFn: () => documentsApi.getTrash(),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: () => documentsApi.getById(id),
    enabled: !!id,
  });
}

export function usePublicDocument(id: string) {
  return useQuery({
    queryKey: ["documents", "public", id],
    queryFn: () => documentsApi.getPublicById(id),
    enabled: !!id,
  });
}

// ─── Mutation Hooks ─────────────────────────────────────────

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      parentDocument?: string;
      workspace?: string;
    }) => documentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useDuplicateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sourceDoc: Document) => {
      const created = await documentsApi.create({
        title: `${sourceDoc.title} (copy)`,
        parentDocument: sourceDoc.parentDocument ?? undefined,
        workspace: sourceDoc.workspace,
      });
      // Copy content, icon, coverImage to the new document
      const updates: Record<string, any> = {};
      if (sourceDoc.content) updates.content = sourceDoc.content;
      if (sourceDoc.icon) updates.icon = sourceDoc.icon;
      if (sourceDoc.coverImage) updates.coverImage = sourceDoc.coverImage;
      if (sourceDoc.fullWidth) updates.fullWidth = sourceDoc.fullWidth;
      if (sourceDoc.smallText) updates.smallText = sourceDoc.smallText;

      if (Object.keys(updates).length > 0) {
        return documentsApi.update(created.id, updates);
      }
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      content?: string;
      coverImage?: string;
      icon?: string;
      isPublished?: boolean;
      fullWidth?: boolean;
      smallText?: boolean;
      isLocked?: boolean;
      parentDocument?: string | null;
    }) => documentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useArchiveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useRestoreDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useRemoveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useRemoveIcon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.removeIcon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useRemoveCoverImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.removeCoverImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

// ─── Permission Hooks ───────────────────────────────────────

export function usePermissions(id: string) {
  return useQuery({
    queryKey: ["documents", id, "permissions"],
    queryFn: () => documentsApi.getPermissions(id),
    enabled: !!id,
  });
}

export function useAddPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      userId,
      role,
    }: {
      id: string;
      userId: string;
      role: string;
    }) => documentsApi.addPermission(id, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useRemovePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      documentsApi.removePermission(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

// ─── Users Hook ────────────────────────────────────────────

export function useUsers() {
  return useQuery({
    queryKey: ["users", "all"],
    queryFn: () => documentsApi.getUsers(),
  });
}

// ─── User Search Hook ───────────────────────────────────────

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: () => documentsApi.searchUsers(query),
    enabled: query.length >= 2,
  });
}
