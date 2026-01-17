import { describe, it, expect } from "vitest";

describe("Foundation & Infrastructure", () => {
    describe("Environment Variables", () => {
        it("should have DATABASE_URL defined", () => {
            expect(process.env.DATABASE_URL).toBeDefined();
            expect(process.env.DATABASE_URL).toContain("postgresql://");
        });

        it("should have NEXTAUTH_SECRET defined", () => {
            expect(process.env.NEXTAUTH_SECRET).toBeDefined();
            expect(process.env.NEXTAUTH_SECRET!.length).toBeGreaterThan(0);
        });

        it("should have NEXTAUTH_URL defined", () => {
            expect(process.env.NEXTAUTH_URL).toBeDefined();
        });
    });

    describe("Prisma Configuration", () => {
        it("should have Prisma client initialized (mocked)", async () => {
            // We verify that we can import prisma and it's a mock
            const { prisma } = await import("@/lib/db");
            expect(prisma).toBeDefined();
        });
    });
});
