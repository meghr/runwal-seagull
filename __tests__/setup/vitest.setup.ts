/**
 * Vitest Global Setup
 *
 * This file runs before all tests and sets up the testing environment.
 */

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll, vi } from "vitest";
import { server } from "../mocks/server";

// Establish API mocking before all tests
beforeAll(() => {
    server.listen({ onUnhandledRequest: "warn" });
});

// Reset any request handlers that we may add during the tests
afterEach(() => {
    cleanup();
    server.resetHandlers();
});

// Clean up after the tests are finished
afterAll(() => {
    server.close();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
}));

// Mock next-auth
vi.mock("next-auth/react", () => ({
    useSession: vi.fn(() => ({
        data: null,
        status: "unauthenticated",
    })),
    signIn: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
}));

// Mock @/auth
vi.mock("@/auth", () => ({
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    handlers: { GET: vi.fn(), POST: vi.fn() },
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
    readonly root: Element | null = null;
    readonly rootMargin: string = "";
    readonly thresholds: ReadonlyArray<number> = [];

    constructor() { }

    disconnect() { }
    observe() { }
    takeRecords(): IntersectionObserverEntry[] {
        return [];
    }
    unobserve() { }
}

Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
}

Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    value: MockResizeObserver,
});

// Suppress console errors during tests (optional, comment out for debugging)
// const originalError = console.error;
// beforeAll(() => {
//     console.error = (...args: any[]) => {
//         if (
//             typeof args[0] === "string" &&
//             args[0].includes("Warning: ReactDOM.render")
//         ) {
//             return;
//         }
//         originalError.call(console, ...args);
//     };
// });
// afterAll(() => {
//     console.error = originalError;
// });
