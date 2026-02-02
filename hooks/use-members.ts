"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsApi, membersApi } from "@/lib/api";
import { WorkspaceRole } from "@/lib/types";

export function useMembers(includeInactive = false) {
  return useQuery({
    queryKey: ["users", "all", { includeInactive }],
    queryFn: () => documentsApi.getUsers(includeInactive),
  });
}

export function useChangeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: WorkspaceRole }) =>
      membersApi.changeRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => membersApi.deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => membersApi.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ role, email }: { role: string; email?: string }) =>
      membersApi.createInvitation(role, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
}

export function useInvitations() {
  return useQuery({
    queryKey: ["invitations"],
    queryFn: () => membersApi.getInvitations(),
  });
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: (token: string) => membersApi.acceptInvitation(token),
  });
}
