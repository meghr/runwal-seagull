"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

// Types
export interface UserFilters {
    search?: string;
    role?: UserRole | "ALL";
    status?: UserStatus | "ALL";
    buildingId?: string | "ALL";
}

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    phoneNumber: string | null;
    role: UserRole;
    status: UserStatus;
    userType: string | null;
    profileImageUrl: string | null;
    createdAt: Date;
    approvedAt: Date | null;
    building: { id: string; name: string; buildingCode: string } | null;
    flat: { id: string; flatNumber: string; floorNumber: number | null } | null;
    _count: {
        vehicles: number;
        eventRegistrations: number;
        complaints: number;
    };
}

// Helper to check admin authorization
async function requireAdmin() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        return { authorized: false, error: "Unauthorized access" };
    }
    return { authorized: true, userId: session.user.id };
}

/**
 * Get all users with filters and search
 */
export async function getAdminUsers(filters?: UserFilters) {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
        return { success: false, error: authCheck.error };
    }

    try {
        const where: any = {};

        // Role filter
        if (filters?.role && filters.role !== "ALL") {
            where.role = filters.role;
        }

        // Status filter
        if (filters?.status && filters.status !== "ALL") {
            where.status = filters.status;
        }

        // Building filter
        if (filters?.buildingId && filters.buildingId !== "ALL") {
            where.buildingId = filters.buildingId;
        }

        // Search filter (name, email, flat number)
        if (filters?.search) {
            const searchTerm = filters.search.trim();
            where.OR = [
                { name: { contains: searchTerm, mode: "insensitive" } },
                { email: { contains: searchTerm, mode: "insensitive" } },
                { phoneNumber: { contains: searchTerm } },
                { flat: { flatNumber: { contains: searchTerm, mode: "insensitive" } } },
            ];
        }

        const users = await prisma.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                role: true,
                status: true,
                userType: true,
                profileImageUrl: true,
                createdAt: true,
                approvedAt: true,
                building: {
                    select: { id: true, name: true, buildingCode: true },
                },
                flat: {
                    select: { id: true, flatNumber: true, floorNumber: true },
                },
                _count: {
                    select: {
                        vehicles: true,
                        eventRegistrations: true,
                        complaints: true,
                    },
                },
            },
        });

        return { success: true, data: users };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false, error: "Failed to fetch users" };
    }
}

/**
 * Get single user by ID with detailed information
 */
export async function getAdminUserById(id: string) {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
        return { success: false, error: authCheck.error };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                building: {
                    select: { id: true, name: true, buildingCode: true },
                },
                flat: {
                    select: { id: true, flatNumber: true, floorNumber: true, bhkType: true },
                },
                approver: {
                    select: { id: true, name: true, email: true },
                },
                vehicles: {
                    select: {
                        id: true,
                        vehicleNumber: true,
                        vehicleType: true,
                        brand: true,
                        model: true,
                        color: true,
                        parkingSlot: true,
                    },
                },
                eventRegistrations: {
                    take: 10,
                    orderBy: { registeredAt: "desc" },
                    include: {
                        event: {
                            select: { id: true, title: true, startDate: true },
                        },
                    },
                },
                complaints: {
                    take: 10,
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        complaintNumber: true,
                        subject: true,
                        status: true,
                        createdAt: true,
                    },
                },
                _count: {
                    select: {
                        vehicles: true,
                        eventRegistrations: true,
                        complaints: true,
                        marketplaceAds: true,
                    },
                },
            },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        return { success: true, data: user };
    } catch (error) {
        console.error("Error fetching user:", error);
        return { success: false, error: "Failed to fetch user details" };
    }
}

/**
 * Update user status (suspend/reactivate/approve/reject)
 */
export async function updateUserStatus(
    userId: string,
    newStatus: UserStatus,
    reason?: string
) {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
        return { success: false, error: authCheck.error };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, status: true, email: true },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Prevent self-suspension
        if (userId === authCheck.userId && newStatus === "SUSPENDED") {
            return { success: false, error: "You cannot suspend your own account" };
        }

        const updateData: any = { status: newStatus };

        // If approving, set approver info
        if (newStatus === "APPROVED" && user.status === "PENDING") {
            updateData.approvedBy = authCheck.userId;
            updateData.approvedAt = new Date();
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                userId: authCheck.userId,
                action: `USER_STATUS_CHANGED`,
                entityType: "User",
                entityId: userId,
                details: {
                    userName: user.name,
                    previousStatus: user.status,
                    newStatus,
                    reason: reason || null,
                },
            },
        });

        revalidatePath("/admin/users");
        return {
            success: true,
            message: `User ${user.name} has been ${newStatus.toLowerCase()}`,
        };
    } catch (error) {
        console.error("Error updating user status:", error);
        return { success: false, error: "Failed to update user status" };
    }
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, newRole: UserRole) {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
        return { success: false, error: authCheck.error };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, role: true, status: true },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Prevent self-demotion from ADMIN
        if (userId === authCheck.userId && user.role === "ADMIN" && newRole !== "ADMIN") {
            return { success: false, error: "You cannot demote your own admin account" };
        }

        // Only approved users can be upgraded to admin
        if (newRole === "ADMIN" && user.status !== "APPROVED") {
            return { success: false, error: "Only approved users can be made admins" };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                userId: authCheck.userId,
                action: `USER_ROLE_CHANGED`,
                entityType: "User",
                entityId: userId,
                details: {
                    userName: user.name,
                    previousRole: user.role,
                    newRole,
                },
            },
        });

        revalidatePath("/admin/users");
        return {
            success: true,
            message: `${user.name}'s role has been updated to ${newRole}`,
        };
    } catch (error) {
        console.error("Error updating user role:", error);
        return { success: false, error: "Failed to update user role" };
    }
}

