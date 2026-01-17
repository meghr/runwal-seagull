"use client";

import { X, Calendar, MapPin, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateTime } from "@/lib/utils/index";
import { useRouter } from "next/navigation";

interface EventModalProps {
    event: {
        id: string;
        title: string;
        description: string | null;
        eventType: string;
        startDate: Date;
        endDate: Date | null;
        venue: string | null;
        registrationRequired: boolean;
        registrationStartDate: Date | null;
        registrationEndDate: Date | null;
        maxParticipants: number | null;
        _count?: { registrations: number };
    } | null;
    status: string;
    onClose: () => void;
}

const eventTypeColors: Record<string, string> = {
    SPORTS: "bg-green-500/10 text-green-400 border-green-500/20",
    CULTURAL: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    MEETING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    OTHER: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const statusColors: Record<string, string> = {
    OPEN: "bg-green-500/10 text-green-400",
    CLOSED: "bg-red-500/10 text-red-400",
    FULL: "bg-orange-500/10 text-orange-400",
    NOT_STARTED: "bg-blue-500/10 text-blue-400",
    NO_REGISTRATION: "bg-slate-500/10 text-slate-400",
};

const statusLabels: Record<string, string> = {
    OPEN: "Registration Open",
    CLOSED: "Registration Closed",
    FULL: "Fully Booked",
    NOT_STARTED: "Registration Not Started",
    NO_REGISTRATION: "No Registration Required",
};

export function EventModal({ event, status, onClose }: EventModalProps) {
    const router = useRouter();

    if (!event) return null;

    const badgeClass = eventTypeColors[event.eventType] || eventTypeColors.OTHER;
    const statusClass = statusColors[status] || statusColors.NO_REGISTRATION;

    // Calculate countdown
    const now = new Date();
    const eventDate = new Date(event.startDate);
    const diff = eventDate.getTime() - now.getTime();
    const daysUntil = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const hoursUntil = Math.ceil(diff / (1000 * 60 * 60));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/10 bg-slate-900 p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Badge className={`${badgeClass} border text-xs`}>
                                {event.eventType}
                            </Badge>
                            <Badge className={`${statusClass} text-xs`}>
                                {statusLabels[status]}
                            </Badge>
                        </div>

                        <h2 className="text-3xl font-bold text-white pr-8">
                            {event.title}
                        </h2>

                        {daysUntil > 0 && daysUntil <= 7 && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
                                <Clock className="h-4 w-4 text-sky-400" />
                                <span className="text-sky-400 font-semibold">
                                    {daysUntil === 1 ? `Starts in ${hoursUntil} hours` : `Starts in ${daysUntil} days`}
                                </span>
                            </div>
                        )}
                    </div>

                    {event.description && (
                        <div className="prose prose-invert max-w-none">
                            <p className="text-slate-300 leading-relaxed">
                                {event.description}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-purple-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-slate-500">Event Date</p>
                                    <p className="text-white font-medium">{formatDateTime(event.startDate)}</p>
                                    {event.endDate && (
                                        <p className="text-sm text-slate-400">to {formatDateTime(event.endDate)}</p>
                                    )}
                                </div>
                            </div>

                            {event.venue && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-pink-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500">Venue</p>
                                        <p className="text-white font-medium">{event.venue}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {event.registrationRequired && (
                            <div className="space-y-3">
                                {event.registrationStartDate && (
                                    <div className="flex items-start gap-3">
                                        <Clock className="h-5 w-5 text-sky-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-slate-500">Registration Period</p>
                                            <p className="text-white text-sm">{formatDate(event.registrationStartDate)}</p>
                                            {event.registrationEndDate && (
                                                <p className="text-sm text-slate-400">to {formatDate(event.registrationEndDate)}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {event.maxParticipants && (
                                    <div className="flex items-start gap-3">
                                        <Users className="h-5 w-5 text-green-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-slate-500">Participants</p>
                                            <p className="text-white font-medium">
                                                {event._count?.registrations || 0} / {event.maxParticipants}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {event.maxParticipants - (event._count?.registrations || 0)} spots remaining
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        {status === "OPEN" ? (
                            <Button
                                onClick={() => router.push('/login')}
                                className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white"
                            >
                                Login to Register
                            </Button>
                        ) : (
                            <div className="flex-1 p-3 rounded-lg bg-slate-800/50 text-center">
                                <p className="text-sm text-slate-400">
                                    {status === "CLOSED" && "Registration has closed"}
                                    {status === "FULL" && "Event is fully booked"}
                                    {status === "NOT_STARTED" && "Registration opens soon"}
                                    {status === "NO_REGISTRATION" && "No registration required - just show up!"}
                                </p>
                            </div>
                        )}
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="border-white/10 text-white hover:bg-white/5"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
