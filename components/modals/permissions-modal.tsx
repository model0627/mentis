"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog";
import { usePermissionsModal } from "@/hooks/use-permissions-modal";
import {
    usePermissions,
    useAddPermission,
    useRemovePermission,
    useSearchUsers,
} from "@/hooks/use-documents";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, Shield, Edit3, Eye } from "lucide-react";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { DocumentRole } from "@/lib/types";
import { SearchUser } from "@/lib/api";

const ROLE_LABELS: Record<DocumentRole, { label: string; icon: typeof Shield }> = {
    admin: { label: "Admin", icon: Shield },
    editor: { label: "Editor", icon: Edit3 },
    viewer: { label: "Viewer", icon: Eye },
};

export const PermissionsModal = () => {
    const { isOpen, documentId, onClose } = usePermissionsModal();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState<DocumentRole>("viewer");

    const { data: permissions, isLoading: permissionsLoading } = usePermissions(
        documentId || ""
    );
    const { data: searchResults } = useSearchUsers(searchQuery);
    const addPermissionMutation = useAddPermission();
    const removePermissionMutation = useRemovePermission();

    const handleAddPermission = (user: SearchUser) => {
        if (!documentId) return;
        const promise = addPermissionMutation.mutateAsync({
            id: documentId,
            userId: user.id,
            role: selectedRole,
        });

        toast.promise(promise, {
            loading: "Adding permission...",
            success: `${user.name || user.email} added as ${selectedRole}`,
            error: "Failed to add permission.",
        });

        setSearchQuery("");
    };

    const handleRemovePermission = (userId: string) => {
        if (!documentId) return;
        const promise = removePermissionMutation.mutateAsync({
            id: documentId,
            userId,
        });

        toast.promise(promise, {
            loading: "Removing permission...",
            success: "Permission removed.",
            error: "Failed to remove permission.",
        });
    };

    const handleRoleChange = (userId: string, role: DocumentRole) => {
        if (!documentId) return;
        const promise = addPermissionMutation.mutateAsync({
            id: documentId,
            userId,
            role,
        });

        toast.promise(promise, {
            loading: "Updating role...",
            success: `Role updated to ${role}`,
            error: "Failed to update role.",
        });
    };

    // Filter out users that already have permissions
    const existingUserIds = new Set(permissions?.map((p) => p.userId) || []);
    const filteredSearchResults = searchResults?.filter(
        (u) => !existingUserIds.has(u.id)
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader className="border-b pb-3">
                    <h2 className="text-lg font-medium">Manage Permissions</h2>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search and add users */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 h-8"
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8">
                                        {ROLE_LABELS[selectedRole].label}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {(Object.keys(ROLE_LABELS) as DocumentRole[]).map(
                                        (role) => {
                                            const { label, icon: RoleIcon } = ROLE_LABELS[role];
                                            return (
                                                <DropdownMenuItem
                                                    key={role}
                                                    onClick={() => setSelectedRole(role)}
                                                >
                                                    <RoleIcon className="h-4 w-4 mr-2" />
                                                    {label}
                                                </DropdownMenuItem>
                                            );
                                        }
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Search results */}
                        {filteredSearchResults && filteredSearchResults.length > 0 && (
                            <div className="border rounded-md max-h-40 overflow-y-auto">
                                {filteredSearchResults.map((user) => (
                                    <div
                                        key={user.id}
                                        role="button"
                                        onClick={() => handleAddPermission(user)}
                                        className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer"
                                    >
                                        <Avatar className="h-6 w-6">
                                            {user.image && (
                                                <AvatarImage src={user.image} />
                                            )}
                                            <AvatarFallback className="text-xs">
                                                {(user.name || user.email)[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm truncate">
                                                {user.name || "Unnamed"}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Current permissions */}
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Current Permissions
                        </p>
                        {permissionsLoading ? (
                            <p className="text-sm text-muted-foreground py-2">
                                Loading...
                            </p>
                        ) : permissions?.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2">
                                No permissions set.
                            </p>
                        ) : (
                            <div className="space-y-1">
                                {permissions?.map((perm) => (
                                    <div
                                        key={perm.id}
                                        className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50"
                                    >
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-xs">
                                                {perm.userId[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm truncate">
                                                {perm.userId}
                                            </p>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-xs"
                                                >
                                                    {ROLE_LABELS[perm.role as DocumentRole]?.label ||
                                                        perm.role}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {(
                                                    Object.keys(ROLE_LABELS) as DocumentRole[]
                                                ).map((role) => {
                                                    const { label, icon: RoleIcon } =
                                                        ROLE_LABELS[role];
                                                    return (
                                                        <DropdownMenuItem
                                                            key={role}
                                                            onClick={() =>
                                                                handleRoleChange(perm.userId, role)
                                                            }
                                                        >
                                                            <RoleIcon className="h-4 w-4 mr-2" />
                                                            {label}
                                                        </DropdownMenuItem>
                                                    );
                                                })}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            onClick={() =>
                                                handleRemovePermission(perm.userId)
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