/**
 * Reset user password (Admin triggered)
 * Generates a temporary password
 */
export async function resetUserPassword(userId: string) {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
        return { success: false, error: authCheck.error };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Generate temporary password
        const tempPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: hashedPassword },
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                userId: authCheck.userId,
                action: `PASSWORD_RESET`,
                entityType: "User",
                entityId: userId,
                details: {
                    userName: user.name,
                    initiatedBy: "Admin",
                },
            },
        });

        revalidatePath("/admin/users");
        return {
            success: true,
            message: `Password reset for ${user.name}`,
            tempPassword, // This should be displayed to admin to share with user
        };
    } catch (error) {
        console.error("Error resetting password:", error);
        return { success: false, error: "Failed to reset password" };
    }
}

/**
 * Generate a random temporary password
 */
function generateTemporaryPassword(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

/**
 * Get user activity logs
 */
export async function getUserActivityLogs(userId: string) {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
        return { success: false, error: authCheck.error };
    }

    try {
        // Get logs where user performed action or was the target
        const logs = await prisma.activityLog.findMany({
            where: {
                OR: [
                    { userId },
                    { entityType: "User", entityId: userId },
                ],
            },
            orderBy: { createdAt: "desc" },
            take: 50,
            include: {
                user: {
                    select: { name: true, email: true },
                },
            },
        });

        return { success: true, data: logs };
    } catch (error) {
        console.error("Error fetching activity logs:", error);
        return { success: false, error: "Failed to fetch activity logs" };
    }
}

/**
 * Get all buildings for filter dropdown
 */
export async function getBuildingsForFilter() {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
        return { success: false, error: authCheck.error };
    }

    try {
        const buildings = await prisma.building.findMany({
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                buildingCode: true,
            },
        });

        return { success: true, data: buildings };
    } catch (error) {
        console.error("Error fetching buildings:", error);
        return { success: false, error: "Failed to fetch buildings" };
    }
}

/**
 * Get user statistics for dashboard cards
 */
export async function getUserStats() {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
        return { success: false, error: authCheck.error };
    }

    try {
        const [
            totalUsers,
            pendingUsers,
            approvedUsers,
            suspendedUsers,
            adminCount,
            ownerCount,
            tenantCount,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { status: "PENDING" } }),
            prisma.user.count({ where: { status: "APPROVED" } }),
            prisma.user.count({ where: { status: "SUSPENDED" } }),
            prisma.user.count({ where: { role: "ADMIN" } }),
            prisma.user.count({ where: { userType: "OWNER" } }),
            prisma.user.count({ where: { userType: "TENANT" } }),
        ]);

        return {
            success: true,
            data: {
                totalUsers,
                pendingUsers,
                approvedUsers,
                suspendedUsers,
                adminCount,
                ownerCount,
                tenantCount,
            },
        };
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return { success: false, error: "Failed to fetch statistics" };
    }
}

/**
 * Export users to CSV format
 */
export async function exportUsersToCSV(filters?: UserFilters) {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
        return { success: false, error: authCheck.error };
    }

    try {
        const where: any = {};

        if (filters?.role && filters.role !== "ALL") {
            where.role = filters.role;
        }
        if (filters?.status && filters.status !== "ALL") {
            where.status = filters.status;
        }
        if (filters?.buildingId && filters.buildingId !== "ALL") {
            where.buildingId = filters.buildingId;
        }
        if (filters?.search) {
            const searchTerm = filters.search.trim();
            where.OR = [
                { name: { contains: searchTerm, mode: "insensitive" } },
                { email: { contains: searchTerm, mode: "insensitive" } },
            ];
        }

        const users = await prisma.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                building: { select: { name: true, buildingCode: true } },
                flat: { select: { flatNumber: true, floorNumber: true } },
            },
        });

        // Generate CSV
        const headers = [
            "Name",
            "Email",
            "Phone",
            "Role",
            "Status",
            "User Type",
            "Building",
            "Flat",
            "Floor",
            "Registered On",
            "Approved On",
        ];

        const rows = users.map((user) => [
            user.name,
            user.email,
            user.phoneNumber || "",
            user.role,
            user.status,
            user.userType || "",
            user.building?.name || "",
            user.flat?.flatNumber || "",
            user.flat?.floorNumber?.toString() || "",
            user.createdAt.toISOString().split("T")[0],
            user.approvedAt?.toISOString().split("T")[0] || "",
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row) =>
                row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
            ),
        ].join("\n");

        return { success: true, data: csvContent, filename: `users_export_${new Date().toISOString().split("T")[0]}.csv` };
    } catch (error) {
        console.error("Error exporting users:", error);
        return { success: false, error: "Failed to export users" };
    }
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string) {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
        return { success: false, error: authCheck.error };
    }

    try {
        // Prevent deleting yourself
        if (userId === authCheck.userId) {
            return { success: false, error: "You cannot delete your own account" };
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        revalidatePath("/admin");
        revalidatePath("/admin/users");
        return { success: true, message: "User deleted successfully" };
    } catch (error: any) {
        console.error("Error deleting user:", error);

        // Handle specific prisma errors
        if (error.code === 'P2003') {
            return {
                success: false,
                error: "Cannot delete user. They have associated data (complaints, notices, etc.) that must be removed first."
            };
        }

        return { success: false, error: "Failed to delete user" };
    }
}
