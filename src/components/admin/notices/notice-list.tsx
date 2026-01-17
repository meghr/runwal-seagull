"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Notice, NoticeType, Visibility } from "@prisma/client";
import { deleteNotice } from "@/lib/actions/admin-notice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Eye, EyeOff, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AdminNotice extends Notice {
    creator: {
        name: string;
        email: string;
    };
}

interface NoticeListProps {
    notices: AdminNotice[];
}

export function NoticeList({ notices }: NoticeListProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this notice? This action cannot be undone.")) {
            return;
        }

        startTransition(async () => {
            const result = await deleteNotice(id);
            if (!result.success) {
                alert(result.error || "Failed to delete notice");
            }
        });
    };

    const getTypeColor = (type: NoticeType) => {
        switch (type) {
            case "URGENT": return "bg-red-500/10 text-red-500 border-red-500/20";
            case "MAINTENANCE": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "EVENT": return "bg-pink-500/10 text-pink-500 border-pink-500/20";
            case "GENERAL": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        }
    };

    if (notices.length === 0) {
        return (
            <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
                <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-white">No notices found</h3>
                <p className="text-slate-400 text-sm">Create a new notice to get started.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-white/5 text-slate-400">
                        <tr>
                            <th className="px-6 py-4 font-medium">Title</th>
                            <th className="px-6 py-4 font-medium">Type</th>
                            <th className="px-6 py-4 font-medium">Visibility</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Author</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {notices.map((notice) => (
                            <tr key={notice.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">
                                    <div className="max-w-[200px] truncate" title={notice.title}>
                                        {notice.title}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline" className={getTypeColor(notice.noticeType)}>
                                        {notice.noticeType}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-slate-300">
                                    {notice.visibility}
                                </td>
                                <td className="px-6 py-4">
                                    {notice.published ? (
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex w-fit items-center gap-1">
                                            <Eye className="h-3 w-3" /> Published
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20 flex w-fit items-center gap-1">
                                            <EyeOff className="h-3 w-3" /> Draft
                                        </Badge>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-slate-300">
                                    {notice.creator.name}
                                </td>
                                <td className="px-6 py-4 text-slate-400">
                                    {format(new Date(notice.createdAt), "MMM d, yyyy")}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`/admin/notices/${notice.id}/edit`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10">
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            disabled={isPending}
                                            onClick={() => handleDelete(notice.id)}
                                            className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                        >
                                            {isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
