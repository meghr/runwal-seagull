"use client";

import Link from "next/link";
import { Calendar, ArrowRight, MapPin, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface EventRegistration {
    id: string;
    event: {
        id: string;
        title: string;
        startDate: Date;
        endDate: Date;
        venue: string | null;
        eventType: string;
    };
}

interface MyRegistrationsWidgetProps {
    registrations: EventRegistration[];
}

const eventTypeColors: Record<string, string> = {
    SPORTS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CULTURAL: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    MEETING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    OTHER: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export function MyRegistrationsWidget({ registrations }: MyRegistrationsWidgetProps) {
    if (registrations.length === 0) {
        return (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-emerald-400" />
                        My Event Registrations
                    </h2>
                </div>
                <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 mb-2">No upcoming events</p>
                    <Link
                        href="/dashboard/events"
                        className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
                    >
                        Browse Events
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-400" />
                    My Event Registrations
                </h2>
                <Link
                    href="/dashboard/events/my-registrations"
                    className="text-sm text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
                >
                    View All
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {/* Registrations List */}
            <div className="space-y-3">
                {registrations.map((registration) => {
                    const daysUntil = formatDistanceToNow(new Date(registration.event.startDate), {
                        addSuffix: true
                    });

                    return (
                        <Link
                            key={registration.id}
                            href={`/dashboard/events/${registration.event.id}`}
                            className="block group"
                        >
                            <div className="p-4 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-white group-hover:text-emerald-400 transition-colors mb-1">
                                            {registration.event.title}
                                        </h3>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={`shrink-0 ${eventTypeColors[registration.event.eventType] || eventTypeColors.OTHER}`}
                                    >
                                        {registration.event.eventType}
                                    </Badge>
                                </div>

                                <div className="space-y-2 text-sm text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-emerald-400" />
                                        <span className="text-emerald-400 font-medium">
                                            {daysUntil}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {format(new Date(registration.event.startDate), "MMM d, yyyy 'at' h:mm a")}
                                        </span>
                                    </div>

                                    {registration.event.venue && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            <span className="truncate">{registration.event.venue}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
