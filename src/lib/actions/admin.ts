"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized Access");
    }
    return session;
}

export async function getPendingUsers() {
    await checkAdmin();
    try {
        const users = await prisma.user.findMany({
            where: { status: "PENDING" },
            include: {
                building: { select: { name: true, buildingCode: true } },
                flat: { select: { flatNumber: true } }
            },
            orderBy: { createdAt: "desc" },
        });
        return { success: true, data: users };
    } catch (error) {
        return { success: false, error: "Failed to fetch users" };
    }
}

export async function approveUser(userId: string) {
    const session = await checkAdmin();
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                status: "APPROVED",
                approvedAt: new Date(),
                approvedBy: session.user.id,
            },
        });
        revalidatePath("/admin/users");
        return { success: true, message: "User approved successfully" };
    } catch (error) {
        console.error("Approval Error:", error);
        return { success: false, error: "Failed to approve user" };
    }
}

export async function rejectUser(userId: string) {
    await checkAdmin();
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                status: "REJECTED",
            },
        });
        revalidatePath("/admin/users");
        return { success: true, message: "User rejected" };
    } catch (error) {
        return { success: false, error: "Failed to reject user" };
    }
}
