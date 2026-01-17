import { Suspense } from "react";
import Link from "next/link";
import { getAdminNotices } from "@/lib/actions/admin-notice";
import { NoticeList } from "@/components/admin/notices/notice-list";
import { Button } from "@/components/ui/button";
import { BellPlus, Loader2 } from "lucide-react";

export const metadata = {
    title: "Notice Management | Runwal Seagull Admin",
    description: "Manage society notices and announcements",
};

export default async function AdminNoticesPage() {
    const result = await getAdminNotices();

    const notices = result.success && result.data ? result.data : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Notice Management</h1>
                    <p className="text-slate-400">Create, edit, and publish announcements</p>
                </div>
                <Link href="/admin/notices/create">
                    <Button className="bg-sky-500 hover:bg-sky-600 text-white w-full sm:w-auto">
                        <BellPlus className="h-4 w-4 mr-2" />
                        Create Notice
                    </Button>
                </Link>
            </div>

            {/* List */}
            <Suspense fallback={
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                </div>
            }>
                <NoticeList notices={notices as any} />
                {/* Using as any because of prisma includes discrepancy for creator.name/email inside component logic, 
           but NoticeList interface expects AdminNotice which matches what we fetch in getAdminNotices */}
            </Suspense>
        </div>
    );
}
