"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { z } from "zod";

// Validation schemas
const VehicleSchema = z.object({
    vehicleNumber: z.string().min(1, "Vehicle number is required").max(20),
    vehicleType: z.enum(["CAR", "BIKE", "SCOOTER", "OTHER"]),
    brand: z.string().max(50).optional(),
    model: z.string().max(50).optional(),
    color: z.string().max(30).optional(),
    parkingSlot: z.string().max(20).optional(),
});

/**
 * Get all vehicles for the current user
 */
export async function getMyVehicles() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const vehicles = await prisma.vehicle.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return { success: true, data: vehicles };
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        return { success: false, error: "Failed to fetch vehicles" };
    }
}

/**
 * Add a new vehicle
 */
export async function addVehicle(data: z.infer<typeof VehicleSchema>) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Validate data
        const validated = VehicleSchema.parse(data);

        // Check if vehicle number already exists
        const existing = await prisma.vehicle.findUnique({
            where: { vehicleNumber: validated.vehicleNumber.toUpperCase() },
        });

        if (existing) {
            return { success: false, error: "This vehicle number is already registered" };
        }

        // Create vehicle
        const vehicle = await prisma.vehicle.create({
            data: {
                userId: session.user.id,
                vehicleNumber: validated.vehicleNumber.toUpperCase(),
                vehicleType: validated.vehicleType,
                brand: validated.brand || null,
                model: validated.model || null,
                color: validated.color || null,
                parkingSlot: validated.parkingSlot || null,
            },
        });

        return { success: true, data: vehicle, message: "Vehicle added successfully!" };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        console.error("Error adding vehicle:", error);
        return { success: false, error: "Failed to add vehicle" };
    }
}

/**
 * Update a vehicle
 */
export async function updateVehicle(
    vehicleId: string,
    data: Partial<z.infer<typeof VehicleSchema>>
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Check if vehicle belongs to user
        const vehicle = await prisma.vehicle.findFirst({
            where: {
                id: vehicleId,
                userId: session.user.id,
            },
        });

        if (!vehicle) {
            return { success: false, error: "Vehicle not found" };
        }

        // If vehicle number is being updated, check for duplicates
        if (data.vehicleNumber && data.vehicleNumber !== vehicle.vehicleNumber) {
            const existing = await prisma.vehicle.findUnique({
                where: { vehicleNumber: data.vehicleNumber.toUpperCase() },
            });
            if (existing) {
                return { success: false, error: "This vehicle number is already registered" };
            }
        }

        // Update vehicle
        const updated = await prisma.vehicle.update({
            where: { id: vehicleId },
            data: {
                vehicleNumber: data.vehicleNumber?.toUpperCase() || vehicle.vehicleNumber,
                vehicleType: data.vehicleType || vehicle.vehicleType,
                brand: data.brand !== undefined ? data.brand : vehicle.brand,
                model: data.model !== undefined ? data.model : vehicle.model,
                color: data.color !== undefined ? data.color : vehicle.color,
                parkingSlot: data.parkingSlot !== undefined ? data.parkingSlot : vehicle.parkingSlot,
            },
        });

        return { success: true, data: updated, message: "Vehicle updated successfully!" };
    } catch (error) {
        console.error("Error updating vehicle:", error);
        return { success: false, error: "Failed to update vehicle" };
    }
}

/**
 * Delete a vehicle
 */
export async function deleteVehicle(vehicleId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Check if vehicle belongs to user
        const vehicle = await prisma.vehicle.findFirst({
            where: {
                id: vehicleId,
                userId: session.user.id,
            },
        });

        if (!vehicle) {
            return { success: false, error: "Vehicle not found" };
        }

        // Delete vehicle
        await prisma.vehicle.delete({
            where: { id: vehicleId },
        });

        return { success: true, message: "Vehicle deleted successfully!" };
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        return { success: false, error: "Failed to delete vehicle" };
    }
}

/**
 * Search for a vehicle by number
 */
export async function searchVehicle(vehicleNumber: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        if (!vehicleNumber || vehicleNumber.trim().length < 2) {
            return { success: false, error: "Please enter at least 2 characters" };
        }

        // Search for vehicle
        const vehicles = await prisma.vehicle.findMany({
            where: {
                vehicleNumber: {
                    contains: vehicleNumber.toUpperCase(),
                    mode: "insensitive",
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                        profileImageUrl: true,
                        userType: true,
                        building: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        flat: {
                            select: {
                                id: true,
                                flatNumber: true,
                            },
                        },
                    },
                },
            },
            take: 10,
        });

        return {
            success: true,
            data: vehicles,
            message: vehicles.length === 0 ? "No vehicles found" : undefined,
        };
    } catch (error) {
        console.error("Error searching vehicle:", error);
        return { success: false, error: "Failed to search vehicle" };
    }
}

/**
 * Get vehicle details by ID
 */
export async function getVehicleById(vehicleId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const vehicle = await prisma.vehicle.findFirst({
            where: {
                id: vehicleId,
                userId: session.user.id,
            },
        });

        if (!vehicle) {
            return { success: false, error: "Vehicle not found" };
        }

        return { success: true, data: vehicle };
    } catch (error) {
        console.error("Error fetching vehicle:", error);
        return { success: false, error: "Failed to fetch vehicle" };
    }
}
