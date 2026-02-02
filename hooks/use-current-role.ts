"use client";

import { useSession } from "next-auth/react";
import { WorkspaceRole } from "@/lib/types";

export function useCurrentRole(): WorkspaceRole {
  const { data: session } = useSession();
  return (session?.user as any)?.role || "member";
}

export function useIsAdmin(): boolean {
  const role = useCurrentRole();
  return role === "owner" || role === "admin";
}

export function useIsOwner(): boolean {
  const role = useCurrentRole();
  return role === "owner";
}
