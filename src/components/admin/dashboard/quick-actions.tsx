"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    UserPlus,
    BellPlus,
    CalendarPlus,
    Building2
} from "lucide-react";

export function QuickActions() {
    const actions = [
        {
            label: "Review Users",
            href: "/admin/users?status=PENDING",
            icon: UserPlus,
            color: "text-amber-400",
            description: "Approve pending registrations"
        },
        {
            label: "Manage Buildings",
            href: "/admin/buildings",
            icon: Building2,
            color: "text-sky-400",
            description: "Configure registration visibility"
        },
        {
            label: "Create Notice",
            href: "/admin/notices/create",
            icon: BellPlus,
            color: "text-purple-400",
            description: "Post a new announcement"
        },
        {
            label: "Create Event",
            href: "/admin/events/create",
            icon: CalendarPlus,
            color: "text-pink-400",
            description: "Schedule a community event"
        }
    ];

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 h-full">
            <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {actions.map((action) => (
                    <Link key={action.label} href={action.href}>
                        <div className="group p-4 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer h-full">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-md bg-white/5 group-hover:bg-white/10 ${action.color}`}>
                                    <action.icon className="h-5 w-5" />
                                </div>
                                <span className="font-medium text-white group-hover:text-sky-400 transition-colors">
                                    {action.label}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 pl-1">
                                {action.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
