import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserProfile, updateProfile } from "@/lib/actions/user";
import { prismaMock } from "@tests/mocks/prisma";
import { auth } from "@/auth";

// Mock dependencies
vi.mock("@/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

const mockSession = {
    user: { id: "user-123", email: "user@test.com", role: "OWNER" },
};

describe("User Profile Actions", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe("getUserProfile", () => {
        it("should return null if not authenticated", async () => {
            (auth as any).mockResolvedValue(null);

            const result = await getUserProfile();

            expect(result).toBeNull();
        });

        it("should return user profile if authenticated", async () => {
            (auth as any).mockResolvedValue(mockSession);

            const mockUser = {
                id: "user-123",
                name: "Test User",
                email: "user@test.com",
                building: { name: "Building A", buildingCode: "A" },
                flat: { flatNumber: "101", floorNumber: 1 },
            };

            prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

            const result = await getUserProfile();

            expect(result).toEqual(mockUser);
            expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
                where: { id: "user-123" },
                include: expect.any(Object),
            });
        });

        it("should return null on DB error", async () => {
            (auth as any).mockResolvedValue(mockSession);
            prismaMock.user.findUnique.mockRejectedValue(new Error("DB Error"));

            const result = await getUserProfile();

            expect(result).toBeNull();
        });
    });

    describe("updateProfile", () => {
        const validData = {
            name: "Updated Name",
            phoneNumber: "9876543210",
        };

        it("should return error if not authenticated", async () => {
            (auth as any).mockResolvedValue(null);

            const result = await updateProfile(validData);

            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
        });

        it("should update profile successfully", async () => {
            (auth as any).mockResolvedValue(mockSession);
            prismaMock.user.update.mockResolvedValue({ id: "user-123" } as any);

            const result = await updateProfile(validData);

            expect(result.success).toBe(true);
            expect(result.message).toContain("successfully");
            expect(prismaMock.user.update).toHaveBeenCalledWith({
                where: { id: "user-123" },
                data: expect.objectContaining({
                    name: "Updated Name",
                    phoneNumber: "9876543210",
                }),
            });
        });

        it("should fail validation with invalid data", async () => {
            (auth as any).mockResolvedValue(mockSession);
            const invalidData = {
                name: "A", // too short
                phoneNumber: "invalid", // invalid phone format
            };

            const result = await updateProfile(invalidData as any);

            expect(result.success).toBe(false);
            expect(result.error).toBe("Invalid data");
        });
    });
});
