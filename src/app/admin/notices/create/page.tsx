import { NoticeForm } from "@/components/admin/notices/notice-form";
import { Bell } from "lucide-react";

export const metadata = {
    title: "Create Notice | Runwal Seagull Admin",
};

export default function CreateNoticePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Bell className="h-6 w-6 text-sky-400" />
                    Create New Notice
                </h1>
                <p className="text-slate-400">
                    Draft a new announcement to be shared with the residents.
                </p>
            </div>

            <NoticeForm />
        </div>
    );
}
