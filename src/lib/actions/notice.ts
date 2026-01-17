"use server";

import { prisma } from "@/lib/db";

export async function getPublicNotices(limit: number = 10) {
    try {
        const notices = await prisma.notice.findMany({
            where: {
                published: true,
                visibility: "PUBLIC",
            },
            orderBy: {
                publishedAt: "desc",
            },
            take: limit,
            select: {
                id: true,
                title: true,
                content: true,
                noticeType: true,
                attachmentUrls: true,
                publishedAt: true,
                creator: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return { success: true, data: notices };
    } catch (error) {
        console.error("Error fetching public notices:", error);
        return { success: false, error: "Failed to fetch notices", data: [] };
    }
}

export async function getNoticeById(id: string) {
    try {
        const notice = await prisma.notice.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        name: true,
                        role: true,
                    },
                },
            },
        });

        if (!notice) {
            return { success: false, error: "Notice not found" };
        }


        return { success: true, data: notice };
    } catch (error) {
        console.error("Error fetching notice:", error);
        return { success: false, error: "Failed to fetch notice details" };
    }
}

/**
 * Get all notices for registered users with filters, search, and pagination
 */
export async function getAllNoticesForUser(params: {
    page?: number;
    limit?: number;
    noticeType?: string;
    search?: string;
}) {
    try {
        const { page = 1, limit = 20, noticeType, search } = params;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            published: true,
            visibility: {
                in: ["PUBLIC", "REGISTERED"],
            },
        };

        // Add notice type filter
        if (noticeType && noticeType !== "ALL") {
            where.noticeType = noticeType;
        }

        // Add search filter
        if (search) {
            where.OR = [
                {
                    title: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    content: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ];
        }

        // Get total count for pagination
        const totalCount = await prisma.notice.count({ where });

        // Fetch notices
        const notices = await prisma.notice.findMany({
            where,
            orderBy: {
                publishedAt: "desc",
            },
            skip,
            take: limit,
            select: {
                id: true,
                title: true,
                content: true,
                noticeType: true,
                attachmentUrls: true,
                publishedAt: true,
                creator: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return {
            success: true,
            data: {
                notices,
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    totalPages: Math.ceil(totalCount / limit),
                },
            },
        };
    } catch (error) {
        console.error("Error fetching notices for user:", error);
        return { success: false, error: "Failed to fetch notices" };
    }
}

/**
 * Get notice by ID (for registered users - checks visibility)
 */
export async function getNoticeByIdForUser(id: string) {
    try {
        const notice = await prisma.notice.findFirst({
            where: {
                id,
                published: true,
                visibility: {
                    in: ["PUBLIC", "REGISTERED"],
                },
            },
            include: {
                creator: {
                    select: {
                        name: true,
                        role: true,
                    },
                },
            },
        });

        if (!notice) {
            return { success: false, error: "Notice not found" };
        }

        return { success: true, data: notice };
    } catch (error) {
        console.error("Error fetching notice:", error);
        return { success: false, error: "Failed to fetch notice details" };
    }
}
