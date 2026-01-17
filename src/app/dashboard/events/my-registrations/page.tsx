"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/dashboard/pagination";
import { getMyEventRegistrations, cancelEventRegistration } from "@/lib/actions/event";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Clock,
    Users,
    CheckCircle2,
    XCircle,
    Loader2,
    CalendarX,
} from "lucide-react";

const eventTypeColors: Record<string, string> = {
    FESTIVAL: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    SPORTS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CULTURAL: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    MEETING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    SOCIAL: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    OTHER: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const filterOptions = [
    { value: "UPCOMING", label: "Upcoming" },
    { value: "PAST", label: "Past" },
    { value: "ALL", label: "All" },
];

export default function MyRegistrationsPage() {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"ALL" | "UPCOMING" | "PAST">("UPCOMING");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const fetchRegistrations = async () => {
        setLoading(true);
        const result = await getMyEventRegistrations({ filter, page, limit: 10 });
        if (result.success && result.data) {
            setRegistrations(result.data.registrations);
            setPagination(result.data.pagination);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRegistrations();
    }, [filter, page]);

    const handleCancel = async (registrationId: string) => {
        setCancellingId(registrationId);
        const result = await cancelEventRegistration(registrationId);
        if (result.success) {
            fetchRegistrations();
        }
        setCancellingId(null);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/events"
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span className="text-sm">Back to Events</span>
                            </Link>
                            <div className="h-6 w-px bg-white/10" />
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-sky-400">
                                    My Registrations
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {filterOptions.map((opt) => (
                        <Button
                            key={opt.value}
                            variant={filter === opt.value ? "default" : "outline"}
                            onClick={() => {
                                setFilter(opt.value as typeof filter);
                                setPage(1);
                            }}
                            className={
                                filter === opt.value
                                    ? "bg-sky-500 hover:bg-sky-600 text-white"
                                    : "border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                            }
                        >
                            {opt.label}
                        </Button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                    </div>
                )}

                {/* Results Count */}
                {!loading && (
                    <div className="text-sm text-slate-400 mb-4">
                        {pagination.total} {pagination.total === 1 ? "registration" : "registrations"}
                    </div>
                )}

                {/* Registrations List */}
                {!loading && registrations.length > 0 && (
                    <div className="space-y-4">
                        {registrations.map((reg) => {
                            const isUpcoming = new Date(reg.event.startDate) > new Date();
                            const daysUntil = isUpcoming
                                ? formatDistanceToNow(new Date(reg.event.startDate), { addSuffix: true })
                                : null;

                            return (
                                <div
                                    key={reg.id}
                                    className="p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                        {/* Event Image or Color Block */}
                                        <div className="w-full sm:w-24 h-20 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shrink-0 overflow-hidden">
                                            {reg.event.imageUrl && (
                                                <img
                                                    src={reg.event.imageUrl}
                                                    alt={reg.event.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <Link
                                                    href={`/dashboard/events/${reg.event.id}`}
                                                    className="text-lg font-semibold text-white hover:text-sky-400 transition-colors line-clamp-1"
                                                >
                                                    {reg.event.title}
                                                </Link>
                                                <Badge
                                                    variant="outline"
                                                    className={eventTypeColors[reg.event.eventType] || eventTypeColors.OTHER}
                                                >
                                                    {reg.event.eventType}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-3">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="h-4 w-4" />
                                                    {format(new Date(reg.event.startDate), "EEE, MMM d, yyyy")}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="h-4 w-4" />
                                                    {format(new Date(reg.event.startDate), "h:mm a")}
                                                </span>
                                                {reg.event.venue && (
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin className="h-4 w-4" />
                                                        {reg.event.venue}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {isUpcoming ? (
                                                        <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {daysUntil}
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20">
                                                            Event Ended
                                                        </Badge>
                                                    )}
                                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                                        {reg.registrationStatus}
                                                    </Badge>
                                                </div>

                                                {/* Cancel Button */}
                                                {isUpcoming && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCancel(reg.id)}
                                                        disabled={cancellingId === reg.id}
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                    >
                                                        {cancellingId === reg.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <XCircle className="h-4 w-4 mr-1" />
                                                                Cancel
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Team Members */}
                                            {reg.teamMembers && Array.isArray(reg.teamMembers) && reg.teamMembers.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-white/10">
                                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                                        <Users className="h-4 w-4" />
                                                        <span>Team: {reg.teamMembers.map((m: any) => m.name).join(", ")}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {!loading && registrations.length === 0 && (
                    <div className="text-center py-20">
                        <CalendarX className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                            No registrations found
                        </h3>
                        <p className="text-slate-400 mb-6">
                            {filter === "UPCOMING"
                                ? "You haven't registered for any upcoming events yet."
                                : filter === "PAST"
                                    ? "No past event registrations to show."
                                    : "You haven't registered for any events yet."}
                        </p>
                        <Link href="/dashboard/events">
                            <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                                Browse Events
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Pagination */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
