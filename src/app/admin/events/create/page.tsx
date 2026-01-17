import { EventForm } from "@/components/admin/events/event-form";
import { CalendarPlus } from "lucide-react";

export const metadata = {
    title: "Create Event | Runwal Seagull Admin",
    description: "Create a new society event",
};

export default function CreateEventPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <CalendarPlus className="h-6 w-6 text-pink-400" />
                    Create New Event
                </h1>
                <p className="text-slate-400">
                    Set up a new event for the society residents.
                </p>
            </div>

            <EventForm />
        </div>
    );
}
