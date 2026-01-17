import { Suspense } from "react";
import { getAdminUsers, getBuildingsForFilter, getUserStats } from "@/lib/actions/admin-user";
import { UserManagement } from "@/components/admin/users/user-management";
import { Loader2, Users, UserCheck, Clock, Ban, Shield, Home, Key } from "lucide-react";

export const metadata = {
    title: "User Management | Runwal Seagull Admin",
    description: "Manage users, roles, and permissions",
};

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const filters = {
        status: params.status as any,
        role: params.role as any,
        buildingId: params.buildingId as any,
        search: params.search as string,
    };

    const [usersResult, buildingsResult, statsResult] = await Promise.all([
        getAdminUsers(filters),
        getBuildingsForFilter(),
        getUserStats(),
    ]);

    const users = usersResult.success && usersResult.data ? usersResult.data : [];
    const buildings = buildingsResult.success && buildingsResult.data ? buildingsResult.data : [];
    const stats = statsResult.success && statsResult.data ? statsResult.data : null;

    // Initial filters for client component
    const initialFilters = {
        status: (params.status as any) || "ALL",
        role: (params.role as any) || "ALL",
        buildingId: (params.buildingId as any) || "ALL",
        search: (params.search as string) || "",
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">User Management</h1>
                    <p className="text-slate-400">
                        Manage users, roles, and account status
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-slate-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                        <p className="text-xs text-slate-500">Total Users</p>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <UserCheck className="h-4 w-4 text-emerald-400" />
                        </div>
                        <p className="text-2xl font-bold text-emerald-400">{stats.approvedUsers}</p>
                        <p className="text-xs text-slate-500">Approved</p>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-amber-400" />
                        </div>
                        <p className="text-2xl font-bold text-amber-400">{stats.pendingUsers}</p>
                        <p className="text-xs text-slate-500">Pending</p>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Ban className="h-4 w-4 text-red-400" />
                        </div>
                        <p className="text-2xl font-bold text-red-400">{stats.suspendedUsers}</p>
                        <p className="text-xs text-slate-500">Suspended</p>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-purple-400" />
                        </div>
                        <p className="text-2xl font-bold text-purple-400">{stats.adminCount}</p>
                        <p className="text-xs text-slate-500">Admins</p>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Home className="h-4 w-4 text-sky-400" />
                        </div>
                        <p className="text-2xl font-bold text-sky-400">{stats.ownerCount}</p>
                        <p className="text-xs text-slate-500">Owners</p>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Key className="h-4 w-4 text-teal-400" />
                        </div>
                        <p className="text-2xl font-bold text-teal-400">{stats.tenantCount}</p>
                        <p className="text-xs text-slate-500">Tenants</p>
                    </div>
                </div>
            )}

            {/* User List */}
            <Suspense
                fallback={
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
                    </div>
                }
            >
                <UserManagement
                    users={users as any}
                    buildings={buildings}
                    initialFilters={initialFilters}
                />
            </Suspense>
        </div>
    );
}
