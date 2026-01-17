import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/register/route";
import { prismaMock } from "@tests/mocks/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// Mock bcrypt
vi.mock("bcryptjs", () => {
    const mockHash = vi.fn().mockResolvedValue("hashed_password");
    return {
        __esModule: true,
        default: { hash: mockHash },
        hash: mockHash,
    };
});

// Mock NextResponse
// vi.mock("next/server", () => ({
//    NextResponse: {
//        json: vi.fn((body, init) => ({ body, status: init?.status || 200 })),
//    },
// }));
// Better to use real NextResponse in tests if possible, or mock properly.
// But checking JSON body from Response in jsdom is tricky without polyfills.
// Let's use a simpler mock for unit testing the logic flow.

describe("Registration API", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    const validBody = {
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
        buildingId: "bldg-1",
        flatId: "flat-1",
        userType: "OWNER",
    };

    it("should return 400 for invalid fields", async () => {
        const req = {
            json: async () => ({ ...validBody, email: "invalid-email" }),
        } as any;

        const res = await POST(req);
        // If real NextResponse:
        expect(res.status).toBe(400);
        // const json = await res.json();
        // expect(json.error).toBe("Invalid fields");
    });

    it("should return 409 if user exists", async () => {
        prismaMock.user.findUnique.mockResolvedValue({ id: "existing" } as any);
        const req = {
            json: async () => validBody,
        } as any;

        const res = await POST(req);
        expect(res.status).toBe(409);
    });

    it("should return 400 if flat invalid", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);
        prismaMock.flat.findUnique.mockResolvedValue(null);
        const req = {
            json: async () => validBody,
        } as any;

        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it("should create user successfully", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);
        prismaMock.flat.findUnique.mockResolvedValue({ id: "flat-1" } as any);
        prismaMock.user.create.mockResolvedValue({ id: "new-user" } as any);

        const req = {
            json: async () => validBody,
        } as any;

        const res = await POST(req);

        expect(res.status).toBe(201);
        expect(prismaMock.user.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                email: "test@example.com",
                status: "PENDING",
                role: "PUBLIC",
            }),
        }));
    });
});
