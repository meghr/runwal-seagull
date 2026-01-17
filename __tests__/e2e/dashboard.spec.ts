import { test, expect } from "@playwright/test";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

test.describe("Phase 4: Registered User Features - User Dashboard Tests", () => {
    // Test users
    const approvedUser = {
        email: "dash-approved@test.com",
        name: "Dashboard Approved User",
        password: "Password@123",
    };
    const pendingUser = {
        email: "dash-pending@test.com",
        name: "Dashboard Pending User",
        password: "Password@123",
    };

    const buildingCode = "DASH_B";
    const flatNumber = "DASH-101";
    let adminUserId: string;

    // Calculate dates
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);

    // Test data for notices and events
    const testNotice = {
        title: "DASH Test Notice for Dashboard",
        content: "This is a test notice for dashboard widget testing.",
        noticeType: "GENERAL" as const,
        visibility: "REGISTERED" as const,
        published: true,
    };

    const testEvent = {
        title: "DASH Test Event for Dashboard",
        description: "A test event for dashboard widget testing.",
        eventType: "SPORTS" as const,
        startDate: futureDate,
        endDate: futureDate,
        venue: "Test Venue",
        published: true,
        registrationRequired: false,
    };

    test.beforeAll(async () => {
        // Cleanup existing test data
        await prisma.notice.deleteMany({ where: { title: testNotice.title } });
        await prisma.event.deleteMany({ where: { title: testEvent.title } });
        await prisma.user.deleteMany({
            where: { email: { in: [approvedUser.email, pendingUser.email] } },
        });
        await prisma.flat.deleteMany({ where: { building: { buildingCode } } });
        await prisma.building.deleteMany({ where: { buildingCode } });

        // Create Building & Flat
        const building = await prisma.building.create({
            data: {
                name: "Dashboard Test Building",
                buildingCode,
                totalFloors: 5,
                flats: {
                    create: { flatNumber, floorNumber: 1, bhkType: "2BHK" },
                },
            },
            include: { flats: true },
        });

        const flat = building.flats[0];
        const hashedPassword = await bcrypt.hash(approvedUser.password, 10);

        // Create Approved User
        const approved = await prisma.user.create({
            data: {
                email: approvedUser.email,
                name: approvedUser.name,
                passwordHash: hashedPassword,
                status: "APPROVED",
                role: "OWNER",
                userType: "OWNER",
                flatId: flat.id,
                buildingId: building.id,
            },
        });
        adminUserId = approved.id;

        // Create Pending User
        await prisma.user.create({
            data: {
                email: pendingUser.email,
                name: pendingUser.name,
                passwordHash: hashedPassword,
                status: "PENDING",
                role: "OWNER",
                userType: "OWNER",
                flatId: flat.id,
                buildingId: building.id,
            },
        });

        // Create Test Notice
        await prisma.notice.create({
            data: {
                ...testNotice,
                publishedAt: new Date(),
                creator: { connect: { id: adminUserId } },
            },
        });

        // Create Test Event
        await prisma.event.create({
            data: {
                ...testEvent,
                creator: { connect: { id: adminUserId } },
            },
        });

        console.log("Seeded Dashboard Test Data");
    });

    test.afterAll(async () => {
        // Cleanup
        await prisma.notice.deleteMany({ where: { title: testNotice.title } });
        await prisma.event.deleteMany({ where: { title: testEvent.title } });
        await prisma.user.deleteMany({
            where: { email: { in: [approvedUser.email, pendingUser.email] } },
        });
        await prisma.flat.deleteMany({ where: { building: { buildingCode } } });
        await prisma.building.deleteMany({ where: { buildingCode } });
    });

    // Helper function to login
    async function loginUser(page: any, email: string, password: string) {
        await page.goto("/login");
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.click('button[type="submit"]');
    }

    test("DASH-001: Dashboard loads for logged-in user", async ({ page }) => {
        // Login with approved user
        await loginUser(page, approvedUser.email, approvedUser.password);

        // Wait for redirect to dashboard
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

        // Verify dashboard page elements are visible
        await expect(page.locator("text=Dashboard").first()).toBeVisible();
        await expect(page.locator("text=Profile").first()).toBeVisible();
        await expect(page.locator("text=Sign Out").first()).toBeVisible();
    });

    test("DASH-002: Welcome message shows user's name", async ({ page }) => {
        // Login with approved user
        await loginUser(page, approvedUser.email, approvedUser.password);

        // Wait for redirect to dashboard
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

        // Verify welcome message with user's name
        await expect(
            page.locator(`text=Welcome back, ${approvedUser.name}`)
        ).toBeVisible();
    });

    test("DASH-003: Quick stats display correctly", async ({ page }) => {
        // Login with approved user
        await loginUser(page, approvedUser.email, approvedUser.password);

        // Wait for redirect to dashboard
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

        // Verify stats cards are visible
        // My Unit stat
        await expect(page.locator("text=My Unit")).toBeVisible();
        await expect(page.locator(`text=${flatNumber}`).first()).toBeVisible();

        // New Notices stat
        await expect(page.locator("text=New Notices")).toBeVisible();
        await expect(page.locator("text=Last 7 days")).toBeVisible();

        // Upcoming Events stat - use getByRole for exact heading match
        await expect(page.getByRole("heading", { name: "Upcoming Events" })).toBeVisible();
        await expect(page.locator("text=Available to join").first()).toBeVisible();

        // My Registrations stat
        await expect(page.locator("text=My Registrations")).toBeVisible();
    });

    test("DASH-004: Recent notices widget displays", async ({ page }) => {
        // Login with approved user
        await loginUser(page, approvedUser.email, approvedUser.password);

        // Wait for redirect to dashboard
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

        // Wait for page to fully load
        await page.waitForTimeout(1000);

        // Verify Recent Notices widget heading
        await expect(page.locator("text=Recent Notices")).toBeVisible();

        // Verify our test notice is displayed
        await expect(
            page.locator(`text=${testNotice.title}`).first()
        ).toBeVisible();

        // Verify "View All" link is present
        const viewAllLink = page
            .locator('a[href="/dashboard/notices"]')
            .filter({ hasText: "View All" });
        await expect(viewAllLink).toBeVisible();
    });

    test("DASH-005: My Event Registrations widget displays", async ({ page }) => {
        // Login with approved user
        await loginUser(page, approvedUser.email, approvedUser.password);

        // Wait for redirect to dashboard
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

        // Wait for page to fully load
        await page.waitForTimeout(1000);

        // Verify My Event Registrations widget heading
        await expect(page.locator("text=My Event Registrations")).toBeVisible();

        // Since user has 0 registrations, should see "No upcoming events" OR "Browse Events" link
        // The widget shows empty state when no registrations
        const noEventsText = page.locator("text=No upcoming events");
        const browseEventsLink = page.locator("text=Browse Events");

        // At least one of these should be visible (empty state indicators)
        const hasEmptyState = await noEventsText.isVisible() || await browseEventsLink.isVisible();
        expect(hasEmptyState).toBeTruthy();
    });

    test("DASH-006: Unapproved (pending) user redirected", async ({ page }) => {
        // Login with pending user
        await loginUser(page, pendingUser.email, pendingUser.password);

        // Should see error message about pending approval
        await expect(
            page.locator("text=Account pending approval")
        ).toBeVisible();

        // Should NOT be redirected to dashboard
        await expect(page).not.toHaveURL(/.*\/dashboard/);
    });

    test("DASH-006b: Dashboard navigation links work", async ({ page }) => {
        // Login with approved user
        await loginUser(page, approvedUser.email, approvedUser.password);

        // Wait for redirect to dashboard
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

        // Click on Profile link
        await page.click('a:has-text("Profile")');
        await expect(page).toHaveURL(/.*\/dashboard\/profile/);

        // Go back to dashboard
        await page.goto("/dashboard");
        await expect(page).toHaveURL(/.*\/dashboard/);
    });

    test("DASH-007: Sign Out button works", async ({ page }) => {
        // Login with approved user
        await loginUser(page, approvedUser.email, approvedUser.password);

        // Wait for redirect to dashboard
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

        // Click Sign Out button
        const signOutButton = page.locator('button:has-text("Sign Out")');
        await expect(signOutButton).toBeVisible();

        // Click and wait for redirect
        await Promise.all([
            page.waitForURL(/.*\/login/, { timeout: 15000 }),
            signOutButton.click(),
        ]);

        // Verify redirected to login page
        await expect(page).toHaveURL(/.*\/login/);
    });
});
