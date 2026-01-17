"use client";

import {
    Users,
    UserCheck,
    Bell,
    Calendar,
    ShoppingBag,
    AlertTriangle
} from "lucide-react";

interface AdminStats {
    totalUsers: number;
    pendingApprovals: number;
    activeAds: number;
    totalNotices: number;
    totalEvents: number;
    openComplaints: number;
}

interface AdminStatsCardsProps {
    stats: AdminStats;
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
    const cards = [
        {
            title: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
        },
        {
            title: "Pending Approvals",
            value: stats.pendingApprovals,
            icon: UserCheck,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
        },
        {
            title: "Active Ads",
            value: stats.activeAds,
            icon: ShoppingBag,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
        },
        {
            title: "Active Notices",
            value: stats.totalNotices,
            icon: Bell,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
        },
        {
            title: "Upcoming Events",
            value: stats.totalEvents,
            icon: Calendar,
            color: "text-pink-500",
            bg: "bg-pink-500/10",
            border: "border-pink-500/20",
        },
        {
            title: "Open Complaints",
            value: stats.openComplaints,
            icon: AlertTriangle,
            color: "text-red-500",
            bg: "bg-red-500/10",
            border: "border-red-500/20",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {cards.map((card) => (
                <div
                    key={card.title}
                    className={`p-6 rounded-xl border ${card.border} bg-white/5 backdrop-blur-sm`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-400 mb-1">
                                {card.title}
                            </p>
                            <h3 className="text-2xl font-bold text-white">{card.value}</h3>
                        </div>
                        <div className={`p-3 rounded-lg ${card.bg}`}>
                            <card.icon className={`h-6 w-6 ${card.color}`} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
