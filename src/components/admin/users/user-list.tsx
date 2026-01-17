"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserRole, UserStatus } from "@prisma/client";
import { updateUserStatus, updateUserRole, deleteUser, exportUsersToCSV, UserFilters } from "@/lib/actions/admin-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    Download,
    MoreVertical,
    Shield,
    ShieldOff,
    UserCog,
    Key,
    Eye,
    Ban,
    CheckCircle,
    Clock,
    XCircle,
    Building2,
    Loader2,
    Users,
    Filter,
    X,
    Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface UserData {
    id: string;
    name: string;
    email: string;
    phoneNumber: string | null;
    role: UserRole;
    status: UserStatus;
    userType: string | null;
    profileImageUrl: string | null;
    createdAt: Date;
    approvedAt: Date | null;
    building: { id: string; name: string; buildingCode: string } | null;
    flat: { id: string; flatNumber: string; floorNumber: number | null } | null;
    _count: {
        vehicles: number;
        eventRegistrations: number;
        complaints: number;
    };
}

interface Building {
    id: string;
    name: string;
    buildingCode: string;
}

interface UserListProps {
    users: UserData[];
    buildings: Building[];
    onViewUser: (userId: string) => void;
    initialFilters?: {
        search?: string;
        role?: string;
        status?: string;
        buildingId?: string;
    };
}

