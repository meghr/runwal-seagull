import { describe, it, expect, vi, beforeEach } from "vitest";
import { addVehicle, searchVehicle, deleteVehicle, updateVehicle } from "@/lib/actions/vehicle";
import { prismaMock } from "@tests/mocks/prisma";
import { auth } from "@/auth";

vi.mock("@/auth", () => ({
    auth: vi.fn(),
}));

describe("Vehicle Management Actions", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    const mockSession = { user: { id: "user-1" } };

    describe("addVehicle", () => {
        const validData = {
            vehicleNumber: "MH01AB1234",
            vehicleType: "CAR" as const,
            brand: "Honda",
        };

        it("should validate input", async () => {
            (auth as any).mockResolvedValue(mockSession);
            const result = await addVehicle({ ...validData, vehicleNumber: "" });
            expect(result.success).toBe(false);
            expect(result.error).toContain("required");
        });

        it("should prevent duplicate vehicle number", async () => {
            (auth as any).mockResolvedValue(mockSession);
            prismaMock.vehicle.findUnique.mockResolvedValue({ id: "existing" } as any);

            const result = await addVehicle(validData);
            expect(result.success).toBe(false);
            expect(result.error).toContain("already registered");
        });

        it("should create vehicle successfully", async () => {
            (auth as any).mockResolvedValue(mockSession);
            prismaMock.vehicle.findUnique.mockResolvedValue(null);
            prismaMock.vehicle.create.mockResolvedValue({ id: "new-veh" } as any);

            const result = await addVehicle(validData);

            expect(result.success).toBe(true);
            expect(prismaMock.vehicle.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    userId: "user-1",
                    vehicleNumber: "MH01AB1234",
                }),
            });
        });
    });

    describe("searchVehicle", () => {
        it("should return matches", async () => {
            (auth as any).mockResolvedValue(mockSession);
            prismaMock.vehicle.findMany.mockResolvedValue([{ vehicleNumber: "MH01" }] as any);

            const result = await searchVehicle("MH01");

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
        });
    });

    describe("deleteVehicle", () => {
        it("should delete user's vehicle", async () => {
            (auth as any).mockResolvedValue(mockSession);
            prismaMock.vehicle.findFirst.mockResolvedValue({ id: "veh-1" } as any);

            const result = await deleteVehicle("veh-1");

            expect(result.success).toBe(true);
            expect(prismaMock.vehicle.delete).toHaveBeenCalledWith({ where: { id: "veh-1" } });
        });

        it("should not delete other's vehicle", async () => {
            (auth as any).mockResolvedValue(mockSession);
            prismaMock.vehicle.findFirst.mockResolvedValue(null); // Not found for this user

            const result = await deleteVehicle("veh-1");

            expect(result.success).toBe(false);
            expect(result.error).toBe("Vehicle not found");
        });
    });
});
