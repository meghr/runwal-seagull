import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateUserStatus } from "@/lib/actions/admin-user";
import { prismaMock } from "@tests/mocks/prisma";
import { auth } from "@/auth";

// Mock auth
vi.mock("@/auth", () => ({
    auth: vi.fn(),
}));

// Mock revalidatePath
vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

describe("Admin User Approval", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("should return error if not admin", async () => {
        (auth as any).mockResolvedValue({ user: { role: "USER" } });

        const result = await updateUserStatus("user-1", "APPROVED");

        expect(result.success).toBe(false);
        expect(result.error).toBe("Unauthorized access");
    });

    it("should approve user successfully", async () => {
        (auth as any).mockResolvedValue({ user: { role: "ADMIN", id: "admin-1" } });

        // Mock user found
        prismaMock.user.findUnique.mockResolvedValue({
            id: "user-1",
            name: "Test User",
            status: "PENDING",
            email: "test@example.com"
        } as any);

        prismaMock.user.update.mockResolvedValue({
            id: "user-1",
            status: "APPROVED",
        } as any);

        const result = await updateUserStatus("user-1", "APPROVED");

        expect(result.success).toBe(true);
        expect(prismaMock.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: "user-1" },
                data: expect.objectContaining({
                    status: "APPROVED",
                    approvedBy: "admin-1",
                }),
            })
        );
    });

    it("should reject user successfully", async () => {
        (auth as any).mockResolvedValue({ user: { role: "ADMIN", id: "admin-1" } });

        // Mock user found
        prismaMock.user.findUnique.mockResolvedValue({
            id: "user-1",
            name: "Test User",
            status: "PENDING",
            email: "test@example.com"
        } as any);

        prismaMock.user.update.mockResolvedValue({
            id: "user-1",
            status: "REJECTED",
        } as any);

        const result = await updateUserStatus("user-1", "REJECTED");

        expect(result.success).toBe(true);
        expect(result.message).toContain("rejected");
    });
});
