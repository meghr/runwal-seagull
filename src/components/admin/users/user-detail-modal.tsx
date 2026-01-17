"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserRole, UserStatus } from "@prisma/client";
import {
    getAdminUserById,
    updateUserStatus,
    updateUserRole,
    resetUserPassword,
    getUserActivityLogs,
} from "@/lib/actions/admin-user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    X,
    Shield,
    ShieldOff,
    Key,
    Ban,
    CheckCircle,
    Clock,
    XCircle,
    Building2,
    Loader2,
    User,
    Mail,
    Phone,
    Calendar,
    Car,
    CalendarCheck,
    AlertTriangle,
    Copy,
    Check,
    Activity,
    Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface UserDetailModalProps {
    userId: string | null;
    onClose: () => void;
}

export function UserDetailModal({ userId, onClose }: UserDetailModalProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [user, setUser] = useState<any>(null);
    const [activityLogs, setActivityLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"details" | "activity">("details");
    const [tempPassword, setTempPassword] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (userId) {
            loadUser();
        }
    }, [userId]);

    const loadUser = async () => {
        if (!userId) return;
        setLoading(true);
        const result = await getAdminUserById(userId);
        if (result.success && result.data) {
            setUser(result.data);
        }
        setLoading(false);
    };

    const loadActivityLogs = async () => {
        if (!userId) return;
        const result = await getUserActivityLogs(userId);
        if (result.success && result.data) {
            setActivityLogs(result.data);
        }
    };

    useEffect(() => {
        if (activeTab === "activity" && userId && activityLogs.length === 0) {
            loadActivityLogs();
        }
    }, [activeTab, userId]);

    const handleStatusChange = async (newStatus: UserStatus) => {
        if (!user) return;
        const action = newStatus === "SUSPENDED" ? "suspend" : newStatus === "APPROVED" ? "approve" : "update";
        if (!confirm(`Are you sure you want to ${action} ${user.name}?`)) return;

        startTransition(async () => {
            const result = await updateUserStatus(userId!, newStatus);
            if (result.success) {
                loadUser();
                router.refresh();
            } else {
                alert(result.error || "Failed to update status");
            }
        });
    };

    const handleRoleChange = async (newRole: UserRole) => {
        if (!user) return;
        if (!confirm(`Are you sure you want to change ${user.name}'s role to ${newRole}?`)) return;

        startTransition(async () => {
            const result = await updateUserRole(userId!, newRole);
            if (result.success) {
                loadUser();
                router.refresh();
            } else {
                alert(result.error || "Failed to update role");
            }
        });
    };

    const handlePasswordReset = async () => {
        if (!user) return;
        if (!confirm(`Are you sure you want to reset password for ${user.name}? They will receive a temporary password.`)) return;

        startTransition(async () => {
            const result = await resetUserPassword(userId!);
            if (result.success && result.tempPassword) {
                setTempPassword(result.tempPassword);
            } else {
                alert(result.error || "Failed to reset password");
            }
        });
    };

    const copyPassword = () => {
        if (tempPassword) {
            navigator.clipboard.writeText(tempPassword);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!userId) return null;

    const getStatusBadge = (status: UserStatus) => {
        switch (status) {
            case "APPROVED":
                return (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                    </Badge>
                );
            case "PENDING":
                return (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case "SUSPENDED":
                return (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        <Ban className="h-3 w-3 mr-1" />
                        Suspended
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
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
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                    </Badge>
                );
            case "OWNER":
                return (
                    <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30">
                        Owner
                    </Badge>
                );
            case "TENANT":
                return (
                    <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">
                        Tenant
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                        Public
                    </Badge>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-900 border border-white/10 shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white">User Details</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-slate-400 hover:text-white hover:bg-white/10"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => setActiveTab("details")}
                        className={cn(
                            "px-6 py-3 text-sm font-medium transition-colors",
                            activeTab === "details"
                                ? "text-pink-400 border-b-2 border-pink-400"
                                : "text-slate-400 hover:text-white"
                        )}
                    >
                        <User className="h-4 w-4 inline mr-2" />
                        Details
                    </button>
                    <button
                        onClick={() => setActiveTab("activity")}
                        className={cn(
                            "px-6 py-3 text-sm font-medium transition-colors",
                            activeTab === "activity"
                                ? "text-pink-400 border-b-2 border-pink-400"
                                : "text-slate-400 hover:text-white"
                        )}
                    >
                        <Activity className="h-4 w-4 inline mr-2" />
                        Activity
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
                        </div>
                    ) : !user ? (
                        <div className="text-center py-20 text-slate-400">
                            User not found
                        </div>
                    ) : activeTab === "details" ? (
                        <div className="space-y-6">
                            {/* Profile Header */}
                            <div className="flex items-start gap-4">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shrink-0">
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
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-2xl font-bold text-white truncate">
                                        {user.name}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {getRoleBadge(user.role)}
                                        {getStatusBadge(user.status)}
                                    </div>
                                </div>
                            </div>

                            {/* Temp Password Alert */}
                            {tempPassword && (
                                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="flex items-start gap-3">
                                        <Key className="h-5 w-5 text-emerald-400 shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-emerald-400">
                                                Password Reset Successful
                                            </p>
                                            <p className="text-sm text-emerald-300 mt-1">
                                                Temporary password:{" "}
                                                <code className="bg-emerald-500/20 px-2 py-0.5 rounded">
                                                    {tempPassword}
                                                </code>
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={copyPassword}
                                                className="mt-2 text-emerald-400 hover:bg-emerald-500/20"
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-4 w-4 mr-1" />
                                                        Copy Password
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Email</p>
                                        <p className="text-white">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                                    <Phone className="h-5 w-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Phone</p>
                                        <p className="text-white">{user.phoneNumber || "Not provided"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Location Info */}
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2 mb-3">
                                    <Building2 className="h-5 w-5 text-slate-400" />
                                    <span className="text-sm font-medium text-white">Location</span>
                                </div>
                                {user.building ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-500">Building</p>
                                            <p className="text-white">{user.building.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Code</p>
                                            <p className="text-white">{user.building.buildingCode}</p>
                                        </div>
                                        {user.flat && (
                                            <>
                                                <div>
                                                    <p className="text-slate-500">Flat</p>
                                                    <p className="text-white">{user.flat.flatNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500">Floor</p>
                                                    <p className="text-white">{user.flat.floorNumber || "N/A"}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-slate-500">No location assigned</p>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                                    <Car className="h-5 w-5 text-sky-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{user._count.vehicles}</p>
                                    <p className="text-xs text-slate-500">Vehicles</p>
                                </div>
                                <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                                    <CalendarCheck className="h-5 w-5 text-purple-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{user._count.eventRegistrations}</p>
                                    <p className="text-xs text-slate-500">Events</p>
                                </div>
                                <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                                    <AlertTriangle className="h-5 w-5 text-amber-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{user._count.complaints}</p>
                                    <p className="text-xs text-slate-500">Complaints</p>
                                </div>
                                <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                                    <Home className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{user._count.marketplaceAds || 0}</p>
                                    <p className="text-xs text-slate-500">Ads</p>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Calendar className="h-4 w-4" />
                                    Joined: {format(new Date(user.createdAt), "MMM d, yyyy")}
                                </div>
                                {user.approvedAt && (
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <CheckCircle className="h-4 w-4" />
                                        Approved: {format(new Date(user.approvedAt), "MMM d, yyyy")}
                                    </div>
                                )}
                                {user.approver && (
                                    <div className="text-slate-500">
                                        by {user.approver.name}
                                    </div>
                                )}
                            </div>

                            {/* Vehicles List */}
                            {user.vehicles && user.vehicles.length > 0 && (
                                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                    <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                                        <Car className="h-4 w-4" />
                                        Registered Vehicles
                                    </h4>
                                    <div className="space-y-2">
                                        {user.vehicles.map((v: any) => (
                                            <div
                                                key={v.id}
                                                className="flex items-center justify-between text-sm p-2 rounded bg-slate-800/50"
                                            >
                                                <span className="text-white font-medium">{v.vehicleNumber}</span>
                                                <span className="text-slate-400">
                                                    {v.vehicleType} {v.brand && `• ${v.brand}`} {v.model && v.model}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Activity Tab */
                        <div className="space-y-4">
                            {activityLogs.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <Activity className="h-10 w-10 mx-auto mb-3 text-slate-600" />
                                    <p>No activity logs found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activityLogs.map((log) => (
                                        <div
                                            key={log.id}
                                            className="p-3 rounded-lg bg-white/5 border border-white/10"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-white font-medium">{log.action}</p>
                                                    {log.details && (
                                                        <p className="text-sm text-slate-400 mt-1">
                                                            {typeof log.details === "object"
                                                                ? JSON.stringify(log.details)
                                                                : log.details}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-500">
                                                    {format(new Date(log.createdAt), "MMM d, h:mm a")}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {user && activeTab === "details" && (
                    <div className="px-6 py-4 border-t border-white/10 flex flex-wrap gap-2 justify-end">
                        {/* Password Reset */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePasswordReset}
                            disabled={isPending}
                            className="border-white/10 text-slate-300 hover:bg-amber-500/10 hover:text-amber-400"
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                                <Key className="h-4 w-4 mr-1" />
                            )}
                            Reset Password
                        </Button>

                        {/* Status Actions */}
                        {user.status === "PENDING" && (
                            <Button
                                size="sm"
                                onClick={() => handleStatusChange("APPROVED")}
                                disabled={isPending}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                            </Button>
                        )}
                        {user.status === "APPROVED" && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange("SUSPENDED")}
                                disabled={isPending}
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                                <Ban className="h-4 w-4 mr-1" />
                                Suspend
                            </Button>
                        )}
                        {user.status === "SUSPENDED" && (
                            <Button
                                size="sm"
                                onClick={() => handleStatusChange("APPROVED")}
                                disabled={isPending}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Reactivate
                            </Button>
                        )}

                        {/* Role Actions */}
                        {user.role !== "ADMIN" && user.status === "APPROVED" && (
                            <Button
                                size="sm"
                                onClick={() => handleRoleChange("ADMIN")}
                                disabled={isPending}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                            >
                                <Shield className="h-4 w-4 mr-1" />
                                Make Admin
                            </Button>
                        )}
                        {user.role === "ADMIN" && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRoleChange(user.userType === "OWNER" ? "OWNER" : "TENANT")}
                                disabled={isPending}
                                className="border-white/10 text-slate-300"
                            >
                                <ShieldOff className="h-4 w-4 mr-1" />
                                Remove Admin
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
