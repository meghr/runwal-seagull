"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Event, EventType } from "@prisma/client";
import { deleteEvent, closeEventRegistration, cancelEvent } from "@/lib/actions/admin-event";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    Calendar,
    Users,
    Loader2,
    MoreVertical,
    XCircle,
    Clock,
    Download,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AdminEvent extends Event {
    creator: {
        name: string;
        email: string;
    };
    _count: {
        registrations: number;
    };
}

interface EventListProps {
    events: AdminEvent[];
}

export function EventList({ events }: EventListProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDelete = async (id: string, title: string, regCount: number) => {
        if (regCount > 0) {
            alert(
                `Cannot delete "${title}" as it has ${regCount} registration(s). Please cancel the event instead.`
            );
            return;
        }

        if (
            !confirm(
                `Are you sure you want to delete "${title}"? This action cannot be undone.`
            )
        ) {
            return;
        }

        startTransition(async () => {
            const result = await deleteEvent(id);
            if (!result.success) {
                alert(result.error || "Failed to delete event");
            }
        });
    };

    const handleCloseRegistration = async (id: string, title: string) => {
        if (
            !confirm(
                `Are you sure you want to close registration for "${title}"? Users will no longer be able to register.`
            )
        ) {
            return;
        }

        startTransition(async () => {
            const result = await closeEventRegistration(id);
            if (!result.success) {
                alert(result.error || "Failed to close registration");
            }
        });
    };

    const handleCancelEvent = async (id: string, title: string) => {
        const reason = prompt(
            `Enter reason for cancelling "${title}" (optional):`
        );
        if (reason === null) return; // User pressed cancel

        startTransition(async () => {
            const result = await cancelEvent(id, reason || undefined);
            if (result.success) {
                alert(result.message);
            } else {
                alert(result.error || "Failed to cancel event");
            }
        });
    };

    const getTypeColor = (type: EventType) => {
        switch (type) {
            case "FESTIVAL":
                return "bg-orange-500/10 text-orange-500 border-orange-500/20";
            case "SPORTS":
                return "bg-green-500/10 text-green-500 border-green-500/20";
            case "CULTURAL":
                return "bg-pink-500/10 text-pink-500 border-pink-500/20";
            case "MEETING":
                return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "SOCIAL":
                return "bg-purple-500/10 text-purple-500 border-purple-500/20";
            default:
                return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        }
    };

    const getEventStatus = (event: AdminEvent) => {
        const now = new Date();
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);

        if (end < now) return { label: "Completed", color: "text-slate-400" };
        if (start <= now && end >= now)
            return { label: "Ongoing", color: "text-emerald-400" };
        return { label: "Upcoming", color: "text-sky-400" };
    };

    const getRegistrationStatus = (event: AdminEvent) => {
        if (!event.registrationRequired) return null;

        const now = new Date();
        const regStart = event.registrationStartDate
            ? new Date(event.registrationStartDate)
            : null;
        const regEnd = event.registrationEndDate
            ? new Date(event.registrationEndDate)
            : null;

        if (regStart && now < regStart) {
            return { label: "Not Started", color: "bg-slate-500/10 text-slate-400" };
        }
        if (regEnd && now > regEnd) {
            return { label: "Closed", color: "bg-red-500/10 text-red-400" };
        }
        if (
            event.maxParticipants &&
            event._count.registrations >= event.maxParticipants
        ) {
            return { label: "Full", color: "bg-amber-500/10 text-amber-400" };
        }
        return { label: "Open", color: "bg-emerald-500/10 text-emerald-400" };
    };

    if (events.length === 0) {
        return (
            <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
                <Calendar className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-white">No events found</h3>
                <p className="text-slate-400 text-sm">
                    Create a new event to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {events.map((event) => {
                const eventStatus = getEventStatus(event);
                const regStatus = getRegistrationStatus(event);

                return (
                    <div
                        key={event.id}
                        className="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-all overflow-hidden"
                    >
                        <div className="flex flex-col lg:flex-row">
                            {/* Event Image */}
                            <div className="w-full lg:w-48 h-32 lg:h-auto bg-gradient-to-br from-pink-500/20 to-purple-500/20 relative overflow-hidden shrink-0">
                                {event.imageUrl ? (
                                    <img
                                        src={event.imageUrl}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Calendar className="h-8 w-8 text-pink-400/50" />
                                    </div>
                                )}
                                {/* Status Badge */}
                                <div className="absolute top-2 left-2">
                                    {event.published ? (
                                        <Badge
                                            variant="outline"
                                            className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs"
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            Live
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="bg-slate-500/20 text-slate-400 border-slate-500/30 text-xs"
                                        >
                                            <EyeOff className="h-3 w-3 mr-1" />
                                            Draft
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Event Details */}
                            <div className="flex-1 p-5">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        {/* Title & Type */}
                                        <div className="flex items-start gap-3 flex-wrap">
                                            <h3 className="text-lg font-semibold text-white">
                                                {event.title}
                                            </h3>
                                            <Badge
                                                variant="outline"
                                                className={cn("text-xs", getTypeColor(event.eventType))}
                                            >
                                                {event.eventType}
                                            </Badge>
                                        </div>

                                        {/* Date & Venue */}
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {format(new Date(event.startDate), "MMM d, yyyy h:mm a")}
                                            </span>
                                            {event.venue && (
                                                <span className="text-slate-500">• {event.venue}</span>
                                            )}
                                            <span className={eventStatus.color}>
                                                {eventStatus.label}
                                            </span>
                                        </div>

                                        {/* Registration Stats */}
                                        {event.registrationRequired && (
                                            <div className="flex items-center gap-4 pt-2">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-purple-400" />
                                                    <span className="text-white font-medium">
                                                        {event._count.registrations}
                                                    </span>
                                                    {event.maxParticipants && (
                                                        <span className="text-slate-500">
                                                            / {event.maxParticipants}
                                                        </span>
                                                    )}
                                                    <span className="text-slate-400 text-sm">
                                                        registrations
                                                    </span>
                                                </div>
                                                {regStatus && (
                                                    <Badge
                                                        variant="outline"
                                                        className={cn("text-xs border-0", regStatus.color)}
                                                    >
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {regStatus.label}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {event._count.registrations > 0 && (
                                            <Link href={`/admin/events/${event.id}/registrations`}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-white/10 hover:bg-purple-500/10 hover:border-purple-500/30 text-slate-300 hover:text-purple-300"
                                                >
                                                    <Users className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </Link>
                                        )}

                                        <Link href={`/admin/events/${event.id}/edit`}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-slate-400 hover:text-white hover:bg-white/10"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                        </Link>

                                        {/* More Actions Dropdown */}
                                        <div className="relative group/menu">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-slate-400 hover:text-white hover:bg-white/10"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                            <div className="absolute right-0 top-full mt-1 w-48 py-1 rounded-lg bg-slate-900 border border-white/10 shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50">
                                                {event.registrationRequired &&
                                                    regStatus?.label === "Open" && (
                                                        <button
                                                            onClick={() =>
                                                                handleCloseRegistration(event.id, event.title)
                                                            }
                                                            disabled={isPending}
                                                            className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                                                        >
                                                            <Clock className="h-4 w-4" />
                                                            Close Registration
                                                        </button>
                                                    )}
                                                {event.published && (
                                                    <button
                                                        onClick={() =>
                                                            handleCancelEvent(event.id, event.title)
                                                        }
                                                        disabled={isPending}
                                                        className="w-full px-4 py-2 text-left text-sm text-amber-400 hover:bg-amber-500/10 flex items-center gap-2"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                        Cancel Event
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            event.id,
                                                            event.title,
                                                            event._count.registrations
                                                        )
                                                    }
                                                    disabled={isPending}
                                                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                                >
                                                    {isPending ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                    Delete Event
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
