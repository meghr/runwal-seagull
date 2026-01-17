import { getNoticeById } from "@/lib/actions/admin-notice";
import { NoticeForm } from "@/components/admin/notices/notice-form";
import { notFound } from "next/navigation";
import { Edit } from "lucide-react";

export const metadata = {
    title: "Edit Notice | Runwal Seagull Admin",
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditNoticePage({ params }: PageProps) {
    const { id } = await params;
    const result = await getNoticeById(id);

    if (!result.success || !result.data) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Edit className="h-6 w-6 text-sky-400" />
                    Edit Notice
                </h1>
                <p className="text-slate-400">
                    Update the content or settings of this notice.
                </p>
            </div>

            <NoticeForm initialData={result.data} isEditing={true} />
        </div>
    );
}
