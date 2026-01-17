"use client";

import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { formatDate } from "@/lib/utils/index";

interface NoticeCardProps {
    notice: {
        id: string;
        title: string;
        content: string;
        noticeType: string;
        publishedAt: Date;
        creator: { name: string };
        attachmentUrls: string[] | null;
    };
    onClick: (id: string) => void;
}

const noticeTypeColors: Record<string, string> = {
    GENERAL: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    URGENT: "bg-red-500/10 text-red-400 border-red-500/20",
    MAINTENANCE: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    EVENT: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export function NoticeCard({ notice, onClick }: NoticeCardProps) {
    const badgeClass = noticeTypeColors[notice.noticeType] || noticeTypeColors.GENERAL;

    // Truncate content to ~150 characters
    const truncatedContent = notice.content.length > 150
        ? notice.content.substring(0, 150) + "..."
        : notice.content;

    return (
        <div
            onClick={() => onClick(notice.id)}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all hover:bg-white/10 hover:border-white/20 cursor-pointer"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white line-clamp-2 flex-1">
                        {notice.title}
                    </h3>
                    <Badge className={`${badgeClass} border text-xs shrink-0`}>
                        {notice.noticeType}
                    </Badge>
                </div>

                <p className="text-slate-400 text-sm line-clamp-3">
                    {truncatedContent}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(notice.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            <span>{notice.creator?.name || "Admin"}</span>
                        </div>
                    </div>
                    {notice.attachmentUrls && notice.attachmentUrls.length > 0 && (
                        <span className="text-sky-400">
                            {notice.attachmentUrls.length} attachment{notice.attachmentUrls.length > 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                <div className="text-sky-400 text-sm font-medium group-hover:underline">
                    Read More →
                </div>
            </div>
        </div>
    );
}
