import { auth } from "@/auth";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, LogOut } from "lucide-react";

// Import dashboard components
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentNoticesWidget } from "@/components/dashboard/recent-notices-widget";
import { MyRegistrationsWidget } from "@/components/dashboard/my-registrations-widget";
import { QuickActionsGrid } from "@/components/dashboard/quick-actions-grid";

// Import server actions
import {
    getDashboardStats,
    getRecentNotices,
    getMyEventRegistrations,
} from "@/lib/actions/dashboard";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Redirect Admin to Admin Portal
    if (session.user.role === "ADMIN") {
        redirect("/admin");
    }

    // Fetch all dashboard data
    const [statsResult, noticesResult, registrationsResult] = await Promise.all([
        getDashboardStats(),
        getRecentNotices(5),
        getMyEventRegistrations(5),
    ]);

    const stats = statsResult.success ? statsResult.data : null;
    const notices = noticesResult.success && noticesResult.data ? noticesResult.data : [];
    const registrations = registrationsResult.success && registrationsResult.data ? registrationsResult.data : [];

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">
                                Dashboard
                            </h1>
                            <p className="text-sm text-slate-400">
                                Welcome back, {session.user.name}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/profile"
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm"
                            >
                                <User className="h-4 w-4" />
                                Profile
                            </Link>
                            <form action={logout}>
                                <Button
                                    variant="outline"
                                    className="border-white/10 text-white hover:bg-white/5 flex items-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* Statistics Cards */}
                    {stats && (
                        <DashboardStats
                            building={stats.building}
                            flatNumber={stats.flatNumber}
                            newNoticesCount={stats.newNoticesCount}
                            upcomingEventsCount={stats.upcomingEventsCount}
                            myRegistrationsCount={stats.myRegistrationsCount}
                            userType={stats.userType}
                        />
                    )}

                    {/* Quick Actions */}
                    <QuickActionsGrid />

                    {/* Two Column Layout for Widgets */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Recent Notices */}
                        <RecentNoticesWidget notices={notices} />

                        {/* My Registrations */}
                        <MyRegistrationsWidget registrations={registrations} />
                    </div>
                </div>
            </main>
        </div>
    );
}
