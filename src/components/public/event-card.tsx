"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils/index";
import { useRouter } from "next/navigation";

interface EventCardProps {
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
    };
    status: string;
    onClick: (id: string) => void;
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
    NOT_STARTED: "Coming Soon",
    NO_REGISTRATION: "No Registration Required",
};

export function EventCard({ event, status, onClick }: EventCardProps) {
    const router = useRouter();
    const badgeClass = eventTypeColors[event.eventType] || eventTypeColors.OTHER;
    const statusClass = statusColors[status] || statusColors.NO_REGISTRATION;

    // Calculate days until event
    const daysUntil = Math.ceil((new Date(event.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div
            onClick={() => onClick(event.id)}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all hover:bg-white/10 hover:border-white/20 cursor-pointer"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white line-clamp-2 flex-1">
                        {event.title}
                    </h3>
                    <Badge className={`${badgeClass} border text-xs shrink-0`}>
                        {event.eventType}
                    </Badge>
                </div>

                {event.description && (
                    <p className="text-slate-400 text-sm line-clamp-2">
                        {event.description}
                    </p>
                )}

                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                        <Calendar className="h-4 w-4 text-sky-400" />
                        <span>{formatDate(event.startDate)}</span>
                        {daysUntil <= 7 && daysUntil > 0 && (
                            <Badge variant="outline" className="text-xs border-sky-500/50 text-sky-400">
                                In {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                            </Badge>
                        )}
                    </div>

                    {event.venue && (
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{event.venue}</span>
                        </div>
                    )}

                    {event.registrationRequired && event.maxParticipants && (
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <Users className="h-3.5 w-3.5" />
                            <span>
                                {event._count?.registrations || 0} / {event.maxParticipants} registered
                            </span>
                        </div>
                    )}
                </div>

                <div className="pt-2 flex items-center justify-between">
                    <Badge className={`${statusClass} text-xs`}>
                        {statusLabels[status]}
                    </Badge>

                    {status === "OPEN" ? (
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push('/login');
                            }}
                            className="bg-sky-500 hover:bg-sky-600 text-white text-xs"
                        >
                            Login to Register
                        </Button>
                    ) : (
                        <span className="text-sky-400 text-sm font-medium group-hover:underline">
                            View Details →
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
