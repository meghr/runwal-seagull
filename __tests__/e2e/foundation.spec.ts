import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Phase 1: Foundation & Infrastructure Check", () => {
    test("DB-001 & ENV Tests: System Health Check", async ({ page }, testInfo) => {
        // 1. Navigate to the verification page
        await page.goto("/test-system");

        // 2. Verify page loaded
        await expect(page.locator("h1")).toContainText("System Health Verification");

        // 3. Verify System is Operational (Tests DB and Env)
        // If DB fails, this text won't appear or will say "ISSUES DETECTED"
        await expect(page.locator("text=Status: OPERATIONAL")).toBeVisible({ timeout: 10000 });

        // 4. Verify individual checks pass
        await expect(page.locator("text=DB-001")).toBeVisible();
        await expect(page.locator("text=Database Connection")).toBeVisible();

        await expect(page.locator("text=ENV-001")).toBeVisible();
        await expect(page.locator("text=Env Var: DATABASE_URL")).toBeVisible();

        // 5. Capture Evidence Screenshot
        // Save to the test results folder
        const screenshotPath = testInfo.outputPath("foundation-evidence.png");
        await page.screenshot({ path: screenshotPath, fullPage: true });

        console.log(`Evidence captured at: ${screenshotPath}`);
    });
});
