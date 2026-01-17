"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getUpcomingEvents(limit: number = 6) {
    try {
        const now = new Date();

        const events = await prisma.event.findMany({
            where: {
                published: true,
                endDate: {
                    gte: now,
                },
            },
            orderBy: {
                startDate: "asc",
            },
            take: limit,
            select: {
                id: true,
                title: true,
                description: true,
                eventType: true,
                startDate: true,
                endDate: true,
                venue: true,
                registrationRequired: true,
                registrationStartDate: true,
                registrationEndDate: true,
                maxParticipants: true,
                imageUrl: true,
                _count: {
                    select: {
                        registrations: true,
                    },
                },
            },
        });

        return { success: true, data: events };
    } catch (error) {
        console.error("Error fetching upcoming events:", error);
        return { success: false, error: "Failed to fetch events", data: [] };
    }
}

export async function getEventById(id: string) {
    try {
        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        name: true,
                        role: true,
                    },
                },
                _count: {
                    select: {
                        registrations: true,
                    },
                },
            },
        });

        if (!event) {
            return { success: false, error: "Event not found" };
        }

        return { success: true, data: event };
    } catch (error) {
        console.error("Error fetching event:", error);
        return { success: false, error: "Failed to fetch event details" };
    }
}

export async function getEventStatus(event: any) {
    const now = new Date();

    if (!event.registrationRequired) {
        return "NO_REGISTRATION";
    }

    const regStart = event.registrationStartDate ? new Date(event.registrationStartDate) : null;
    const regEnd = event.registrationEndDate ? new Date(event.registrationEndDate) : null;

    if (regStart && now < regStart) {
        return "NOT_STARTED";
    }

    if (regEnd && now > regEnd) {
        return "CLOSED";
    }

    if (event.maxParticipants && event._count?.registrations >= event.maxParticipants) {
        return "FULL";
    }

    return "OPEN";
}

import { auth } from "@/auth";

/**
 * Get all events for registered users with filters and pagination
 */
export async function getAllEventsForUser(params: {
    page?: number;
    limit?: number;
    filter?: "ALL" | "UPCOMING" | "PAST" | "REGISTERED";
    eventType?: string;
    search?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const { page = 1, limit = 20, filter = "UPCOMING", eventType, search } = params;
        const skip = (page - 1) * limit;
        const now = new Date();

        // Build where clause
        const where: any = {
            published: true,
        };

        // Apply date filter
        if (filter === "UPCOMING") {
            where.endDate = { gte: now };
        } else if (filter === "PAST") {
            where.endDate = { lt: now };
        }

        // Add event type filter
        if (eventType && eventType !== "ALL") {
            where.eventType = eventType;
        }

        // Add search filter
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { venue: { contains: search, mode: "insensitive" } },
            ];
        }

        // Get total count
        const totalCount = await prisma.event.count({ where });

        // Fetch events with registration status
        const events = await prisma.event.findMany({
            where,
            orderBy: {
                startDate: filter === "PAST" ? "desc" : "asc",
            },
            skip,
            take: limit,
            select: {
                id: true,
                title: true,
                description: true,
                eventType: true,
                startDate: true,
                endDate: true,
                venue: true,
                registrationRequired: true,
                registrationStartDate: true,
                registrationEndDate: true,
                participationType: true,
                maxParticipants: true,
                imageUrl: true,
                _count: {
                    select: {
                        registrations: true,
                    },
                },
                registrations: {
                    where: {
                        userId: session.user.id,
                    },
                    select: {
                        id: true,
                        registrationStatus: true,
                    },
                },
            },
        });

        // Process events to add computed fields
        const processedEvents = events.map((event) => ({
            ...event,
            isUserRegistered: event.registrations.length > 0,
            userRegistration: event.registrations[0] || null,
        }));

        return {
            success: true,
            data: {
                events: processedEvents,
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    totalPages: Math.ceil(totalCount / limit),
                },
            },
        };
    } catch (error) {
        console.error("Error fetching events for user:", error);
        return { success: false, error: "Failed to fetch events" };
    }
}

/**
 * Get event details for registration
 */
export async function getEventForRegistration(eventId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const event = await prisma.event.findFirst({
            where: {
                id: eventId,
                published: true,
            },
            include: {
                creator: {
                    select: {
                        name: true,
                    },
                },
                _count: {
                    select: {
                        registrations: true,
                    },
                },
                registrations: {
                    where: {
                        userId: session.user.id,
                    },
                },
            },
        });

        if (!event) {
            return { success: false, error: "Event not found" };
        }

        return {
            success: true,
            data: {
                ...event,
                isUserRegistered: event.registrations.length > 0,
                userRegistration: event.registrations[0] || null,
            },
        };
    } catch (error) {
        console.error("Error fetching event for registration:", error);
        return { success: false, error: "Failed to fetch event details" };
    }
}

