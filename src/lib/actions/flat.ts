"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CreateFlatSchema, UpdateFlatSchema, AssignUserSchema } from "@/lib/validations/flat";
import type { CreateFlatInput, UpdateFlatInput, AssignUserInput } from "@/lib/validations/flat";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized Access");
    }
    return session;
}

export async function getAllFlatsWithDetails() {
    await checkAdmin();

    try {
        const flats = await prisma.flat.findMany({
            include: {
                building: {
                    select: { id: true, name: true, buildingCode: true },
                },
                owner: {
                    select: { id: true, name: true, email: true, phoneNumber: true },
                },
                currentTenant: {
                    select: { id: true, name: true, email: true, phoneNumber: true },
                },
            },
            orderBy: [
                { building: { name: "asc" } },
                { flatNumber: "asc" },
            ],
        });

        return { success: true, data: flats };
    } catch (error) {
        console.error("Error fetching flats:", error);
        return { success: false, error: "Failed to fetch flats" };
    }
}

export async function getFlatsByBuilding(buildingId: string) {
    await checkAdmin();

    try {
        const flats = await prisma.flat.findMany({
            where: { buildingId },
            include: {
                owner: {
                    select: { id: true, name: true, email: true },
                },
                currentTenant: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { flatNumber: "asc" },
        });

        return { success: true, data: flats };
    } catch (error) {
        console.error("Error fetching flats:", error);
        return { success: false, error: "Failed to fetch flats" };
    }
}

export async function createFlat(data: CreateFlatInput) {
    await checkAdmin();

    const validated = CreateFlatSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, error: "Invalid data", details: validated.error.flatten() };
    }

    try {
        const flat = await prisma.flat.create({
            data: {
                buildingId: validated.data.buildingId,
                flatNumber: validated.data.flatNumber,
                floorNumber: validated.data.floorNumber ?? null,
                bhkType: validated.data.bhkType ?? null,
            },
        });

        revalidatePath("/admin/flats");
        revalidatePath(`/admin/buildings/${validated.data.buildingId}`);
        return { success: true, data: flat, message: "Flat created successfully" };
    } catch (error: any) {
        console.error("Error creating flat:", error);

        if (error.code === "P2002") {
            return { success: false, error: "Flat number already exists in this building" };
        }

        if (error.code === "P2003") {
            return { success: false, error: "Building not found" };
        }

        return { success: false, error: "Failed to create flat" };
    }
}

export async function updateFlat(flatId: string, data: UpdateFlatInput) {
    await checkAdmin();

    const validated = UpdateFlatSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, error: "Invalid data", details: validated.error.flatten() };
    }

    try {
        const flat = await prisma.flat.update({
            where: { id: flatId },
            data: {
                ...(validated.data.flatNumber && { flatNumber: validated.data.flatNumber }),
                ...(validated.data.floorNumber !== undefined && { floorNumber: validated.data.floorNumber }),
                ...(validated.data.bhkType !== undefined && { bhkType: validated.data.bhkType }),
            },
        });

        revalidatePath("/admin/flats");
        revalidatePath(`/admin/buildings/${flat.buildingId}`);
        return { success: true, data: flat, message: "Flat updated successfully" };
    } catch (error: any) {
        console.error("Error updating flat:", error);

        if (error.code === "P2002") {
            return { success: false, error: "Flat number already exists in this building" };
        }

        if (error.code === "P2025") {
            return { success: false, error: "Flat not found" };
        }

        return { success: false, error: "Failed to update flat" };
    }
}

