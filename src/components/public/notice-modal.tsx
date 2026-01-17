"use client";

import { X, Calendar, User, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/index";

interface NoticeModalProps {
    notice: {
        id: string;
        title: string;
        content: string;
        noticeType: string;
        publishedAt: Date;
        creator: { name: string };
        attachmentUrls: string[] | null;
    } | null;
    onClose: () => void;
}

const noticeTypeColors: Record<string, string> = {
    GENERAL: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    URGENT: "bg-red-500/10 text-red-400 border-red-500/20",
    MAINTENANCE: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    EVENT: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export function NoticeModal({ notice, onClose }: NoticeModalProps) {
    if (!notice) return null;

    const badgeClass = noticeTypeColors[notice.noticeType] || noticeTypeColors.GENERAL;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/10 bg-slate-900 p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <Badge className={`${badgeClass} border text-xs`}>
                            {notice.noticeType}
                        </Badge>
                        <h2 className="text-3xl font-bold text-white pr-8">
                            {notice.title}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(notice.publishedAt)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <User className="h-4 w-4" />
                                <span>By {notice.creator?.name || "Admin"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {notice.content}
                        </p>
                    </div>

                    {notice.attachmentUrls && notice.attachmentUrls.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-white/10">
                            <h3 className="text-sm font-semibold text-white">Attachments</h3>
                            <div className="space-y-2">
                                {notice.attachmentUrls.map((url, index) => {
                                    const filename = url.split('/').pop() || `Attachment ${index + 1}`;
                                    return (
                                        <a
                                            key={index}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                                        >
                                            <Download className="h-4 w-4 text-sky-400" />
                                            <span className="text-sm text-slate-300 group-hover:text-white flex-1">
                                                {filename}
                                            </span>
                                            <span className="text-xs text-slate-500 group-hover:text-sky-400">
                                                Download
                                            </span>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="pt-4">
                        <Button
                            onClick={onClose}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
