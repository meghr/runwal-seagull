"use client";

import {
    Building2,
    Bell,
    Calendar,
    CheckCircle2,
    Home
} from "lucide-react";

interface DashboardStatsProps {
    building: string | null;
    flatNumber: string | null;
    newNoticesCount: number;
    upcomingEventsCount: number;
    myRegistrationsCount: number;
    userType: string;
}

export function DashboardStats({
    building,
    flatNumber,
    newNoticesCount,
    upcomingEventsCount,
    myRegistrationsCount,
    userType,
}: DashboardStatsProps) {
    const stats = [
        {
            label: "My Unit",
            value: building && flatNumber ? `${building} - ${flatNumber}` : "Not Assigned",
            subValue: userType,
            icon: Home,
            color: "from-sky-500 to-blue-500",
            bgColor: "bg-sky-500/10",
        },
        {
            label: "New Notices",
            value: newNoticesCount,
            subValue: "Last 7 days",
            icon: Bell,
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-500/10",
        },
        {
            label: "Upcoming Events",
            value: upcomingEventsCount,
            subValue: "Available to join",
            icon: Calendar,
            color: "from-indigo-500 to-purple-500",
            bgColor: "bg-indigo-500/10",
        },
        {
            label: "My Registrations",
            value: myRegistrationsCount,
            subValue: "Upcoming events",
            icon: CheckCircle2,
            color: "from-emerald-500 to-teal-500",
            bgColor: "bg-emerald-500/10",
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all hover:bg-white/10 hover:border-white/20"
                >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                    <div className="relative z-10">
                        {/* Icon */}
                        <div className={`inline-flex rounded-lg ${stat.bgColor} p-3 mb-4`}>
                            <stat.icon className={`h-6 w-6 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                        </div>

                        {/* Label */}
                        <h3 className="text-sm font-medium text-slate-400 mb-2">
                            {stat.label}
                        </h3>

                        {/* Value */}
                        <div className="text-2xl font-bold text-white mb-1">
                            {stat.value}
                        </div>

                        {/* Sub value */}
                        <p className="text-xs text-slate-500">
                            {stat.subValue}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
