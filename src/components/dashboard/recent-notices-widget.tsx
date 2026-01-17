"use client";

import Link from "next/link";
import { Bell, ArrowRight, FileText } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Notice {
    id: string;
    title: string;
    content: string;
    noticeType: string;
    publishedAt: Date | null;
    creator: {
        name: string;
    };
}

interface RecentNoticesWidgetProps {
    notices: Notice[];
}

const noticeTypeColors: Record<string, string> = {
    GENERAL: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    URGENT: "bg-red-500/10 text-red-400 border-red-500/20",
    MAINTENANCE: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    EVENT: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export function RecentNoticesWidget({ notices }: RecentNoticesWidgetProps) {
    if (notices.length === 0) {
        return (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Bell className="h-5 w-5 text-purple-400" />
                        Recent Notices
                    </h2>
                </div>
                <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500">No notices available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Bell className="h-5 w-5 text-purple-400" />
                    Recent Notices
                </h2>
                <Link
                    href="/dashboard/notices"
                    className="text-sm text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
                >
                    View All
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {/* Notices List */}
            <div className="space-y-3">
                {notices.map((notice) => (
                    <Link
                        key={notice.id}
                        href={`/dashboard/notices/${notice.id}`}
                        className="block group"
                    >
                        <div className="p-4 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-white group-hover:text-sky-400 transition-colors truncate">
                                        {notice.title}
                                    </h3>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={`shrink-0 ${noticeTypeColors[notice.noticeType] || noticeTypeColors.GENERAL}`}
                                >
                                    {notice.noticeType}
                                </Badge>
                            </div>

                            <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                                {notice.content}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    {notice.creator.name}
                                </span>
                                {notice.publishedAt && (
                                    <span>
                                        {format(new Date(notice.publishedAt), "MMM d, yyyy")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
