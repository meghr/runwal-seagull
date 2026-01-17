import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset } from "vitest-mock-extended";
import { vi, beforeEach } from "vitest";

// Mock the module globally
vi.mock("@/lib/db", () => ({
    __esModule: true,
    prisma: mockDeep<PrismaClient>(),
}));

import { prismaMock } from "../mocks/prisma";

beforeEach(() => {
    mockReset(prismaMock);
});
