"use client";

import { formatDistanceToNow } from "date-fns";
import {
    UserPlus,
    Bell,
    Calendar,
    AlertCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface RecentActivity {
    id: string;
    type: "USER" | "NOTICE" | "EVENT" | "COMPLAINT";
    action: string;
    description: string;
    timestamp: Date;
    actorName: string;
    actorImage: string | null;
}

interface RecentActivityFeedProps {
    activities: RecentActivity[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case "USER":
                return <UserPlus className="h-4 w-4" />;
            case "NOTICE":
                return <Bell className="h-4 w-4" />;
            case "EVENT":
                return <Calendar className="h-4 w-4" />;
            case "COMPLAINT":
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case "USER":
                return "text-blue-400 bg-blue-500/10";
            case "NOTICE":
                return "text-purple-400 bg-purple-500/10";
            case "EVENT":
                return "text-pink-400 bg-pink-500/10";
            case "COMPLAINT":
                return "text-red-400 bg-red-500/10";
            default:
                return "text-slate-400 bg-slate-500/10";
        }
    };

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>

            <div className="space-y-6">
                {activities.map((activity, index) => (
                    <div key={`${activity.id}-${index}`} className="flex gap-4">
                        {/* Timeline Line */}
                        <div className="relative">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center border border-white/5 ${getColor(activity.type)}`}>
                                {getIcon(activity.type)}
                            </div>
                            {index !== activities.length - 1 && (
                                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-full bg-white/10 -mb-6" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-white">{activity.action}</p>
                                <span className="text-xs text-slate-500">
                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 mb-2">{activity.description}</p>

                            {/* Actor Info */}
                            <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                    <AvatarImage src={activity.actorImage || ""} />
                                    <AvatarFallback className="text-[10px]">
                                        {activity.actorName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-slate-500">by {activity.actorName}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {activities.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                        No recent activity found
                    </div>
                )}
            </div>
        </div>
    );
}
