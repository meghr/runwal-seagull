import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { EventsClient } from "@/components/dashboard/events-client";

export const metadata = {
    title: "Events | Runwal Seagull Society",
    description: "Browse and register for society events",
};

export default async function EventsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span className="text-sm">Back to Dashboard</span>
                            </Link>
                            <div className="h-6 w-px bg-white/10" />
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5 text-sky-400" />
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">
                                    Events
                                </h1>
                            </div>
                        </div>
                        <Link
                            href="/dashboard/events/my-registrations"
                            className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
                        >
                            My Registrations →
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <EventsClient />
            </main>
        </div>
    );
}