/**
 * Register for an event
 */
export async function registerForEvent(data: {
    eventId: string;
    teamMembers?: { name: string; email?: string; phone?: string }[];
    additionalNotes?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const { eventId, teamMembers, additionalNotes } = data;

        // Get event details
        const event = await prisma.event.findFirst({
            where: {
                id: eventId,
                published: true,
            },
            include: {
                _count: {
                    select: {
                        registrations: true,
                    },
                },
            },
        });

        if (!event) {
            return { success: false, error: "Event not found" };
        }

        // Check if registration is required
        if (!event.registrationRequired) {
            return { success: false, error: "This event does not require registration" };
        }

        // Check registration period
        const now = new Date();
        if (event.registrationStartDate && now < new Date(event.registrationStartDate)) {
            return { success: false, error: "Registration has not started yet" };
        }
        if (event.registrationEndDate && now > new Date(event.registrationEndDate)) {
            return { success: false, error: "Registration has closed" };
        }

        // Check max participants
        if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
            return { success: false, error: "This event is full" };
        }

        // Check if already registered
        const existingRegistration = await prisma.eventRegistration.findFirst({
            where: {
                eventId,
                userId: session.user.id,
            },
        });

        if (existingRegistration) {
            return { success: false, error: "You are already registered for this event" };
        }

        // Validate team members for team events
        if (event.participationType === "TEAM" && (!teamMembers || teamMembers.length === 0)) {
            return { success: false, error: "Team members are required for this event" };
        }

        // Create registration
        const registration = await prisma.eventRegistration.create({
            data: {
                eventId,
                userId: session.user.id,
                teamMembers: teamMembers ? teamMembers : undefined,
                additionalNotes: additionalNotes || null,
                registrationStatus: "REGISTERED",
            },
            include: {
                event: {
                    select: {
                        title: true,
                        startDate: true,
                        venue: true,
                    },
                },
            },
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/events");
        revalidatePath("/dashboard/events/my-registrations");

        return {
            success: true,
            data: registration,
            message: `Successfully registered for ${event.title}!`,
        };
    } catch (error) {
        console.error("Error registering for event:", error);
        return { success: false, error: "Failed to register for event" };
    }
}

/**
 * Cancel event registration
 */
export async function cancelEventRegistration(registrationId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Get registration
        const registration = await prisma.eventRegistration.findFirst({
            where: {
                id: registrationId,
                userId: session.user.id,
            },
            include: {
                event: true,
            },
        });

        if (!registration) {
            return { success: false, error: "Registration not found" };
        }

        // Check if event has already started
        if (new Date(registration.event.startDate) < new Date()) {
            return { success: false, error: "Cannot cancel registration for an event that has already started" };
        }

        // Delete registration
        await prisma.eventRegistration.delete({
            where: {
                id: registrationId,
            },
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/events");
        revalidatePath("/dashboard/events/my-registrations");

        return {
            success: true,
            message: `Successfully cancelled registration for ${registration.event.title}`,
        };
    } catch (error) {
        console.error("Error cancelling registration:", error);
        return { success: false, error: "Failed to cancel registration" };
    }
}

/**
 * Get user's event registrations
 */
export async function getMyEventRegistrations(params: {
    page?: number;
    limit?: number;
    filter?: "ALL" | "UPCOMING" | "PAST";
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const { page = 1, limit = 20, filter = "UPCOMING" } = params;
        const skip = (page - 1) * limit;
        const now = new Date();

        // Build where clause
        const where: any = {
            userId: session.user.id,
        };

        if (filter === "UPCOMING") {
            where.event = { endDate: { gte: now } };
        } else if (filter === "PAST") {
            where.event = { endDate: { lt: now } };
        }

        // Get total count
        const totalCount = await prisma.eventRegistration.count({ where });

        // Fetch registrations
        const registrations = await prisma.eventRegistration.findMany({
            where,
            orderBy: {
                event: {
                    startDate: filter === "PAST" ? "desc" : "asc",
                },
            },
            skip,
            take: limit,
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        eventType: true,
                        startDate: true,
                        endDate: true,
                        venue: true,
                        participationType: true,
                        imageUrl: true,
                    },
                },
            },
        });

        return {
            success: true,
            data: {
                registrations,
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    totalPages: Math.ceil(totalCount / limit),
                },
            },
        };
    } catch (error) {
        console.error("Error fetching user registrations:", error);
        return { success: false, error: "Failed to fetch your registrations" };
    }
}
