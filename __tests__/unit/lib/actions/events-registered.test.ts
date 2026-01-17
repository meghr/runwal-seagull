import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAllEventsForUser, registerForEvent, cancelEventRegistration } from "@/lib/actions/event";
import { prismaMock } from "@tests/mocks/prisma";
import { auth } from "@/auth";

vi.mock("@/auth", () => ({
    auth: vi.fn(),
}));

describe("User Event Actions", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    const mockSession = { user: { id: "user-1" } };

    describe("getAllEventsForUser", () => {
        it("should return unauthorized if no session", async () => {
            (auth as any).mockResolvedValue(null);
            const result = await getAllEventsForUser({});
            expect(result.success).toBe(false);
        });

        it("should return events with user registration status", async () => {
            (auth as any).mockResolvedValue(mockSession);

            const mockEvents = [
                {
                    id: "evt-1",
                    title: "Event 1",
                    registrations: [{ id: "reg-1" }], // User is registered
                },
                {
                    id: "evt-2",
                    title: "Event 2",
                    registrations: [], // Not registered
                },
            ];

            prismaMock.event.findMany.mockResolvedValue(mockEvents as any);
            prismaMock.event.count.mockResolvedValue(2);

            const result = await getAllEventsForUser({});

            expect(result.success).toBe(true);
            expect(result.data?.events[0].isUserRegistered).toBe(true);
            expect(result.data?.events[1].isUserRegistered).toBe(false);
        });
    });

    describe("registerForEvent", () => {
        const eventId = "evt-1";
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 10);

        it("should check authorization", async () => {
            (auth as any).mockResolvedValue(null);
            const result = await registerForEvent({ eventId });
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
        });

        it("should fail if event not found", async () => {
            (auth as any).mockResolvedValue(mockSession);
            prismaMock.event.findFirst.mockResolvedValue(null);

            const result = await registerForEvent({ eventId });
            expect(result.success).toBe(false);
            expect(result.error).toBe("Event not found");
        });

        it("should fail if registration not required", async () => {
            (auth as any).mockResolvedValue(mockSession);
            prismaMock.event.findFirst.mockResolvedValue({
                id: eventId,
                registrationRequired: false,
                published: true,
            } as any);

            const result = await registerForEvent({ eventId });
            expect(result.error).toContain("does not require registration");
        });

        it("should register successfully for open event", async () => {
            (auth as any).mockResolvedValue(mockSession);
            prismaMock.event.findFirst.mockResolvedValue({
                id: eventId,
                registrationRequired: true,
                published: true,
                maxParticipants: 100,
                _count: { registrations: 50 },
                // Dates valid
            } as any);

            prismaMock.eventRegistration.findFirst.mockResolvedValue(null); // Not already registered
            prismaMock.eventRegistration.create.mockResolvedValue({ id: "new-reg" } as any);

            const result = await registerForEvent({ eventId });

            expect(result.success).toBe(true);
            expect(prismaMock.eventRegistration.create).toHaveBeenCalled();
        });

        it("should fail if duplicate registration", async () => {
            (auth as any).mockResolvedValue(mockSession);
            prismaMock.event.findFirst.mockResolvedValue({
                id: eventId,
                registrationRequired: true,
                published: true,
            } as any);
            prismaMock.eventRegistration.findFirst.mockResolvedValue({ id: "existing" } as any);

            const result = await registerForEvent({ eventId });
            expect(result.error).toContain("already registered");
        });

        it("should fail if event is full", async () => {
            (auth as any).mockResolvedValue(mockSession);
            prismaMock.event.findFirst.mockResolvedValue({
                id: eventId,
                registrationRequired: true,
                published: true,
                maxParticipants: 10,
                _count: { registrations: 10 },
            } as any);

            const result = await registerForEvent({ eventId });
            expect(result.error).toContain("full");
        });
    });

    describe("cancelEventRegistration", () => {
        it("should cancel registration successfully", async () => {
            (auth as any).mockResolvedValue(mockSession);

            // Mock registration found and event in future
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 5);

            prismaMock.eventRegistration.findFirst.mockResolvedValue({
                id: "reg-1",
                event: { title: "Event 1", startDate: futureDate },
            } as any);

            const result = await cancelEventRegistration("reg-1");

            expect(result.success).toBe(true);
            expect(prismaMock.eventRegistration.delete).toHaveBeenCalledWith({
                where: { id: "reg-1" },
            });
        });

        it("should not cancel if event already started", async () => {
            (auth as any).mockResolvedValue(mockSession);

            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);

            prismaMock.eventRegistration.findFirst.mockResolvedValue({
                id: "reg-1",
                event: { title: "Event 1", startDate: pastDate },
            } as any);

            const result = await cancelEventRegistration("reg-1");

            expect(result.success).toBe(false);
            expect(result.error).toContain("already started");
        });
    });
});
