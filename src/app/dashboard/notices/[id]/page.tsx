import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getNoticeByIdForUser } from "@/lib/actions/notice";
import { format } from "date-fns";

const noticeTypeColors: Record<string, string> = {
    GENERAL: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    URGENT: "bg-red-500/10 text-red-400 border-red-500/20",
    MAINTENANCE: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    EVENT: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default async function NoticeDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const { id } = await params;
    const result = await getNoticeByIdForUser(id);

    if (!result.success || !result.data) {
        notFound();
    }

    const notice = result.data;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16">
                        <Link
                            href="/dashboard/notices"
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="text-sm">Back to Notices</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <article className="space-y-6">
                    {/* Notice Header */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <h1 className="text-3xl md:text-4xl font-bold text-white flex-1">
                                {notice.title}
                            </h1>
                            <Badge
                                variant="outline"
                                className={`shrink-0 ${noticeTypeColors[notice.noticeType] || noticeTypeColors.GENERAL}`}
                            >
                                {notice.noticeType}
                            </Badge>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {notice.creator.name}
                                {notice.creator.role && (
                                    <Badge variant="outline" className="bg-white/5 border-white/10">
                                        {notice.creator.role}
                                    </Badge>
                                )}
                            </span>
                            {notice.publishedAt && (
                                <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(notice.publishedAt), "MMMM d, yyyy 'at' h:mm a")}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/10" />

                    {/* Notice Content */}
                    <div className="prose prose-invert prose-slate max-w-none">
                        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {notice.content}
                        </div>
                    </div>

                    {/* Attachments */}
                    {notice.attachmentUrls && Array.isArray(notice.attachmentUrls) && notice.attachmentUrls.length > 0 && (
                        <div className="space-y-3">
                            <div className="border-t border-white/10 pt-6">
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-sky-400" />
                                    Attachments ({(notice.attachmentUrls as string[]).length})
                                </h2>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {(notice.attachmentUrls as string[]).map((url: string, index: number) => {
                                    const filename = url.split("/").pop() || `attachment-${index + 1}`;

                                    return (
                                        <a
                                            key={index}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group"
                                        >
                                            <div className="flex items-center gap-3 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all">
                                                <div className="shrink-0 p-2 rounded-lg bg-sky-500/10">
                                                    <Download className="h-5 w-5 text-sky-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate group-hover:text-sky-400 transition-colors">
                                                        {filename}
                                                    </p>
                                                    <p className="text-xs text-slate-500">Click to download</p>
                                                </div>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Back Button (Bottom) */}
                    <div className="border-t border-white/10 pt-6">
                        <Link href="/dashboard/notices">
                            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to All Notices
                            </Button>
                        </Link>
                    </div>
                </article>
            </main>
        </div>
    );
}
