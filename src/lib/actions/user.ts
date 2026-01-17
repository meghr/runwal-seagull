"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ProfileSchema, ProfileInput } from "@/lib/validations/user";
import { revalidatePath } from "next/cache";

export async function getUserProfile() {
    const session = await auth();

    if (!session?.user?.id) {
        return null;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                building: {
                    select: { name: true, buildingCode: true }
                },
                flat: {
                    select: { flatNumber: true, floorNumber: true }
                }
            }
        });
        return user;
    } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
    }
}

export async function updateProfile(data: ProfileInput) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const validated = ProfileSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, error: "Invalid data", details: validated.error.flatten() };
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: validated.data.name,
                phoneNumber: validated.data.phoneNumber || null,
                profileImageUrl: validated.data.profileImageUrl,
                isProfilePublic: validated.data.isProfilePublic,
            },
        });

        revalidatePath("/dashboard/profile");
        revalidatePath("/dashboard");
        return { success: true, message: "Profile updated successfully" };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: "Failed to update profile" };
    }
}
