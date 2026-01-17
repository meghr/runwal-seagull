"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export interface AdminStats {
    totalUsers: number;
    pendingApprovals: number;
    activeAds: number;
    totalNotices: number;
    totalEvents: number;
    openComplaints: number;
}

export interface RecentActivity {
    id: string;
    type: "USER" | "NOTICE" | "EVENT" | "COMPLAINT";
    action: string;
    description: string;
    timestamp: Date;
    actorName: string;
    actorImage: string | null;
}

/**
 * Get overview statistics for the admin dashboard
 */
export async function getAdminStats() {
    try {
        const session = await auth();

        // Strict admin check
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized access" };
        }

        const [
            totalUsers,
            pendingApprovals,
            activeAds,
            totalNotices,
            totalEvents,
            openComplaints
        ] = await Promise.all([
            prisma.user.count({ where: { status: "APPROVED" } }),
            prisma.user.count({ where: { status: "PENDING" } }),
            prisma.marketplaceAd.count({ where: { status: "ACTIVE" } }),
            prisma.notice.count(),
            prisma.event.count(),
            prisma.complaint.count({ where: { status: { in: ["SUBMITTED", "ASSIGNED", "IN_PROGRESS"] } } })
        ]);

        return {
            success: true,
            data: {
                totalUsers,
                pendingApprovals,
                activeAds,
                totalNotices,
                totalEvents,
                openComplaints
            }
        };
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return { success: false, error: "Failed to fetch statistics" };
    }
}

/**
 * Get recent registered users
 */
export async function getRecentRegistrations() {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const recentUsers = await prisma.user.findMany({
            where: {
                status: "PENDING"
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 5,
            select: {
                id: true,
                name: true,
                email: true,
                profileImageUrl: true,
                userType: true,
                createdAt: true,
                building: {
                    select: { name: true }
                },
                flat: {
                    select: { flatNumber: true }
                }
            }
        });

        return { success: true, data: recentUsers };
    } catch (error) {
        console.error("Error fetching recent registrations:", error);
        return { success: false, error: "Failed to fetch registrations" };
    }
}

/**
 * Get recent activity feed
 * Note: Since we don't have a centralized Activity Log table yet for all actions,
 * we'll simulate this by fetching latest items from different tables and merging them.
 * In a real production app, you'd want a dedicated Audit Logging system.
 */
export async function getRecentActivity() {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        // Fetch latest 5 of each type to merge
        const [latestUsers, latestNotices, latestEvents] = await Promise.all([
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                select: { id: true, name: true, profileImageUrl: true, createdAt: true } // Note: using image/profileImageUrl depending on schema
            }),
            prisma.notice.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { creator: { select: { name: true, profileImageUrl: true } } }
            }),
            prisma.event.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { creator: { select: { name: true, profileImageUrl: true } } }
            })
        ]);

        const activities: RecentActivity[] = [];

        // Map Users
        latestUsers.forEach(user => {
            activities.push({
                id: user.id,
                type: "USER",
                action: "New Registration",
                description: `${user.name} joined the portal`,
                timestamp: user.createdAt,
                actorName: user.name,
                actorImage: user.profileImageUrl // Fixed: accessing correct property
            });
        });

        // Map Notices
        latestNotices.forEach(notice => {
            activities.push({
                id: notice.id,
                type: "NOTICE",
                action: "Notice Published",
                description: `"${notice.title}" was posted`,
                timestamp: notice.createdAt,
                actorName: notice.creator.name,
                actorImage: notice.creator.profileImageUrl
            });
        });

        // Map Events
        latestEvents.forEach(event => {
            activities.push({
                id: event.id,
                type: "EVENT",
                action: "Event Created",
                description: `"${event.title}" was scheduled`,
                timestamp: event.createdAt,
                actorName: event.creator.name,
                actorImage: event.creator.profileImageUrl
            });
        });

        // Sort by date desc and take top 10
        const sortedActivities = activities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);

        return { success: true, data: sortedActivities };

    } catch (error) {
        console.error("Error fetching activity feed:", error);
        return { success: false, error: "Failed to fetch activity" };
    }
}
