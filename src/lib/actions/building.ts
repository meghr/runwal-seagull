"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CreateBuildingSchema, UpdateBuildingSchema } from "@/lib/validations/building";
import type { CreateBuildingInput, UpdateBuildingInput } from "@/lib/validations/building";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized Access");
    }
    return session;
}

export async function getAllBuildingsWithStats() {
    await checkAdmin();

    try {
        const buildings = await prisma.building.findMany({
            include: {
                flats: {
                    select: {
                        id: true,
                        ownerId: true,
                        currentTenantId: true,
                    },
                },
            },
            orderBy: { name: "asc" },
        });

        const buildingsWithStats = buildings.map((building) => {
            const totalFlats = building.flats.length;
            const occupiedFlats = building.flats.filter(
                (flat) => flat.ownerId || flat.currentTenantId
            ).length;
            const vacantFlats = totalFlats - occupiedFlats;
            const occupancyRate = totalFlats > 0 ? (occupiedFlats / totalFlats) * 100 : 0;

            return {
                id: building.id,
                name: building.name,
                buildingCode: building.buildingCode,
                totalFloors: building.totalFloors,
                description: building.description,
                isActiveForRegistration: building.isActiveForRegistration,
                createdAt: building.createdAt,
                totalFlats,
                occupiedFlats,
                vacantFlats,
                occupancyRate: Math.round(occupancyRate),
            };
        });

        return { success: true, data: buildingsWithStats };
    } catch (error) {
        console.error("Error fetching buildings:", error);
        return { success: false, error: "Failed to fetch buildings" };
    }
}

export async function getBuildingDetails(buildingId: string) {
    await checkAdmin();

    try {
        const building = await prisma.building.findUnique({
            where: { id: buildingId },
            include: {
                flats: {
                    include: {
                        owner: {
                            select: { id: true, name: true, email: true, phoneNumber: true },
                        },
                        currentTenant: {
                            select: { id: true, name: true, email: true, phoneNumber: true },
                        },
                    },
                    orderBy: { flatNumber: "asc" },
                },
            },
        });

        if (!building) {
            return { success: false, error: "Building not found" };
        }

        return { success: true, data: building };
    } catch (error) {
        console.error("Error fetching building details:", error);
        return { success: false, error: "Failed to fetch building details" };
    }
}

export async function createBuilding(data: CreateBuildingInput) {
    await checkAdmin();

    const validated = CreateBuildingSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, error: "Invalid data", details: validated.error.flatten() };
    }

    try {
        const building = await prisma.building.create({
            data: {
                name: validated.data.name,
                buildingCode: validated.data.buildingCode,
                totalFloors: validated.data.totalFloors ?? null,
                description: validated.data.description ?? null,
                isActiveForRegistration: validated.data.isActiveForRegistration ?? true,
            },
        });

        revalidatePath("/admin/buildings");
        return { success: true, data: building, message: "Building created successfully" };
    } catch (error: any) {
        console.error("Error creating building:", error);

        if (error.code === "P2002") {
            return { success: false, error: "Building code already exists" };
        }

        return { success: false, error: error.message || "Failed to create building" };
    }
}

export async function updateBuilding(buildingId: string, data: UpdateBuildingInput) {
    await checkAdmin();

    const validated = UpdateBuildingSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, error: "Invalid data", details: validated.error.flatten() };
    }

    try {
        const building = await prisma.building.update({
            where: { id: buildingId },
            data: {
                ...(validated.data.name && { name: validated.data.name }),
                ...(validated.data.buildingCode && { buildingCode: validated.data.buildingCode }),
                ...(validated.data.totalFloors !== undefined && { totalFloors: validated.data.totalFloors }),
                ...(validated.data.description !== undefined && { description: validated.data.description }),
                ...(validated.data.isActiveForRegistration !== undefined && { isActiveForRegistration: validated.data.isActiveForRegistration }),
            },
        });

        revalidatePath("/admin/buildings");
        revalidatePath(`/admin/buildings/${buildingId}`);
        return { success: true, data: building, message: "Building updated successfully" };
    } catch (error: any) {
        console.error("Error updating building:", error);

        if (error.code === "P2002") {
            return { success: false, error: "Building code already exists" };
        }

        if (error.code === "P2025") {
            return { success: false, error: "Building not found" };
        }

        return { success: false, error: error.message || "Failed to update building" };
    }
}

export async function deleteBuilding(buildingId: string) {
    await checkAdmin();

    try {
        const flatsCount = await prisma.flat.count({
            where: { buildingId },
        });

        if (flatsCount > 0) {
            return {
                success: false,
                error: `Cannot delete building with ${flatsCount} existing flats. Remove all flats first.`
            };
        }

        await prisma.building.delete({
            where: { id: buildingId },
        });

        revalidatePath("/admin/buildings");
        return { success: true, message: "Building deleted successfully" };
    } catch (error: any) {
        console.error("Error deleting building:", error);

        if (error.code === "P2025") {
            return { success: false, error: "Building not found" };
        }

        return { success: false, error: "Failed to delete building" };
    }
}