export function UserList({ users, buildings, onViewUser, initialFilters }: UserListProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState(initialFilters?.search || "");
    const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">((initialFilters?.role as UserRole) || "ALL");
    const [statusFilter, setStatusFilter] = useState<UserStatus | "ALL">((initialFilters?.status as UserStatus) || "ALL");
    const [buildingFilter, setBuildingFilter] = useState<string>(initialFilters?.buildingId || "ALL");
    const [showFilters, setShowFilters] = useState(!!initialFilters?.status || !!initialFilters?.role || !!initialFilters?.buildingId);

    // Client-side filtering
    const filteredUsers = users.filter((user) => {
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            const matchesSearch =
                user.name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower) ||
                user.phoneNumber?.includes(search) ||
                user.flat?.flatNumber?.toLowerCase().includes(searchLower);
            if (!matchesSearch) return false;
        }

        // Role filter
        if (roleFilter !== "ALL" && user.role !== roleFilter) return false;

        // Status filter
        if (statusFilter !== "ALL" && user.status !== statusFilter) return false;

        // Building filter
        if (buildingFilter !== "ALL" && user.building?.id !== buildingFilter) return false;

        return true;
    });

    const handleStatusChange = async (userId: string, userName: string, newStatus: UserStatus) => {
        const action = newStatus === "SUSPENDED" ? "suspend" : newStatus === "APPROVED" ? "approve" : "update";
        if (!confirm(`Are you sure you want to ${action} ${userName}?`)) return;

        startTransition(async () => {
            const result = await updateUserStatus(userId, newStatus);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || "Failed to update status");
            }
        });
    };

    const handleRoleChange = async (userId: string, userName: string, newRole: UserRole) => {
        if (!confirm(`Are you sure you want to change ${userName}'s role to ${newRole}?`)) return;

        startTransition(async () => {
            const result = await updateUserRole(userId, newRole);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || "Failed to update role");
            }
        });
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to PERMANENTLY delete user "${userName}"? This action cannot be undone and will remove all their data.`)) {
            return;
        }

        startTransition(async () => {
            const result = await deleteUser(userId);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || "Failed to delete user");
            }
        });
    };

    const handleExport = async () => {
        startTransition(async () => {
            const filters: UserFilters = {};
            if (roleFilter !== "ALL") filters.role = roleFilter;
            if (statusFilter !== "ALL") filters.status = statusFilter;
            if (buildingFilter !== "ALL") filters.buildingId = buildingFilter;
            if (search) filters.search = search;

            const result = await exportUsersToCSV(filters);
            if (result.success && result.data) {
                const blob = new Blob([result.data], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = result.filename || "users.csv";
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                alert(result.error || "Failed to export");
            }
        });
    };

    const getStatusBadge = (status: UserStatus) => {
        switch (status) {
            case "APPROVED":
                return (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                    </Badge>
                );
            case "PENDING":
                return (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case "SUSPENDED":
                return (
                    <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                        <Ban className="h-3 w-3 mr-1" />
                        Suspended
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge variant="outline" className="bg-slate-500/10 text-slate-400 border-slate-500/30">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                    </Badge>
                );
            default:
                return null;
        }
    };

    const getRoleBadge = (role: UserRole) => {
        switch (role) {
            case "ADMIN":
                return (
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                    </Badge>
                );
            case "OWNER":
                return (
                    <Badge variant="outline" className="bg-sky-500/10 text-sky-400 border-sky-500/30">
                        Owner
                    </Badge>
                );
            case "TENANT":
                return (
                    <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/30">
                        Tenant
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="bg-slate-500/10 text-slate-400 border-slate-500/30">
                        Public
                    </Badge>
                );
        }
    };

    const clearFilters = () => {
        setSearch("");
        setRoleFilter("ALL");
        setStatusFilter("ALL");
        setBuildingFilter("ALL");
    };

    const hasActiveFilters = search || roleFilter !== "ALL" || statusFilter !== "ALL" || buildingFilter !== "ALL";

    return (
        <div className="space-y-4">
            {/* Search and Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by name, email, phone, or flat..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                    />
                </div>

                {/* Filter Toggle & Export */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "border-white/10 text-slate-300",
                            showFilters && "bg-white/10"
                        )}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                        {hasActiveFilters && (
                            <span className="ml-2 h-2 w-2 rounded-full bg-pink-500" />
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        disabled={isPending}
                        className="border-white/10 text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30"
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-wrap gap-4 items-center">
                    <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | "ALL")}>
                        <SelectTrigger className="w-40 bg-slate-900/50 border-white/10 text-white">
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10">
                            <SelectItem value="ALL" className="text-white hover:bg-white/10">All Roles</SelectItem>
                            <SelectItem value="ADMIN" className="text-purple-400 hover:bg-white/10">Admin</SelectItem>
                            <SelectItem value="OWNER" className="text-sky-400 hover:bg-white/10">Owner</SelectItem>
                            <SelectItem value="TENANT" className="text-teal-400 hover:bg-white/10">Tenant</SelectItem>
                            <SelectItem value="PUBLIC" className="text-slate-400 hover:bg-white/10">Public</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as UserStatus | "ALL")}>
                        <SelectTrigger className="w-40 bg-slate-900/50 border-white/10 text-white">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10">
                            <SelectItem value="ALL" className="text-white hover:bg-white/10">All Status</SelectItem>
                            <SelectItem value="APPROVED" className="text-emerald-400 hover:bg-white/10">Approved</SelectItem>
                            <SelectItem value="PENDING" className="text-amber-400 hover:bg-white/10">Pending</SelectItem>
                            <SelectItem value="SUSPENDED" className="text-red-400 hover:bg-white/10">Suspended</SelectItem>
                            <SelectItem value="REJECTED" className="text-slate-400 hover:bg-white/10">Rejected</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                        <SelectTrigger className="w-48 bg-slate-900/50 border-white/10 text-white">
                            <SelectValue placeholder="Building" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10">
                            <SelectItem value="ALL" className="text-white hover:bg-white/10">All Buildings</SelectItem>
                            {buildings.map((b) => (
                                <SelectItem key={b.id} value={b.id} className="text-white hover:bg-white/10">
                                    {b.name} ({b.buildingCode})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-slate-400 hover:text-white"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>
            )}

            {/* Results Count */}
            <div className="text-sm text-slate-400">
                Showing {filteredUsers.length} of {users.length} users
            </div>

            {/* Users Table */}
            <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">
                                    User
                                </th>
                                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">
                                    Contact
                                </th>
                                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">
                                    Location
                                </th>
                                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">
                                    Role
                                </th>
                                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">
                                    Status
                                </th>
                                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">
                                    Joined
                                </th>
                                <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                                        <p className="text-slate-400">No users found matching your criteria</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        {/* User Info */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-medium overflow-hidden">
                                                    {user.profileImageUrl ? (
                                                        <img
                                                            src={user.profileImageUrl}
                                                            alt={user.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        user.name.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{user.name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {user.userType || "No type"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-4 py-4">
                                            <p className="text-sm text-white">{user.email}</p>
                                            <p className="text-xs text-slate-500">
                                                {user.phoneNumber || "No phone"}
                                            </p>
                                        </td>

                                        {/* Location */}
                                        <td className="px-4 py-4">
                                            {user.building ? (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Building2 className="h-3 w-3 text-slate-500" />
                                                    <span className="text-slate-300">
                                                        {user.building.buildingCode}
                                                        {user.flat && ` - ${user.flat.flatNumber}`}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 text-sm">Not assigned</span>
                                            )}
                                        </td>

                                        {/* Role */}
                                        <td className="px-4 py-4">{getRoleBadge(user.role)}</td>

                                        {/* Status */}
                                        <td className="px-4 py-4">{getStatusBadge(user.status)}</td>

                                        {/* Joined */}
                                        <td className="px-4 py-4 text-sm text-slate-400">
                                            {format(new Date(user.createdAt), "MMM d, yyyy")}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onViewUser(user.id)}
                                                    className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>

                                                {/* More Actions Dropdown */}
                                                <div className="relative group/menu">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                    <div className="absolute right-0 top-full mt-1 w-48 py-1 rounded-lg bg-slate-900 border border-white/10 shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50">
                                                        {/* Approve (for pending users) */}
                                                        {user.status === "PENDING" && (
                                                            <button
                                                                onClick={() => handleStatusChange(user.id, user.name, "APPROVED")}
                                                                disabled={isPending}
                                                                className="w-full px-4 py-2 text-left text-sm text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                                Approve User
                                                            </button>
                                                        )}

                                                        {/* Suspend/Reactivate */}
                                                        {user.status === "APPROVED" && (
                                                            <button
                                                                onClick={() => handleStatusChange(user.id, user.name, "SUSPENDED")}
                                                                disabled={isPending}
                                                                className="w-full px-4 py-2 text-left text-sm text-amber-400 hover:bg-amber-500/10 flex items-center gap-2"
                                                            >
                                                                <Ban className="h-4 w-4" />
                                                                Suspend User
                                                            </button>
                                                        )}
                                                        {user.status === "SUSPENDED" && (
                                                            <button
                                                                onClick={() => handleStatusChange(user.id, user.name, "APPROVED")}
                                                                disabled={isPending}
                                                                className="w-full px-4 py-2 text-left text-sm text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                                Reactivate User
                                                            </button>
                                                        )}

                                                        {/* Make Admin */}
                                                        {user.role !== "ADMIN" && user.status === "APPROVED" && (
                                                            <button
                                                                onClick={() => handleRoleChange(user.id, user.name, "ADMIN")}
                                                                disabled={isPending}
                                                                className="w-full px-4 py-2 text-left text-sm text-purple-400 hover:bg-purple-500/10 flex items-center gap-2"
                                                            >
                                                                <Shield className="h-4 w-4" />
                                                                Make Admin
                                                            </button>
                                                        )}

                                                        {/* Remove Admin */}
                                                        {user.role === "ADMIN" && (
                                                            <button
                                                                onClick={() => handleRoleChange(user.id, user.name, user.userType === "OWNER" ? "OWNER" : "TENANT")}
                                                                disabled={isPending}
                                                                className="w-full px-4 py-2 text-left text-sm text-slate-400 hover:bg-white/10 flex items-center gap-2"
                                                            >
                                                                <ShieldOff className="h-4 w-4" />
                                                                Remove Admin
                                                            </button>
                                                        )}

                                                        <div className="border-t border-white/10 my-1" />

                                                        {/* View Details */}
                                                        <button
                                                            onClick={() => onViewUser(user.id)}
                                                            className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                                                        >
                                                            <UserCog className="h-4 w-4" />
                                                            View Details
                                                        </button>

                                                        {/* Delete User */}
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id, user.name)}
                                                            disabled={isPending}
                                                            className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete User
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