export async function deleteFlat(flatId: string) {
    await checkAdmin();

    try {
        const flat = await prisma.flat.findUnique({
            where: { id: flatId },
            select: {
                ownerId: true,
                currentTenantId: true,
                buildingId: true,
            },
        });

        if (!flat) {
            return { success: false, error: "Flat not found" };
        }

        if (flat.ownerId || flat.currentTenantId) {
            return {
                success: false,
                error: "Cannot delete flat with assigned users. Unassign all users first."
            };
        }

        await prisma.flat.delete({
            where: { id: flatId },
        });

        revalidatePath("/admin/flats");
        revalidatePath(`/admin/buildings/${flat.buildingId}`);
        return { success: true, message: "Flat deleted successfully" };
    } catch (error: any) {
        console.error("Error deleting flat:", error);

        if (error.code === "P2025") {
            return { success: false, error: "Flat not found" };
        }

        return { success: false, error: "Failed to delete flat" };
    }
}

export async function assignUserToFlat(flatId: string, data: AssignUserInput) {
    await checkAdmin();

    const validated = AssignUserSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, error: "Invalid data", details: validated.error.flatten() };
    }

    try {
        const { userId, userType } = validated.data;

        const flat = await prisma.flat.findUnique({
            where: { id: flatId },
            select: { id: true, buildingId: true, ownerId: true, currentTenantId: true },
        });

        if (!flat) {
            return { success: false, error: "Flat not found" };
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        if (userType === "OWNER" && flat.ownerId) {
            return { success: false, error: "This flat already has an owner assigned" };
        }
        if (userType === "TENANT" && flat.currentTenantId) {
            return { success: false, error: "This flat already has a tenant assigned" };
        }

        await prisma.$transaction(async (tx) => {
            await tx.flat.update({
                where: { id: flatId },
                data: userType === "OWNER"
                    ? { ownerId: userId }
                    : { currentTenantId: userId },
            });

            await tx.user.update({
                where: { id: userId },
                data: {
                    flatId: flatId,
                    buildingId: flat.buildingId,
                    userType: userType,
                    role: userType === "OWNER" ? "OWNER" : "TENANT",
                },
            });
        });

        revalidatePath("/admin/flats");
        revalidatePath(`/admin/buildings/${flat.buildingId}`);
        revalidatePath("/dashboard/profile");

        return { success: true, message: `User assigned as ${userType.toLowerCase()} successfully` };
    } catch (error: any) {
        console.error("Error assigning user:", error);
        return { success: false, error: "Failed to assign user to flat" };
    }
}

export async function unassignUserFromFlat(flatId: string, userId: string) {
    await checkAdmin();

    try {
        const flat = await prisma.flat.findUnique({
            where: { id: flatId },
            select: { id: true, buildingId: true, ownerId: true, currentTenantId: true },
        });

        if (!flat) {
            return { success: false, error: "Flat not found" };
        }

        const isOwner = flat.ownerId === userId;
        const isTenant = flat.currentTenantId === userId;

        if (!isOwner && !isTenant) {
            return { success: false, error: "User is not assigned to this flat" };
        }

        await prisma.$transaction(async (tx) => {
            await tx.flat.update({
                where: { id: flatId },
                data: isOwner
                    ? { ownerId: null }
                    : { currentTenantId: null },
            });

            await tx.user.update({
                where: { id: userId },
                data: {
                    flatId: null,
                    buildingId: null,
                    userType: null,
                    role: "PUBLIC",
                },
            });
        });

        revalidatePath("/admin/flats");
        revalidatePath(`/admin/buildings/${flat.buildingId}`);
        revalidatePath("/dashboard/profile");

        return { success: true, message: "User unassigned successfully" };
    } catch (error: any) {
        console.error("Error unassigning user:", error);
        return { success: false, error: "Failed to unassign user from flat" };
    }
}

export async function getUnassignedUsers() {
    await checkAdmin();

    try {
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    { flatId: null },
                    { status: "APPROVED" },
                    { role: { not: "ADMIN" } },
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
            },
            orderBy: { name: "asc" },
        });
        return { success: true, data: users };
    } catch (error) {
        console.error("Failed to fetch unassigned users:", error);
        return { success: false, error: "Failed to fetch unassigned users" };
    }
}
