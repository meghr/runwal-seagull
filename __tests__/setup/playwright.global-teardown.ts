import { FullConfig } from "@playwright/test";

async function globalTeardown(config: FullConfig) {
    console.log("Global teardown: Cleaning up test environment...");
    // Add any global teardown steps here (e.g., cleaning up database, stopping services)
}

export default globalTeardown;
