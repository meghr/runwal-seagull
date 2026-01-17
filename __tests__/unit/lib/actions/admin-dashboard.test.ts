import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAdminStats } from "@/lib/actions/admin-dashboard";
import { prismaMock } from "@tests/mocks/prisma";
import { auth } from "@/auth";

// Mock auth
vi.mock("@/auth", () => ({
    auth: vi.fn(),
}));

describe("getAdminStats", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("should return error if user is not authorized", async () => {
        (auth as any).mockResolvedValue({
            user: { role: "USER" },
        });

        const result = await getAdminStats();

        expect(result.success).toBe(false);
        expect(result.error).toBe("Unauthorized access");
    });

    it("should return stats if user is admin", async () => {
        (auth as any).mockResolvedValue({
            user: { role: "ADMIN" },
        });

        // Mock database responses
        prismaMock.user.count.mockResolvedValueOnce(100); // totalUsers
        prismaMock.user.count.mockResolvedValueOnce(5); // pendingApprovals
        prismaMock.marketplaceAd.count.mockResolvedValueOnce(20); // activeAds
        prismaMock.notice.count.mockResolvedValueOnce(10); // totalNotices
        prismaMock.event.count.mockResolvedValueOnce(8); // totalEvents
        prismaMock.complaint.count.mockResolvedValueOnce(3); // openComplaints

        const result = await getAdminStats();

        expect(result.success).toBe(true);
        expect(result.data).toEqual({
            totalUsers: 100,
            pendingApprovals: 5,
            activeAds: 20,
            totalNotices: 10,
            totalEvents: 8,
            openComplaints: 3,
        });
    });
});
