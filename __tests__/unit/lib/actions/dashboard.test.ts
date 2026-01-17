import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDashboardStats, getRecentNotices, getMyEventRegistrations } from "@/lib/actions/dashboard";
import { prismaMock } from "@tests/mocks/prisma";
import { auth } from "@/auth";

// Mock dependencies
vi.mock("@/auth", () => ({
    auth: vi.fn(),
}));

describe("User Dashboard Actions", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    const mockSession = { user: { id: "user-1", email: "user@test.com" } };

    describe("getDashboardStats", () => {
        it("should return unauthorized if no session", async () => {
            (auth as any).mockResolvedValue(null);
            const result = await getDashboardStats();
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
        });

        it("should return correct stats data", async () => {
            (auth as any).mockResolvedValue(mockSession);

            // Mock user fetch
            prismaMock.user.findUnique.mockResolvedValue({
                flat: {
                    building: { name: "Building A" },
                    flatNumber: "101",
                },
                userType: "OWNER",
            } as any);

            // Mock counts
            prismaMock.notice.count.mockResolvedValue(5); // new notices
            prismaMock.event.count.mockResolvedValue(3); // upcoming events
            prismaMock.eventRegistration.count.mockResolvedValue(2); // my registrations

            const result = await getDashboardStats();

            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                building: "Building A",
                flatNumber: "101",
                newNoticesCount: 5,
                upcomingEventsCount: 3,
                myRegistrationsCount: 2,
                userType: "OWNER",
            });
        });
    });

    describe("getRecentNotices", () => {
        it("should fetch recent published notices", async () => {
            (auth as any).mockResolvedValue(mockSession);

            const mockNotices = [{ id: "1", title: "Notice 1" }];
            prismaMock.notice.findMany.mockResolvedValue(mockNotices as any);

            const result = await getRecentNotices(5);

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(prismaMock.notice.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ published: true }),
                    take: 5,
                    orderBy: { publishedAt: "desc" },
                })
            );
        });
    });

    describe("getMyEventRegistrations", () => {
        it("should fetch user's upcoming registrations", async () => {
            (auth as any).mockResolvedValue(mockSession);

            const mockRegs = [
                { id: "reg-1", event: { title: "Event 1" } }
            ];
            prismaMock.eventRegistration.findMany.mockResolvedValue(mockRegs as any);

            const result = await getMyEventRegistrations(5);

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(prismaMock.eventRegistration.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ userId: "user-1" }),
                })
            );
        });
    });
});
