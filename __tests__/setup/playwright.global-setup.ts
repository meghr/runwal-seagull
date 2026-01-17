import { FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
    console.log("Global setup: Preparing test environment...");
    // Add any global setup steps here (e.g., seeding database, starting external services)
}

export default globalSetup;
