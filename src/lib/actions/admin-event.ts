"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { EventType, ParticipationType } from "@prisma/client";

// Types
export interface EventData {
    title: string;
    description?: string;
    eventType: EventType;
    startDate: Date | string;
    endDate: Date | string;
    venue?: string;
    registrationRequired: boolean;
    registrationStartDate?: Date | string | null;
    registrationEndDate?: Date | string | null;
    participationType?: ParticipationType | null;
    maxParticipants?: number | null;
    published: boolean;
    imageUrl?: string | null;
}

// Zod Schema
const eventSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    eventType: z.nativeEnum(EventType),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    venue: z.string().optional(),
    registrationRequired: z.boolean().default(false),
    registrationStartDate: z.string().or(z.date()).nullable().optional(),
    registrationEndDate: z.string().or(z.date()).nullable().optional(),
    participationType: z.nativeEnum(ParticipationType).nullable().optional(),
    maxParticipants: z.number().nullable().optional(),
    published: z.boolean().default(false),
    imageUrl: z.string().nullable().optional(),
});

/**
 * Get all events for admin with filters
 */
export async function getAdminEvents(filters?: {
    search?: string;
    eventType?: EventType;
    status?: "ALL" | "PUBLISHED" | "DRAFT" | "UPCOMING" | "PAST";
}) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const where: any = {};
        const now = new Date();

        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: "insensitive" } },
                { description: { contains: filters.search, mode: "insensitive" } },
                { venue: { contains: filters.search, mode: "insensitive" } },
            ];
        }

        if (filters?.eventType) {
            where.eventType = filters.eventType;
        }

        if (filters?.status) {
            switch (filters.status) {
                case "PUBLISHED":
                    where.published = true;
                    break;
                case "DRAFT":
                    where.published = false;
                    break;
                case "UPCOMING":
                    where.endDate = { gte: now };
                    break;
                case "PAST":
                    where.endDate = { lt: now };
                    break;
            }
        }

        const events = await prisma.event.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                creator: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        registrations: true,
                    },
                },
            },
        });

        return { success: true, data: events };
    } catch (error) {
        console.error("Error fetching admin events:", error);
        return { success: false, error: "Failed to fetch events" };
    }
}

/**
 * Get single event by ID with registration details
 */
export async function getAdminEventById(id: string) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                creator: {
                    select: { name: true, email: true },
                },
                _count: {
                    select: { registrations: true },
                },
            },
        });

        if (!event) {
            return { success: false, error: "Event not found" };
        }

        return { success: true, data: event };
    } catch (error) {
        console.error("Error fetching event:", error);
        return { success: false, error: "Failed to fetch event" };
    }
}

/**
 * Create a new event
 */
export async function createEvent(data: EventData) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const validated = eventSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message };
        }

        // Convert dates
        const startDate = new Date(validated.data.startDate);
        const endDate = new Date(validated.data.endDate);

        // Validate dates
        if (endDate < startDate) {
            return { success: false, error: "End date must be after start date" };
        }

        const event = await prisma.event.create({
            data: {
                title: validated.data.title,
                description: validated.data.description || null,
                eventType: validated.data.eventType,
                startDate,
                endDate,
                venue: validated.data.venue || null,
                registrationRequired: validated.data.registrationRequired,
                registrationStartDate: validated.data.registrationStartDate
                    ? new Date(validated.data.registrationStartDate)
                    : null,
                registrationEndDate: validated.data.registrationEndDate
                    ? new Date(validated.data.registrationEndDate)
                    : null,
                participationType: validated.data.participationType || null,
                maxParticipants: validated.data.maxParticipants || null,
                published: validated.data.published,
                imageUrl: validated.data.imageUrl || null,
                createdBy: session.user.id,
                publishedAt: validated.data.published ? new Date() : null,
            },
        });

        revalidatePath("/admin/events");
        revalidatePath("/dashboard/events");
        revalidatePath("/");

        return { success: true, data: event };
    } catch (error) {
        console.error("Error creating event:", error);
        return { success: false, error: "Failed to create event" };
    }
}

/**
 * Update an existing event
 */
