"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NoticeType, Visibility } from "@prisma/client";

// Types
export interface NoticeData {
    title: string;
    content: string;
    noticeType: NoticeType;
    visibility: Visibility;
    published: boolean;
    attachmentUrls?: string[];
}

// Zod Schema for validation
const noticeSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    noticeType: z.nativeEnum(NoticeType),
    visibility: z.nativeEnum(Visibility),
    published: z.boolean().default(false),
    attachmentUrls: z.array(z.string()).optional(),
});

/**
 * Get all notices for admin table with filters
 */
export async function getAdminNotices(filters?: {
    search?: string;
    type?: NoticeType;
    visibility?: Visibility;
    published?: boolean;
}) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const whereClause: any = {};

        if (filters?.search) {
            whereClause.OR = [
                { title: { contains: filters.search, mode: "insensitive" } },
                { content: { contains: filters.search, mode: "insensitive" } },
            ];
        }

        if (filters?.type) {
            whereClause.noticeType = filters.type;
        }

        if (filters?.visibility) {
            whereClause.visibility = filters.visibility;
        }

        if (filters?.published !== undefined) {
            whereClause.published = filters.published;
        }

        const notices = await prisma.notice.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            include: {
                creator: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            }
        });

        return { success: true, data: notices };
    } catch (error) {
        console.error("Error fetching admin notices:", error);
        return { success: false, error: "Failed to fetch notices" };
    }
}

/**
 * Create a new notice
 */
export async function createNotice(data: NoticeData) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const validated = noticeSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        const notice = await prisma.notice.create({
            data: {
                title: validated.data.title,
                content: validated.data.content,
                noticeType: validated.data.noticeType,
                visibility: validated.data.visibility,
                published: validated.data.published,
                attachmentUrls: validated.data.attachmentUrls || [],
                createdBy: session.user.id,
                publishedAt: validated.data.published ? new Date() : null,
            },
        });

        revalidatePath("/admin/notices");
        revalidatePath("/dashboard/notices");
        revalidatePath("/"); // public notices

        return { success: true, data: notice };
    } catch (error) {
        console.error("Error creating notice:", error);
        return { success: false, error: "Failed to create notice" };
    }
}

/**
 * Update an existing notice
 */
export async function updateNotice(id: string, data: Partial<NoticeData>) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        // Checking existence
        const existing = await prisma.notice.findUnique({ where: { id } });
        if (!existing) {
            return { success: false, error: "Notice not found" };
        }

        const updateData: any = { ...data };

        // If publishing status changes to published, set publishedAt
        if (data.published === true && existing.published === false) {
            updateData.publishedAt = new Date();
        }

        const notice = await prisma.notice.update({
            where: { id },
            data: updateData,
        });

        revalidatePath("/admin/notices");
        revalidatePath("/dashboard/notices");
        revalidatePath("/");

        return { success: true, data: notice };
    } catch (error) {
        console.error("Error updating notice:", error);
        return { success: false, error: "Failed to update notice" };
    }
}

/**
 * Delete a notice
 */
export async function deleteNotice(id: string) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.notice.delete({ where: { id } });

        revalidatePath("/admin/notices");
        revalidatePath("/dashboard/notices");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Error deleting notice:", error);
        return { success: false, error: "Failed to delete notice" };
    }
}

/**
 * Get single notice by ID
 */
export async function getNoticeById(id: string) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const notice = await prisma.notice.findUnique({
            where: { id },
            include: {
                creator: {
                    select: { name: true }
                }
            }
        });

        if (!notice) {
            return { success: false, error: "Notice not found" };
        }

        return { success: true, data: notice };
    } catch (error) {
        console.error("Error fetching notice:", error);
        return { success: false, error: "Failed to fetch notice" };
    }
}
