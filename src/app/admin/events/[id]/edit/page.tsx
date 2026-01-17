import { notFound } from "next/navigation";
import { getAdminEventById } from "@/lib/actions/admin-event";
import { EventForm } from "@/components/admin/events/event-form";
import { Edit } from "lucide-react";

export const metadata = {
    title: "Edit Event | Runwal Seagull Admin",
    description: "Edit event details",
};

interface EditEventPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
    const { id } = await params;
    const result = await getAdminEventById(id);

    if (!result.success || !result.data) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Edit className="h-6 w-6 text-pink-400" />
                    Edit Event
                </h1>
                <p className="text-slate-400">
                    Update event details and settings.
                </p>
            </div>

            <EventForm initialData={result.data} isEditing />
        </div>
    );
}
