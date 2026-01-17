import { test, expect } from "@playwright/test";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

test.describe("Phase 3: Public Pages - Landing Page Tests", () => {
    // Shared user for creating content
    let adminUserId: string;
    const adminEmail = "landing-admin@test.com";

    // Test Data
    const buildingCode = "LAND_B";
    const publicNoticeTitle = "Public Notice for Landing Page";
    const publicEventTitle = "Public Event for Landing Page";

    test.beforeAll(async () => {
        // Cleanup existing data
        await prisma.notice.deleteMany({ where: { title: publicNoticeTitle } });
        await prisma.event.deleteMany({ where: { title: publicEventTitle } });
        await prisma.user.deleteMany({ where: { email: adminEmail } });
        await prisma.building.deleteMany({ where: { buildingCode } });

        // Create Building
        const building = await prisma.building.create({
            data: {
                name: "Landing Test Building",
                buildingCode,
                totalFloors: 2,
            },
        });

        // Create Admin User
        const hashedPassword = await bcrypt.hash("password123", 10);
        const user = await prisma.user.create({
            data: {
                email: adminEmail,
                name: "Landing Admin",
                passwordHash: hashedPassword,
                role: "ADMIN",
                status: "APPROVED",
                buildingId: building.id,
                phoneNumber: "+919999999999",
            },
        });
        adminUserId = user.id;

        // Seed Public Notice
        await prisma.notice.create({
            data: {
                title: publicNoticeTitle,
                content: "This is a public notice content for E2E testing.",
                noticeType: "GENERAL",
                visibility: "PUBLIC",
                published: true,
                publishedAt: new Date(),
                creator: { connect: { id: adminUserId } },
            },
        });

        // Seed Public Upcoming Event
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        await prisma.event.create({
            data: {
                title: publicEventTitle,
                description: "This is a public event for E2E testing.",
                eventType: "SOCIAL",
                startDate: nextMonth,
                endDate: nextMonth,
                venue: "Community Hall",
                published: true,
                creator: { connect: { id: adminUserId } },
            },
        });

        console.log("Seeded Landing Page Data");
    });

    test.afterAll(async () => {
        // Cleanup
        await prisma.notice.deleteMany({ where: { title: publicNoticeTitle } });
        await prisma.event.deleteMany({ where: { title: publicEventTitle } });
        await prisma.user.deleteMany({ where: { email: adminEmail } });
        await prisma.building.deleteMany({ where: { buildingCode } });
    });

    test("LAND-001: Page loads and Hero section visible", async ({ page }) => {
        await page.goto("/");
        // Check for Hero Section text - use .first() to avoid strict mode violations
        await expect(page.locator("text=Smart Living for").first()).toBeVisible();
        await expect(page.locator("text=Modern Communities").first()).toBeVisible();

        // Check for Get Started / Sign In buttons in Hero
        await expect(page.locator('button:has-text("Get Started")').first()).toBeVisible();
        await expect(page.locator('button:has-text("Sign In")').first()).toBeVisible();
    });

    test("LAND-002: Public notices display", async ({ page }) => {
        await page.goto("/");

        // Scroll to notices section (optional, but good for visibility)
        const noticesSection = page.locator("#notices");
        await noticesSection.scrollIntoViewIfNeeded();

        // Check if the seeded notice is visible
        await expect(page.locator(`text=${publicNoticeTitle}`)).toBeVisible();

        // Verify 'Latest Notices' heading
        await expect(page.locator("text=Latest Notices")).toBeVisible();
    });

    test("LAND-003: Public events display", async ({ page }) => {
        await page.goto("/");

        const eventsSection = page.locator("#events");
        await eventsSection.scrollIntoViewIfNeeded();

        // Check if the seeded event is visible
        await expect(page.locator(`text=${publicEventTitle}`)).toBeVisible();

        // Verify 'Upcoming Events' heading
        await expect(page.locator("text=Upcoming Events")).toBeVisible();
    });

    test("LAND-004: Register CTA navigation", async ({ page }) => {
        await page.goto("/");

        // Click the main CTA button (first one usually in header or hero)
        // Let's target the one in Hero section which says "Get Started"
        await page.click('text=Get Started');

        await expect(page).toHaveURL(/\/register/);
    });

    test("LAND-005: Login CTA navigation", async ({ page }) => {
        await page.goto("/");

        // Click the Sign In button in Hero
        await page.click('text=Sign In');

        await expect(page).toHaveURL(/\/login/);
    });

    test("LAND-006: Responsive layout (Mobile view)", async ({ page }) => {
        // Set viewport to mobile size
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto("/");

        // Check Header hamburger menu or simplified nav exists
        // (Assuming ShadCN/Tailwind mobile nav often collapses links)
        // If the nav links are hidden or moved to a menu, we can check that.
        // For now, let's verify essential mobile elements are visible without horizontal scroll

        // Hero text should still be visible and wrapped
        await expect(page.locator("text=Smart Living for").first()).toBeVisible();

        // Check that layout didn't break (no horizontal scrollbar usually implies responsive)
        // Hard to test scrolling in E2E easily without visual regression, 
        // but we can check if elements stack.

        // Stats grid usually goes from flex/grid-cols-4 to grid-cols-2 or 1
        // We can inspect CSS classes if needed, or just ensure visibility of content
        await expect(page.locator("text=Residents").first()).toBeVisible();

        // Check simple element visibility
        await expect(page.locator("text=Runwal Seagull").first()).toBeVisible();
    });

});