export async function updateEvent(id: string, data: Partial<EventData>) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const existing = await prisma.event.findUnique({
            where: { id },
            include: { _count: { select: { registrations: true } } },
        });

        if (!existing) {
            return { success: false, error: "Event not found" };
        }

        const updateData: any = {};

        // Handle each field
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.eventType !== undefined) updateData.eventType = data.eventType;
        if (data.venue !== undefined) updateData.venue = data.venue;
        if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

        // Handle dates
        if (data.startDate !== undefined) {
            updateData.startDate = new Date(data.startDate);
        }
        if (data.endDate !== undefined) {
            updateData.endDate = new Date(data.endDate);
        }

        // Registration settings - warn if registrations exist
        if (data.registrationRequired !== undefined) {
            if (!data.registrationRequired && existing._count.registrations > 0) {
                return {
                    success: false,
                    error: "Cannot disable registration when there are existing registrations",
                };
            }
            updateData.registrationRequired = data.registrationRequired;
        }

        if (data.registrationStartDate !== undefined) {
            updateData.registrationStartDate = data.registrationStartDate
                ? new Date(data.registrationStartDate)
                : null;
        }
        if (data.registrationEndDate !== undefined) {
            updateData.registrationEndDate = data.registrationEndDate
                ? new Date(data.registrationEndDate)
                : null;
        }
        if (data.participationType !== undefined) {
            updateData.participationType = data.participationType;
        }
        if (data.maxParticipants !== undefined) {
            // Validate max participants against current registrations
            if (data.maxParticipants && data.maxParticipants < existing._count.registrations) {
                return {
                    success: false,
                    error: `Cannot set max participants below current registrations (${existing._count.registrations})`,
                };
            }
            updateData.maxParticipants = data.maxParticipants;
        }

        // Handle publishing
        if (data.published !== undefined) {
            updateData.published = data.published;
            if (data.published && !existing.published) {
                updateData.publishedAt = new Date();
            }
        }

        const event = await prisma.event.update({
            where: { id },
            data: updateData,
        });

        revalidatePath("/admin/events");
        revalidatePath(`/admin/events/${id}`);
        revalidatePath("/dashboard/events");
        revalidatePath("/");

        return { success: true, data: event };
    } catch (error) {
        console.error("Error updating event:", error);
        return { success: false, error: "Failed to update event" };
    }
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        // Check for registrations
        const event = await prisma.event.findUnique({
            where: { id },
            include: { _count: { select: { registrations: true } } },
        });

        if (!event) {
            return { success: false, error: "Event not found" };
        }

        if (event._count.registrations > 0) {
            return {
                success: false,
                error: `Cannot delete event with ${event._count.registrations} registration(s). Cancel registrations first.`,
            };
        }

        await prisma.event.delete({ where: { id } });

        revalidatePath("/admin/events");
        revalidatePath("/dashboard/events");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Error deleting event:", error);
        return { success: false, error: "Failed to delete event" };
    }
}

/**
 * Manually close event registrations
 */
export async function closeEventRegistration(id: string) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const event = await prisma.event.update({
            where: { id },
            data: {
                registrationEndDate: new Date(), // Set to now to close
            },
        });

        revalidatePath("/admin/events");
        revalidatePath(`/admin/events/${id}`);
        revalidatePath("/dashboard/events");

        return { success: true, data: event, message: "Registration closed" };
    } catch (error) {
        console.error("Error closing registration:", error);
        return { success: false, error: "Failed to close registration" };
    }
}

/**
 * Cancel event (marks as unpublished and notifies)
 */
export async function cancelEvent(id: string, reason?: string) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        // Get registrations count
        const event = await prisma.event.findUnique({
            where: { id },
            include: { _count: { select: { registrations: true } } },
        });

        if (!event) {
            return { success: false, error: "Event not found" };
        }

        // Unpublish the event
        await prisma.event.update({
            where: { id },
            data: {
                published: false,
                description: event.description
                    ? `[CANCELLED${reason ? `: ${reason}` : ""}]\n\n${event.description}`
                    : `[CANCELLED${reason ? `: ${reason}` : ""}]`,
            },
        });

        // TODO: Send notification emails to registered users (deferred)

        revalidatePath("/admin/events");
        revalidatePath(`/admin/events/${id}`);
        revalidatePath("/dashboard/events");
        revalidatePath("/");

        return {
            success: true,
            message: `Event cancelled. ${event._count.registrations} registrant(s) should be notified.`,
        };
    } catch (error) {
        console.error("Error cancelling event:", error);
        return { success: false, error: "Failed to cancel event" };
    }
}

/**
 * Get event registrations with details
 */
