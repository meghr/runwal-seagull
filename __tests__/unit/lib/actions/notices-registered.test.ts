import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAllNoticesForUser, getNoticeByIdForUser } from "@/lib/actions/notice";
import { prismaMock } from "@tests/mocks/prisma";
import { auth } from "@/auth";

// Mock auth
vi.mock("@/auth", () => ({
    auth: vi.fn(),
}));

describe("User Notice Actions", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    const mockSession = { user: { id: "user-1" } };

    describe("getAllNoticesForUser", () => {
        it("should return public and registered notices", async () => {
            prismaMock.notice.count.mockResolvedValue(10);
            prismaMock.notice.findMany.mockResolvedValue([{ id: "1", visibility: "PUBLIC" }] as any);

            const result = await getAllNoticesForUser({});

            expect(result.success).toBe(true);
            expect(result.data?.pagination.total).toBe(10);
            expect(prismaMock.notice.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        visibility: { in: ["PUBLIC", "REGISTERED"] },
                        published: true,
                    }),
                })
            );
        });

        it("should filter by noticeType", async () => {
            await getAllNoticesForUser({ noticeType: "URGENT" });

            expect(prismaMock.notice.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ noticeType: "URGENT" }),
                })
            );
        });

        it("should perform search", async () => {
            await getAllNoticesForUser({ search: "Water" });

            expect(prismaMock.notice.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: expect.arrayContaining([
                            { title: expect.anything() },
                            { content: expect.anything() }
                        ]),
                    }),
                })
            );
        });
    });

    describe("getNoticeByIdForUser", () => {
        it("should return notice if visible to user", async () => {
            prismaMock.notice.findFirst.mockResolvedValue({ id: "1", title: "Test" } as any);

            const result = await getNoticeByIdForUser("1");

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
        });

        it("should return error if not found or not visible", async () => {
            prismaMock.notice.findFirst.mockResolvedValue(null);

            const result = await getNoticeByIdForUser("1");

            expect(result.success).toBe(false);
            expect(result.error).toBe("Notice not found");
        });
    });
});
