import { Suspense } from "react";
import Link from "next/link";
import { getAdminEvents } from "@/lib/actions/admin-event";
import { EventList } from "@/components/admin/events/event-list";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Loader2 } from "lucide-react";

export const metadata = {
    title: "Event Management | Runwal Seagull Admin",
    description: "Create, manage, and monitor society events",
};

export default async function AdminEventsPage() {
    const result = await getAdminEvents();

    const events = result.success && result.data ? result.data : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Event Management</h1>
                    <p className="text-slate-400">
                        Create, edit, and manage society events and registrations
                    </p>
                </div>
                <Link href="/admin/events/create">
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white w-full sm:w-auto">
                        <CalendarPlus className="h-4 w-4 mr-2" />
                        Create Event
                    </Button>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <p className="text-2xl font-bold text-white">{events.length}</p>
                    <p className="text-sm text-slate-400">Total Events</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <p className="text-2xl font-bold text-emerald-400">
                        {events.filter((e: any) => e.published).length}
                    </p>
                    <p className="text-sm text-slate-400">Published</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <p className="text-2xl font-bold text-sky-400">
                        {
                            events.filter(
                                (e: any) => new Date(e.startDate) > new Date()
                            ).length
                        }
                    </p>
                    <p className="text-sm text-slate-400">Upcoming</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <p className="text-2xl font-bold text-purple-400">
                        {events.reduce(
                            (acc: number, e: any) => acc + e._count.registrations,
                            0
                        )}
                    </p>
                    <p className="text-sm text-slate-400">Total Registrations</p>
                </div>
            </div>

            {/* Event List */}
            <Suspense
                fallback={
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
                    </div>
                }
            >
                <EventList events={events as any} />
            </Suspense>
        </div>
    );
}