export async function getEventRegistrations(eventId: string) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: {
                id: true,
                title: true,
                participationType: true,
                maxParticipants: true,
                registrationRequired: true,
                registrationStartDate: true,
                registrationEndDate: true,
                startDate: true,
            },
        });

        if (!event) {
            return { success: false, error: "Event not found" };
        }

        const registrations = await prisma.eventRegistration.findMany({
            where: { eventId },
            orderBy: { registeredAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                        building: {
                            select: { name: true },
                        },
                        flat: {
                            select: { flatNumber: true },
                        },
                    },
                },
            },
        });

        // Calculate total participants (including team members)
        let totalParticipants = 0;
        registrations.forEach((reg) => {
            totalParticipants += 1; // The registrant
            if (reg.teamMembers && Array.isArray(reg.teamMembers)) {
                totalParticipants += (reg.teamMembers as any[]).length;
            }
        });

        // Calculate registration status
        const now = new Date();
        let registrationStatus: "NOT_STARTED" | "OPEN" | "CLOSED" | "FULL" | "NOT_REQUIRED" = "NOT_REQUIRED";

        if (event.registrationRequired) {
            if (event.registrationStartDate && now < new Date(event.registrationStartDate)) {
                registrationStatus = "NOT_STARTED";
            } else if (event.registrationEndDate && now > new Date(event.registrationEndDate)) {
                registrationStatus = "CLOSED";
            } else if (event.maxParticipants && registrations.length >= event.maxParticipants) {
                registrationStatus = "FULL";
            } else {
                registrationStatus = "OPEN";
            }
        }

        // Time remaining
        let timeRemaining = null;
        if (event.registrationEndDate && registrationStatus === "OPEN") {
            const diff = new Date(event.registrationEndDate).getTime() - now.getTime();
            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                timeRemaining = { days, hours };
            }
        }

        return {
            success: true,
            data: {
                event,
                registrations,
                stats: {
                    totalRegistrations: registrations.length,
                    totalParticipants,
                    registrationStatus,
                    timeRemaining,
                },
            },
        };
    } catch (error) {
        console.error("Error fetching registrations:", error);
        return { success: false, error: "Failed to fetch registrations" };
    }
}

/**
 * Export registrations to CSV format
 */
export async function exportEventRegistrations(eventId: string) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: { title: true, participationType: true },
        });

        if (!event) {
            return { success: false, error: "Event not found" };
        }

        const registrations = await prisma.eventRegistration.findMany({
            where: { eventId },
            orderBy: { registeredAt: "asc" },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phoneNumber: true,
                        building: { select: { name: true } },
                        flat: { select: { flatNumber: true } },
                    },
                },
            },
        });

        // Build CSV
        const headers = [
            "S.No",
            "Name",
            "Email",
            "Phone",
            "Building",
            "Flat",
            "Registered At",
            "Status",
        ];

        if (event.participationType === "TEAM") {
            headers.push("Team Members");
        }
        headers.push("Notes");

        const rows = registrations.map((reg, index) => {
            const row = [
                index + 1,
                reg.user.name,
                reg.user.email,
                reg.user.phoneNumber || "",
                reg.user.building?.name || "",
                reg.user.flat?.flatNumber || "",
                new Date(reg.registeredAt).toLocaleDateString(),
                reg.registrationStatus,
            ];

            if (event.participationType === "TEAM") {
                const teamMembers = reg.teamMembers as any[] | null;
                row.push(
                    teamMembers
                        ? teamMembers.map((m) => m.name).join("; ")
                        : ""
                );
            }
            row.push(reg.additionalNotes || "");

            return row;
        });

        // Convert to CSV string
        const csvContent = [
            headers.join(","),
            ...rows.map((row) =>
                row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
            ),
        ].join("\n");

        return {
            success: true,
            data: {
                filename: `${event.title.replace(/[^a-z0-9]/gi, "_")}_registrations.csv`,
                content: csvContent,
            },
        };
    } catch (error) {
        console.error("Error exporting registrations:", error);
        return { success: false, error: "Failed to export registrations" };
    }
}

/**
 * Get event analytics
 */
export async function getEventAnalytics(eventId: string) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                registrations: {
                    select: {
                        registeredAt: true,
                        registrationStatus: true,
                        teamMembers: true,
                    },
                },
            },
        });

        if (!event) {
            return { success: false, error: "Event not found" };
        }

        // Calculate analytics
        const registrations = event.registrations;
        const totalRegistrations = registrations.length;
        const activeRegistrations = registrations.filter(
            (r) => r.registrationStatus === "REGISTERED"
        ).length;
        const cancelledRegistrations = registrations.filter(
            (r) => r.registrationStatus === "CANCELLED"
        ).length;

        // Total participants including team members
        let totalParticipants = 0;
        registrations.forEach((reg) => {
            if (reg.registrationStatus === "REGISTERED") {
                totalParticipants += 1;
                if (reg.teamMembers && Array.isArray(reg.teamMembers)) {
                    totalParticipants += (reg.teamMembers as any[]).length;
                }
            }
        });

        // Registration timeline (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentRegistrations = registrations.filter(
            (r) => new Date(r.registeredAt) >= sevenDaysAgo
        ).length;

        // Capacity utilization
        const capacityUtilization = event.maxParticipants
            ? Math.round((totalParticipants / event.maxParticipants) * 100)
            : null;

        return {
            success: true,
            data: {
                totalRegistrations,
                activeRegistrations,
                cancelledRegistrations,
                totalParticipants,
                recentRegistrations,
                capacityUtilization,
                maxParticipants: event.maxParticipants,
            },
        };
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return { success: false, error: "Failed to fetch analytics" };
    }
}
