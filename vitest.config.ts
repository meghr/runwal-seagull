/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

export default defineConfig({
    plugins: [react()],
    test: {
        // Environment
        environment: "jsdom",

        // Setup files
        setupFiles: ["./__tests__/setup/vitest.setup.ts", "./__tests__/setup/prisma-mock.ts"],

        // Global test APIs
        globals: true,

        // Include patterns
        include: [
            "__tests__/unit/**/*.{test,spec}.{ts,tsx}",
            "__tests__/integration/**/*.{test,spec}.{ts,tsx}",
        ],

        // Exclude patterns
        exclude: [
            "node_modules",
            "__tests__/e2e/**/*",
            "__tests__/fixtures/**/*",
            "__tests__/mocks/**/*",
            "__tests__/helpers/**/*",
        ],

        // Coverage configuration
        coverage: {
            provider: "v8",
            reporter: ["text", "text-summary", "json", "html", "lcov"],
            reportsDirectory: "./coverage",
            exclude: [
                "node_modules/",
                "__tests__/",
                "*.config.*",
                "src/lib/db.ts",
                "prisma/",
                ".next/",
                "coverage/",
                "**/*.d.ts",
                "**/types/**",
            ],
            thresholds: {
                global: {
                    branches: 80,
                    functions: 85,
                    lines: 85,
                    statements: 85,
                },
            },
        },

        // Test timeout
        testTimeout: 10000,

        // Hook timeout
        hookTimeout: 10000,

        // Retry failed tests
        retry: 1,

        // Reporter
        reporters: ["verbose"],

        // Pool configuration
        pool: "forks",
        poolOptions: {
            forks: {
                singleFork: true,
            },
        },

        // Mock configuration
        mockReset: true,
        restoreMocks: true,
        clearMocks: true,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@tests": path.resolve(__dirname, "./__tests__"),
        },
    },
});
