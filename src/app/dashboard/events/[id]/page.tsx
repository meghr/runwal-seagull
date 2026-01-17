"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventRegistrationModal } from "@/components/dashboard/event-registration-modal";
import { getEventForRegistration, cancelEventRegistration } from "@/lib/actions/event";
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Users,
    User,
    CheckCircle2,
    XCircle,
    Loader2,
    AlertCircle,
} from "lucide-react";

const eventTypeColors: Record<string, string> = {
    FESTIVAL: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    SPORTS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CULTURAL: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    MEETING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    SOCIAL: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    OTHER: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

function getRegistrationStatus(event: any) {
    const now = new Date();

    if (!event.registrationRequired) {
        return { status: "NO_REGISTRATION", label: "Open Event", color: "bg-slate-500/10 text-slate-400" };
    }

    const regStart = event.registrationStartDate ? new Date(event.registrationStartDate) : null;
    const regEnd = event.registrationEndDate ? new Date(event.registrationEndDate) : null;

    if (regStart && now < regStart) {
        return { status: "NOT_STARTED", label: "Registration Opens Soon", color: "bg-amber-500/10 text-amber-400" };
    }

    if (regEnd && now > regEnd) {
        return { status: "CLOSED", label: "Registration Closed", color: "bg-red-500/10 text-red-400" };
    }

    if (event.maxParticipants && event._count?.registrations >= event.maxParticipants) {
        return { status: "FULL", label: "Event Full", color: "bg-red-500/10 text-red-400" };
    }

    return { status: "OPEN", label: "Registration Open", color: "bg-emerald-500/10 text-emerald-400" };
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const router = useRouter();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchEvent = async () => {
        setLoading(true);
        const result = await getEventForRegistration(id);
        if (result.success && result.data) {
            setEvent(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const handleCancelRegistration = async () => {
        if (!event?.userRegistration?.id) return;

        setCancelling(true);
        const result = await cancelEventRegistration(event.userRegistration.id);
        if (result.success) {
            fetchEvent(); // Refresh event data
        }
        setCancelling(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
                <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
                <p className="text-slate-400 mb-4">The event you're looking for doesn't exist.</p>
                <Link href="/dashboard/events">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Events
                    </Button>
                </Link>
            </div>
        );
    }

    const regStatus = getRegistrationStatus(event);
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const isUpcoming = startDate > now;
    const isPast = endDate < now;
    const isOngoing = now >= startDate && now <= endDate;

    const daysUntil = isUpcoming ? formatDistanceToNow(startDate, { addSuffix: true }) : null;
    const spotsRemaining = event.maxParticipants ? event.maxParticipants - event._count.registrations : null;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16">
                        <Link
                            href="/dashboard/events"
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="text-sm">Back to Events</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <article className="space-y-6">
                    {/* Event Header */}
                    <div className="space-y-4">
                        {/* Image */}
                        {event.imageUrl && (
                            <div className="h-64 rounded-xl overflow-hidden">
                                <img
                                    src={event.imageUrl}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Title and Badges */}
                        <div className="flex flex-wrap items-start gap-3">
                            <h1 className="text-3xl md:text-4xl font-bold text-white flex-1">
                                {event.title}
                            </h1>
                            <div className="flex gap-2">
                                <Badge
                                    variant="outline"
                                    className={eventTypeColors[event.eventType] || eventTypeColors.OTHER}
                                >
                                    {event.eventType}
                                </Badge>
                                {event.isUserRegistered && (
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Registered
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Event Status Badges */}
                        <div className="flex flex-wrap gap-2">
                            {event.registrationRequired && (
                                <Badge variant="outline" className={`${regStatus.color} text-sm py-1 px-3`}>
                                    {regStatus.label}
                                </Badge>
                            )}
                            {isOngoing && (
                                <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 text-sm py-1 px-3">
                                    Ongoing
                                </Badge>
                            )}
                        </div>

                        {/* Countdown */}
                        {isUpcoming && daysUntil && (
                            <div className="inline-flex items-center gap-2 text-sky-400">
                                <Clock className="h-5 w-5" />
                                <span className="font-medium">Starts {daysUntil}</span>
                            </div>
                        )}
                    </div>

                    {/* Event Details Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-sky-500/10">
                                    <Calendar className="h-5 w-5 text-sky-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Date & Time</p>
                                    <p className="text-white font-medium">
                                        {format(startDate, "EEE, MMM d, yyyy")}
                                        {format(startDate, "yyyyMMdd") !== format(endDate, "yyyyMMdd") && (
                                            <> - {format(endDate, "EEE, MMM d, yyyy")}</>
                                        )}
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {event.venue && (
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-pink-500/10">
                                        <MapPin className="h-5 w-5 text-pink-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Venue</p>
                                        <p className="text-white font-medium">{event.venue}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/10">
                                    <Users className="h-5 w-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Participants</p>
                                    <p className="text-white font-medium">
                                        {event._count.registrations} registered
                                        {spotsRemaining !== null && (
                                            <span className="text-slate-400"> • {spotsRemaining} spots left</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {event.participationType && (
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-indigo-500/10">
                                        <User className="h-5 w-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Participation Type</p>
                                        <p className="text-white font-medium">
                                            {event.participationType === "TEAM" ? "Team Event" : "Individual Event"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Registration Period */}
                    {event.registrationRequired && (event.registrationStartDate || event.registrationEndDate) && (
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-3">Registration Period</h3>
                            <div className="flex flex-wrap gap-4 text-sm">
                                {event.registrationStartDate && (
                                    <div>
                                        <span className="text-slate-400">Opens: </span>
                                        <span className="text-white">
                                            {format(new Date(event.registrationStartDate), "MMM d, yyyy 'at' h:mm a")}
                                        </span>
                                    </div>
                                )}
                                {event.registrationEndDate && (
                                    <div>
                                        <span className="text-slate-400">Closes: </span>
                                        <span className="text-white">
                                            {format(new Date(event.registrationEndDate), "MMM d, yyyy 'at' h:mm a")}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {event.description && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-white">About This Event</h3>
                            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {event.description}
                            </div>
                        </div>
                    )}

                    {/* Organizer Info */}
                    {event.creator && (
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-sm text-slate-400">Organized by</p>
                            <p className="text-white font-medium">{event.creator.name}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-white/10">
                        {!isPast && event.registrationRequired && regStatus.status === "OPEN" && !event.isUserRegistered && (
                            <Button
                                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-6 text-lg"
                                onClick={() => setIsModalOpen(true)}
                            >
                                Register for This Event
                            </Button>
                        )}

                        {event.isUserRegistered && !isPast && (
                            <>
                                <div className="flex-1 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                                    <p className="text-emerald-400 font-medium">You're registered!</p>
                                    <p className="text-sm text-slate-400 mt-1">See you at the event</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                    onClick={handleCancelRegistration}
                                    disabled={cancelling}
                                >
                                    {cancelling ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Cancel
                                        </>
                                    )}
                                </Button>
                            </>
                        )}

                        {isPast && (
                            <div className="flex-1 p-4 rounded-lg bg-slate-500/10 border border-slate-500/20 text-center">
                                <p className="text-slate-400">This event has already ended</p>
                            </div>
                        )}
                    </div>
                </article>
            </main>

            {/* Registration Modal */}
            <EventRegistrationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                event={event}
                onSuccess={() => fetchEvent()}
            />
        </div>
    );
}
