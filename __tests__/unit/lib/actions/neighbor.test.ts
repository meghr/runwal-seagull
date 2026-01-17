import { describe, it, expect, vi, beforeEach } from "vitest";
import { getNeighbors, getNeighborDetails } from "@/lib/actions/neighbor";
import { prismaMock } from "@tests/mocks/prisma";
import { auth } from "@/auth";

vi.mock("@/auth", () => ({
    auth: vi.fn(),
}));

describe("Neighbor Directory Actions", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    const mockSession = { user: { id: "user-1" } };

    describe("getNeighbors", () => {
        it("should return neighbors list", async () => {
            (auth as any).mockResolvedValue(mockSession);

            const mockNeighbors = [
                { id: "1", name: "Neighbor 1", building: { name: "B1" } },
                { id: "2", name: "Neighbor 2", building: { name: "B1" } },
            ];
            prismaMock.user.findMany.mockResolvedValue(mockNeighbors as any);

            const result = await getNeighbors({});

            expect(result.success).toBe(true);
            expect(result.data?.neighbors).toHaveLength(2);
            expect(result.data?.groupedByBuilding).toHaveLength(1);
            expect((result.data?.groupedByBuilding[0] as any).residents).toHaveLength(2);
        });

        it("should apply filters", async () => {
            (auth as any).mockResolvedValue(mockSession);

            await getNeighbors({ buildingId: "bldg-1", search: "John" });

            expect(prismaMock.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        buildingId: "bldg-1",
                        OR: expect.arrayContaining([{ name: expect.any(Object) }]),
                    }),
                })
            );
        });
    });

    describe("getNeighborDetails", () => {
        it("should return neighbor details if found", async () => {
            (auth as any).mockResolvedValue(mockSession);
            prismaMock.user.findFirst.mockResolvedValue({ id: "neighbor-1", name: "Details" } as any);

            const result = await getNeighborDetails("neighbor-1");

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
        });

        it("should return error if not found", async () => {
            (auth as any).mockResolvedValue(mockSession);
            prismaMock.user.findFirst.mockResolvedValue(null);

            const result = await getNeighborDetails("neighbor-1");

            expect(result.success).toBe(false);
            expect(result.error).toBe("Neighbor not found");
        });
    });
});
