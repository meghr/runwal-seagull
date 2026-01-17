import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

/**
 * Playwright E2E Test Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    // Test directory
    testDir: "./__tests__/e2e",

    // Test file patterns
    testMatch: "**/*.{test,spec}.{ts,tsx}",

    // Parallel execution settings
    fullyParallel: false, // Run tests sequentially for database consistency
    workers: 1,

    // Retry on failure
    retries: process.env.CI ? 2 : 1,

    // Reporter configuration
    reporter: [
        ["list"],
        ["html", { outputFolder: "playwright-report", open: "never" }],
        ["json", { outputFile: "playwright-report/results.json" }],
    ],

    // Shared settings for all projects
    use: {
        // Base URL for navigation
        baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",

        // Capture trace
        trace: "on",

        // Screenshot on failure
        screenshot: "only-on-failure",

        // Video
        video: "on",

        // Action timeout
        actionTimeout: 15000,

        // Navigation timeout
        navigationTimeout: 30000,

        // Ignore HTTPS errors for local testing
        ignoreHTTPSErrors: true,
    },

    // Global timeout for each test
    timeout: 60000,

    // Expect timeout
    expect: {
        timeout: 10000,
    },

    // Projects for different browsers
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
        // Uncomment to add more browsers
        // {
        //     name: "firefox",
        //     use: { ...devices["Desktop Firefox"] },
        // },
        // {
        //     name: "webkit",
        //     use: { ...devices["Desktop Safari"] },
        // },
        // Mobile viewport
        // {
        //     name: "mobile-chrome",
        //     use: { ...devices["Pixel 5"] },
        // },
    ],

    // Local development server configuration
    webServer: {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },

    // Output directory for test artifacts
    outputDir: "playwright-results",

    // Global setup and teardown
    globalSetup: "./__tests__/setup/playwright.global-setup.ts",
    globalTeardown: "./__tests__/setup/playwright.global-teardown.ts",
});
