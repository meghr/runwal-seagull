"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { FileText, Paperclip, User } from "lucide-react";

interface NoticeCardProps {
    notice: {
        id: string;
        title: string;
        content: string;
        noticeType: string;
        publishedAt: Date | null;
        attachmentUrls: string[] | null;
        creator: {
            name: string;
        };
    };
}

const noticeTypeColors: Record<string, string> = {
    GENERAL: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    URGENT: "bg-red-500/10 text-red-400 border-red-500/20",
    MAINTENANCE: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    EVENT: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export function NoticeCard({ notice }: NoticeCardProps) {
    const attachmentCount = notice.attachmentUrls?.length || 0;

    return (
        <Link href={`/dashboard/notices/${notice.id}`} className="block group">
            <div className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-white group-hover:text-sky-400 transition-colors line-clamp-2 flex-1">
                        {notice.title}
                    </h3>
                    <Badge
                        variant="outline"
                        className={`shrink-0 ${noticeTypeColors[notice.noticeType] || noticeTypeColors.GENERAL}`}
                    >
                        {notice.noticeType}
                    </Badge>
                </div>

                {/* Content Preview */}
                <p className="text-slate-400 text-sm line-clamp-3 mb-4">
                    {notice.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            {notice.creator.name}
                        </span>
                        {notice.publishedAt && (
                            <span className="flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5" />
                                {format(new Date(notice.publishedAt), "MMM d, yyyy")}
                            </span>
                        )}
                    </div>
                    {attachmentCount > 0 && (
                        <span className="flex items-center gap-1.5 text-sky-400">
                            <Paperclip className="h-3.5 w-3.5" />
                            {attachmentCount} attachment{attachmentCount > 1 ? "s" : ""}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
