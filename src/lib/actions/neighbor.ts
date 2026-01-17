"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export interface NeighborFilters {
    buildingId?: string;
    search?: string;
    userType?: "ALL" | "OWNER" | "TENANT";
}

/**
 * Get all buildings for filter dropdown
 */
export async function getBuildingsForDirectory() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const buildings = await prisma.building.findMany({
            select: {
                id: true,
                name: true,
                buildingCode: true,
                _count: {
                    select: {
                        users: {
                            where: {
                                status: "APPROVED",
                                role: { in: ["OWNER", "TENANT"] },
                                isProfilePublic: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        return { success: true, data: buildings };
    } catch (error) {
        console.error("Error fetching buildings:", error);
        return { success: false, error: "Failed to fetch buildings" };
    }
}

/**
 * Get neighbors/residents based on filters
 */
export async function getNeighbors(filters: NeighborFilters = {}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const { buildingId, search, userType } = filters;

        // Build where clause
        const where: any = {
            status: "APPROVED",
            role: { in: ["OWNER", "TENANT"] },
            isProfilePublic: true,
        };

        // Filter by building
        if (buildingId) {
            where.buildingId = buildingId;
        }

        // Filter by user type
        if (userType && userType !== "ALL") {
            where.userType = userType;
        }

        // Search by name, email, or flat number
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { flat: { flatNumber: { contains: search, mode: "insensitive" } } },
            ];
        }

        const neighbors = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                userType: true,
                profileImageUrl: true,
                building: {
                    select: {
                        id: true,
                        name: true,
                        buildingCode: true,
                    },
                },
                flat: {
                    select: {
                        id: true,
                        flatNumber: true,
                        floorNumber: true,
                    },
                },
            },
            orderBy: [
                { building: { name: "asc" } },
                { flat: { flatNumber: "asc" } },
                { name: "asc" },
            ],
        });

        // Group by building for building-wise view
        const groupedByBuilding = neighbors.reduce((acc: any, neighbor) => {
            const buildingName = neighbor.building?.name || "Unassigned";
            if (!acc[buildingName]) {
                acc[buildingName] = {
                    building: neighbor.building,
                    residents: [],
                };
            }
            acc[buildingName].residents.push(neighbor);
            return acc;
        }, {});

        return {
            success: true,
            data: {
                neighbors,
                groupedByBuilding: Object.values(groupedByBuilding),
                totalCount: neighbors.length,
            },
        };
    } catch (error) {
        console.error("Error fetching neighbors:", error);
        return { success: false, error: "Failed to fetch neighbors" };
    }
}

/**
 * Get a single neighbor's details
 */
export async function getNeighborDetails(userId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const neighbor = await prisma.user.findFirst({
            where: {
                id: userId,
                status: "APPROVED",
                role: { in: ["OWNER", "TENANT"] },
            },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                userType: true,
                profileImageUrl: true,
                createdAt: true,
                building: {
                    select: {
                        id: true,
                        name: true,
                        buildingCode: true,
                    },
                },
                flat: {
                    select: {
                        id: true,
                        flatNumber: true,
                        floorNumber: true,
                        bhkType: true,
                    },
                },
                vehicles: {
                    select: {
                        id: true,
                        vehicleNumber: true,
                        vehicleType: true,
                        brand: true,
                        model: true,
                        color: true,
                    },
                },
            },
        });

        if (!neighbor) {
            return { success: false, error: "Neighbor not found" };
        }

        return { success: true, data: neighbor };
    } catch (error) {
        console.error("Error fetching neighbor details:", error);
        return { success: false, error: "Failed to fetch neighbor details" };
    }
}

/**
 * Generate vCard data for a neighbor
 */
export async function generateVCard(userId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const neighbor = await prisma.user.findFirst({
            where: {
                id: userId,
                status: "APPROVED",
                role: { in: ["OWNER", "TENANT"] },
            },
            select: {
                name: true,
                email: true,
                phoneNumber: true,
                building: {
                    select: {
                        name: true,
                    },
                },
                flat: {
                    select: {
                        flatNumber: true,
                    },
                },
            },
        });

        if (!neighbor) {
            return { success: false, error: "Neighbor not found" };
        }

        // Generate vCard format
        const vCardLines = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `FN:${neighbor.name}`,
            `N:${neighbor.name.split(" ").reverse().join(";")};;;`,
        ];

        if (neighbor.email) {
            vCardLines.push(`EMAIL:${neighbor.email}`);
        }

        if (neighbor.phoneNumber) {
            vCardLines.push(`TEL;TYPE=CELL:${neighbor.phoneNumber}`);
        }

        if (neighbor.building && neighbor.flat) {
            vCardLines.push(
                `ADR;TYPE=HOME:;;${neighbor.flat.flatNumber};${neighbor.building.name};;;India`
            );
            vCardLines.push(`ORG:Runwal Seagull - ${neighbor.building.name}`);
        }

        vCardLines.push("END:VCARD");

        return {
            success: true,
            data: {
                vCard: vCardLines.join("\n"),
                fileName: `${neighbor.name.replace(/\s+/g, "_")}.vcf`,
            },
        };
    } catch (error) {
        console.error("Error generating vCard:", error);
        return { success: false, error: "Failed to generate vCard" };
    }
}
