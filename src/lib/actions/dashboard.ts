"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * Get dashboard statistics for the current user
 */
export async function getDashboardStats() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Get user's flat info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        flat: {
          include: {
            building: true,
          },
        },
      },
    });

    // Count new notices (published in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newNoticesCount = await prisma.notice.count({
      where: {
        publishedAt: {
          gte: sevenDaysAgo,
        },
        visibility: {
          in: ["PUBLIC", "REGISTERED"],
        },
      },
    });

    // Count upcoming events
    const upcomingEventsCount = await prisma.event.count({
      where: {
        endDate: {
          gt: new Date(),
        },
        published: true,
      },
    });

    // Count user's event registrations
    const myRegistrationsCount = await prisma.eventRegistration.count({
      where: {
        userId: userId,
        event: {
          endDate: {
            gt: new Date(),
          },
        },
      },
    });

    return {
      success: true,
      data: {
        building: user?.flat?.building?.name || null,
        flatNumber: user?.flat?.flatNumber || null,
        newNoticesCount,
        upcomingEventsCount,
        myRegistrationsCount,
        userType: user?.userType || "TENANT",
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { success: false, error: "Failed to fetch dashboard statistics" };
  }
}

/**
 * Get recent notices for the user
 */
export async function getRecentNotices(limit: number = 5) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const notices = await prisma.notice.findMany({
      where: {
        published: true,
        visibility: {
          in: ["PUBLIC", "REGISTERED"],
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: limit,
      include: {
        creator: {
          select: {
            name: true,
          },
        },
      },
    });

    return { success: true, data: notices };
  } catch (error) {
    console.error("Error fetching recent notices:", error);
    return { success: false, error: "Failed to fetch recent notices" };
  }
}

/**
 * Get user's upcoming event registrations
 */
export async function getMyEventRegistrations(limit: number = 5) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const registrations = await prisma.eventRegistration.findMany({
      where: {
        userId: session.user.id,
        event: {
          endDate: {
            gt: new Date(),
          },
        },
      },
      orderBy: {
        event: {
          startDate: "asc",
        },
      },
      take: limit,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            venue: true,
            eventType: true,
          },
        },
      },
    });

    return { success: true, data: registrations };
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    return { success: false, error: "Failed to fetch event registrations" };
  }
}
