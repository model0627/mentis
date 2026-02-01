"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "@/lib/api";

// ─── Query Hooks ────────────────────────────────────────────

export function useSearchDocs() {
  return useQuery({
    queryKey: ["documents", "search"],
    queryFn: () => documentsApi.getSearch(),
  });
}

export function useSidebar(parentDocument?: string) {
  return useQuery({
    queryKey: ["documents", "sidebar", parentDocument ?? "root"],
    queryFn: () => documentsApi.getSidebar(parentDocument),
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
    mutationFn: (data: { title: string; parentDocument?: string }) =>
      documentsApi.create(data),
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
