"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { exportEventRegistrations, closeEventRegistration } from "@/lib/actions/admin-event";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    Users,
    Clock,
    Download,
    Search,
    User,
    Mail,
    Phone,
    Building2,
    Home,
    Calendar,
    UserPlus,
    AlertCircle,
    Loader2,
    XCircle,
    CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Registration {
    id: string;
    registeredAt: Date | string;
    registrationStatus: string;
    teamMembers: unknown; // JsonValue from Prisma
    additionalNotes: string | null;
    user: {
        id: string;
        name: string;
        email: string;
        phoneNumber: string | null;
        building: { name: string } | null;
        flat: { flatNumber: string } | null;
    };
}

interface EventInfo {
    id: string;
    title: string;
    participationType: string | null;
    maxParticipants: number | null;
    registrationRequired: boolean;
    registrationStartDate: Date | string | null;
    registrationEndDate: Date | string | null;
    startDate: Date | string;
}

interface Stats {
    totalRegistrations: number;
    totalParticipants: number;
    registrationStatus: "NOT_STARTED" | "OPEN" | "CLOSED" | "FULL" | "NOT_REQUIRED";
    timeRemaining: { days: number; hours: number } | null;
}

interface RegistrationDashboardProps {
    event: EventInfo;
    registrations: Registration[];
    stats: Stats;
}

// Helper to safely get team members array
const getTeamMembers = (teamMembers: unknown): any[] => {
    if (Array.isArray(teamMembers)) return teamMembers;
    return [];
};

