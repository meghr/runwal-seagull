"use client";

import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, CheckCircle2 } from "lucide-react";

interface EventCardForUserProps {
    event: {
        id: string;
        title: string;
        description: string | null;
        eventType: string;
        startDate: Date;
        endDate: Date;
        venue: string | null;
        registrationRequired: boolean;
        registrationStartDate: Date | null;
        registrationEndDate: Date | null;
        participationType: string | null;
        maxParticipants: number | null;
        imageUrl: string | null;
        _count: {
            registrations: number;
        };
        isUserRegistered: boolean;
        userRegistration: { id: string; registrationStatus: string } | null;
    };
    onRegisterClick?: () => void;
}

const eventTypeColors: Record<string, string> = {
    FESTIVAL: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    SPORTS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CULTURAL: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    MEETING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    SOCIAL: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    OTHER: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

function getRegistrationStatus(event: EventCardForUserProps["event"]) {
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

    if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
        return { status: "FULL", label: "Event Full", color: "bg-red-500/10 text-red-400" };
    }

    return { status: "OPEN", label: "Registration Open", color: "bg-emerald-500/10 text-emerald-400" };
}

export function EventCardForUser({ event, onRegisterClick }: EventCardForUserProps) {
    const regStatus = getRegistrationStatus(event);
    const isUpcoming = new Date(event.startDate) > new Date();
    const daysUntil = isUpcoming ? formatDistanceToNow(new Date(event.startDate), { addSuffix: true }) : null;
    const spotsRemaining = event.maxParticipants ? event.maxParticipants - event._count.registrations : null;

    return (
        <div className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all">
            {/* Image or Gradient Header */}
            <div className="h-32 relative bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                {event.imageUrl && (
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute top-3 left-3 flex gap-2">
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
                {isUpcoming && daysUntil && (
                    <div className="absolute bottom-3 right-3">
                        <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30">
                            <Clock className="h-3 w-3 mr-1" />
                            {daysUntil}
                        </Badge>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-lg font-semibold text-white group-hover:text-sky-400 transition-colors mb-3 line-clamp-2">
                    {event.title}
                </h3>

                {event.description && (
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                        {event.description}
                    </p>
                )}

                {/* Details */}
                <div className="space-y-2 text-sm text-slate-400 mb-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-sky-400" />
                        <span>{format(new Date(event.startDate), "EEE, MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                    {event.venue && (
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-pink-400" />
                            <span className="truncate">{event.venue}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-400" />
                        <span>
                            {event._count.registrations} registered
                            {spotsRemaining !== null && ` • ${spotsRemaining} spots left`}
                        </span>
                    </div>
                </div>

                {/* Registration Status Badge */}
                {event.registrationRequired && (
                    <div className="mb-4">
                        <Badge variant="outline" className={regStatus.color}>
                            {regStatus.label}
                        </Badge>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <Link href={`/dashboard/events/${event.id}`} className="flex-1">
                        <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/10">
                            View Details
                        </Button>
                    </Link>
                    {isUpcoming && event.registrationRequired && regStatus.status === "OPEN" && !event.isUserRegistered && (
                        <Button
                            className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
                            onClick={onRegisterClick}
                        >
                            Register Now
                        </Button>
                    )}
                    {event.isUserRegistered && isUpcoming && (
                        <Button
                            variant="outline"
                            className="flex-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            disabled
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Registered
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
