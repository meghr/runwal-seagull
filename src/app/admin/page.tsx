import { Suspense } from "react";
import { getAdminStats, getRecentActivity } from "@/lib/actions/admin-dashboard";
import { AdminStatsCards } from "@/components/admin/dashboard/admin-stats-cards";
import { RecentActivityFeed } from "@/components/admin/dashboard/recent-activity-feed";
import { QuickActions } from "@/components/admin/dashboard/quick-actions";
import { Loader2 } from "lucide-react";

export const metadata = {
    title: "Admin Dashboard | Runwal Seagull",
    description: "Administrative overview and controls",
};

export default async function AdminDashboard() {
    const statsResult = await getAdminStats();
    const activityResult = await getRecentActivity();

    const stats = statsResult.success && statsResult.data ? statsResult.data : {
        totalUsers: 0,
        pendingApprovals: 0,
        activeAds: 0,
        totalNotices: 0,
        totalEvents: 0,
        openComplaints: 0
    };

    const activities = activityResult.success && activityResult.data ? activityResult.data : [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Dashboard Overview
                </h2>
                <p className="text-slate-400 mt-1">
                    Welcome back, Admin. Here's what's happening today.
                </p>
            </div>

            {/* Stats Cards */}
            <AdminStatsCards stats={stats} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Feed - Takes up 2 columns */}
                <div className="lg:col-span-2">
                    <RecentActivityFeed activities={activities} />
                </div>

                {/* Quick Actions & Other widgets - Takes up 1 column */}
                <div className="space-y-8">
                    <QuickActions />

                    {/* Pending Approvals Widget (Mini) */}
                    {stats.pendingApprovals > 0 && (
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 backdrop-blur-sm">
                            <h3 className="text-lg font-semibold text-amber-500 mb-2">Attention Needed</h3>
                            <p className="text-slate-300 text-sm mb-4">
                                You have <span className="font-bold text-white">{stats.pendingApprovals}</span> new user registrations pending approval.
                            </p>
                            <a
                                href="/admin/users?status=PENDING"
                                className="text-sm font-medium text-amber-400 hover:text-amber-300 underline"
                            >
                                Review Applications &rarr;
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