export function RegistrationDashboard({
    event,
    registrations,
    stats,
}: RegistrationDashboardProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isExporting, setIsExporting] = useState(false);

    // Filter registrations based on search
    const filteredRegistrations = registrations.filter((reg) => {
        const query = searchQuery.toLowerCase();
        return (
            reg.user.name.toLowerCase().includes(query) ||
            reg.user.email.toLowerCase().includes(query) ||
            reg.user.phoneNumber?.toLowerCase().includes(query) ||
            reg.user.building?.name.toLowerCase().includes(query) ||
            reg.user.flat?.flatNumber.toLowerCase().includes(query)
        );
    });

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const result = await exportEventRegistrations(event.id);
            if (result.success && result.data) {
                // Create and download CSV
                const blob = new Blob([result.data.content], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = result.data.filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert(result.error || "Failed to export");
            }
        } catch (e) {
            alert("Export failed");
        } finally {
            setIsExporting(false);
        }
    };

    const handleCloseRegistration = () => {
        if (
            !confirm(
                "Are you sure you want to close registration? Users will no longer be able to register for this event."
            )
        ) {
            return;
        }

        startTransition(async () => {
            const result = await closeEventRegistration(event.id);
            if (result.success) {
                window.location.reload();
            } else {
                alert(result.error || "Failed to close registration");
            }
        });
    };

    const getStatusConfig = (status: Stats["registrationStatus"]) => {
        switch (status) {
            case "OPEN":
                return {
                    label: "Open",
                    icon: CheckCircle,
                    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                };
            case "CLOSED":
                return {
                    label: "Closed",
                    icon: XCircle,
                    color: "bg-red-500/10 text-red-400 border-red-500/20",
                };
            case "FULL":
                return {
                    label: "Full",
                    icon: AlertCircle,
                    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                };
            case "NOT_STARTED":
                return {
                    label: "Not Started",
                    icon: Clock,
                    color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
                };
            default:
                return {
                    label: "Not Required",
                    icon: AlertCircle,
                    color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
                };
        }
    };

    const statusConfig = getStatusConfig(stats.registrationStatus);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Link
                        href="/admin/events"
                        className="flex items-center text-slate-400 hover:text-white text-sm mb-2 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Events
                    </Link>
                    <h1 className="text-2xl font-bold text-white">{event.title}</h1>
                    <p className="text-slate-400">Registration Dashboard</p>
                </div>
                <div className="flex gap-3">
                    {stats.registrationStatus === "OPEN" && (
                        <Button
                            variant="outline"
                            onClick={handleCloseRegistration}
                            disabled={isPending}
                            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Close Registration
                        </Button>
                    )}
                    <Button
                        onClick={handleExport}
                        disabled={isExporting || registrations.length === 0}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                    >
                        {isExporting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Registrations */}
                <div className="rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-pink-300">Total Registrations</p>
                            <p className="text-3xl font-bold text-white mt-1">
                                {stats.totalRegistrations}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                            <Users className="h-6 w-6 text-pink-400" />
                        </div>
                    </div>
                </div>

                {/* Total Participants */}
                <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-300">Total Participants</p>
                            <p className="text-3xl font-bold text-white mt-1">
                                {stats.totalParticipants}
                                {event.maxParticipants && (
                                    <span className="text-lg text-slate-400 ml-1">
                                        / {event.maxParticipants}
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <UserPlus className="h-6 w-6 text-purple-400" />
                        </div>
                    </div>
                    {event.maxParticipants && (
                        <div className="mt-3">
                            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                    style={{
                                        width: `${Math.min(
                                            (stats.totalParticipants / event.maxParticipants) * 100,
                                            100
                                        )}%`,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Registration Status */}
                <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Registration Status</p>
                            <div className="mt-2">
                                <Badge
                                    variant="outline"
                                    className={cn("text-sm px-3 py-1", statusConfig.color)}
                                >
                                    <StatusIcon className="h-4 w-4 mr-1.5" />
                                    {statusConfig.label}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Time Remaining */}
                <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Time Remaining</p>
                            {stats.timeRemaining ? (
                                <p className="text-2xl font-bold text-white mt-1">
                                    {stats.timeRemaining.days}d {stats.timeRemaining.hours}h
                                </p>
                            ) : (
                                <p className="text-lg text-slate-500 mt-1">
                                    {stats.registrationStatus === "CLOSED"
                                        ? "Registration Closed"
                                        : "N/A"}
                                </p>
                            )}
                        </div>
                        <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Dates Info */}
            <div className="flex flex-wrap gap-4 text-sm">
                {event.registrationStartDate && (
                    <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="h-4 w-4" />
                        <span>
                            Opens:{" "}
                            {format(
                                new Date(event.registrationStartDate),
                                "MMM d, yyyy h:mm a"
                            )}
                        </span>
                    </div>
                )}
                {event.registrationEndDate && (
                    <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="h-4 w-4" />
                        <span>
                            Closes:{" "}
                            {format(
                                new Date(event.registrationEndDate),
                                "MMM d, yyyy h:mm a"
                            )}
                        </span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-slate-400">
                    <Users className="h-4 w-4" />
                    <span>
                        Type: {event.participationType === "TEAM" ? "Team Event" : "Individual"}
                    </span>
                </div>
            </div>

            {/* Search & List */}
            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-white/10">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search by name, email, phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-slate-900/50 border-white/10 text-white"
                        />
                    </div>
                </div>

                {/* Registrations Table */}
                {filteredRegistrations.length === 0 ? (
                    <div className="text-center py-16">
                        <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-white">
                            {searchQuery ? "No matching registrations" : "No registrations yet"}
                        </h3>
                        <p className="text-slate-400 text-sm">
                            {searchQuery
                                ? "Try a different search term"
                                : "Registrations will appear here when users sign up"}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-white/5 text-slate-400">
                                <tr>
                                    <th className="px-6 py-4 font-medium">#</th>
                                    <th className="px-6 py-4 font-medium">Registrant</th>
                                    <th className="px-6 py-4 font-medium">Contact</th>
                                    <th className="px-6 py-4 font-medium">Address</th>
                                    {event.participationType === "TEAM" && (
                                        <th className="px-6 py-4 font-medium">Team</th>
                                    )}
                                    <th className="px-6 py-4 font-medium">Registered</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredRegistrations.map((reg, index) => (
                                    <tr
                                        key={reg.id}
                                        className="hover:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => setSelectedRegistration(reg)}
                                    >
                                        <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                                    {reg.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-white">
                                                    {reg.user.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-slate-300">
                                                    <Mail className="h-3 w-3 text-slate-500" />
                                                    {reg.user.email}
                                                </div>
                                                {reg.user.phoneNumber && (
                                                    <div className="flex items-center gap-1 text-slate-400">
                                                        <Phone className="h-3 w-3 text-slate-500" />
                                                        {reg.user.phoneNumber}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {reg.user.building && (
                                                    <div className="flex items-center gap-1 text-slate-300">
                                                        <Building2 className="h-3 w-3 text-slate-500" />
                                                        {reg.user.building.name}
                                                    </div>
                                                )}
                                                {reg.user.flat && (
                                                    <div className="flex items-center gap-1 text-slate-400">
                                                        <Home className="h-3 w-3 text-slate-500" />
                                                        Flat {reg.user.flat.flatNumber}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        {event.participationType === "TEAM" && (
                                            <td className="px-6 py-4">
                                                {getTeamMembers(reg.teamMembers).length > 0 ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-purple-500/10 text-purple-300 border-purple-500/20"
                                                    >
                                                        <UserPlus className="h-3 w-3 mr-1" />
                                                        {getTeamMembers(reg.teamMembers).length} member(s)
                                                    </Badge>
                                                ) : (
                                                    <span className="text-slate-500">No team</span>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-slate-400">
                                            {format(new Date(reg.registeredAt), "MMM d, h:mm a")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    reg.registrationStatus === "REGISTERED"
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        : reg.registrationStatus === "CANCELLED"
                                                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                )}
                                            >
                                                {reg.registrationStatus}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Registration Detail Modal */}
            {selectedRegistration && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedRegistration(null)}
                >
                    <div
                        className="bg-slate-900 rounded-xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-white">Registration Details</h2>
                            <p className="text-slate-400 text-sm">
                                Registered on{" "}
                                {format(
                                    new Date(selectedRegistration.registeredAt),
                                    "MMMM d, yyyy 'at' h:mm a"
                                )}
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* User Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                                    Registrant Information
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                                        {selectedRegistration.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-white">
                                            {selectedRegistration.user.name}
                                        </p>
                                        <p className="text-slate-400">
                                            {selectedRegistration.user.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    {selectedRegistration.user.phoneNumber && (
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Phone className="h-4 w-4 text-slate-500" />
                                            {selectedRegistration.user.phoneNumber}
                                        </div>
                                    )}
                                    {selectedRegistration.user.building && (
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Building2 className="h-4 w-4 text-slate-500" />
                                            {selectedRegistration.user.building.name}
                                        </div>
                                    )}
                                    {selectedRegistration.user.flat && (
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Home className="h-4 w-4 text-slate-500" />
                                            Flat {selectedRegistration.user.flat.flatNumber}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Team Members */}
                            {event.participationType === "TEAM" &&
                                getTeamMembers(selectedRegistration.teamMembers).length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                                            Team Members ({getTeamMembers(selectedRegistration.teamMembers).length})
                                        </h3>
                                        <div className="space-y-3">
                                            {getTeamMembers(selectedRegistration.teamMembers).map(
                                                (member: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                                                    >
                                                        <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-sm">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-white font-medium">
                                                                {member.name}
                                                            </p>
                                                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                                                {member.email && (
                                                                    <span>{member.email}</span>
                                                                )}
                                                                {member.phone && (
                                                                    <span>{member.phone}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Additional Notes */}
                            {selectedRegistration.additionalNotes && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                                        Additional Notes
                                    </h3>
                                    <p className="text-slate-300 p-3 rounded-lg bg-white/5 border border-white/10">
                                        {selectedRegistration.additionalNotes}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-white/10">
                            <Button
                                onClick={() => setSelectedRegistration(null)}
                                variant="outline"
                                className="w-full border-white/10 text-slate-300"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
