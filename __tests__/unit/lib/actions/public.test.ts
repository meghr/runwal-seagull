import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPublicNotices } from "@/lib/actions/notice";
import { getUpcomingEvents } from "@/lib/actions/event";
import { prismaMock } from "@tests/mocks/prisma";

describe("Public Pages Actions", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe("getPublicNotices", () => {
        it("should return public notices successfully", async () => {
            const mockNotices = [
                {
                    id: "notice-1",
                    title: "Public Notice 1",
                    content: "Content 1",
                    noticeType: "GENERAL",
                    attachmentUrls: [],
                    publishedAt: new Date(),
                    creator: { name: "Admin" },
                },
            ];

            prismaMock.notice.findMany.mockResolvedValue(mockNotices as any);

            const result = await getPublicNotices();

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].title).toBe("Public Notice 1");
            expect(prismaMock.notice.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { published: true, visibility: "PUBLIC" },
                })
            );
        });

        it("should handle error during fetching notices", async () => {
            prismaMock.notice.findMany.mockRejectedValue(new Error("DB Error"));

            const result = await getPublicNotices();

            expect(result.success).toBe(false);
            expect(result.error).toBe("Failed to fetch notices");
        });
    });

    describe("getUpcomingEvents", () => {
        it("should return upcoming published events", async () => {
            const mockEvents = [
                {
                    id: "event-1",
                    title: "Upcoming Event",
                    startDate: new Date(),
                    _count: { registrations: 5 },
                },
            ];

            prismaMock.event.findMany.mockResolvedValue(mockEvents as any);

            const result = await getUpcomingEvents();

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(prismaMock.event.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ published: true }),
                })
            );
        });

        it("should handle error during fetching events", async () => {
            prismaMock.event.findMany.mockRejectedValue(new Error("DB Error"));

            const result = await getUpcomingEvents();

            expect(result.success).toBe(false);
            expect(result.error).toBe("Failed to fetch events");
        });
    });
});
