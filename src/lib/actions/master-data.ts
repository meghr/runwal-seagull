"use server";

import { prisma } from "@/lib/db";

export async function getBuildings() {
    try {
        const buildings = await prisma.building.findMany({
            where: { isActiveForRegistration: true },
            select: { id: true, name: true, buildingCode: true },
            orderBy: { buildingCode: "asc" },
        });
        return buildings;
    } catch (error) {
        console.error("Failed to fetch buildings:", error);
        return [];
    }
}

export async function getFlats(buildingId: string) {
    try {
        const flats = await prisma.flat.findMany({
            where: { buildingId },
            select: { id: true, flatNumber: true },
            orderBy: { flatNumber: "asc" },
        });
        return flats;
    } catch (error) {
        console.error("Failed to fetch flats:", error);
        return [];
    }
}
