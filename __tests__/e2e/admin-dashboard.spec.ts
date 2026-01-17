import { test, expect, Page } from "@playwright/test";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

test.describe("Phase 5: Admin Portal - Admin Dashboard Tests", () => {
    let adminUser: any;
    let regularUser: any;
    let testPendingUser: any;
    let buildingA: any;
    let flatA101: any;
    let flatA102: any;
    let flatA103: any;

    test.beforeAll(async () => {
        // Cleanup existing test data
        await prisma.activityLog.deleteMany({
            where: { user: { email: { in: ["admin-test@example.com", "regular-test@example.com", "pending-test@example.com"] } } }
        });
        await prisma.notice.deleteMany({
            where: { creator: { email: "admin-test@example.com" } }
        });
        await prisma.event.deleteMany({
            where: { creator: { email: "admin-test@example.com" } }
        });
        await prisma.user.deleteMany({
            where: { email: { in: ["admin-test@example.com", "regular-test@example.com", "pending-test@example.com"] } }
        });

        // Setup buildings and flats
        buildingA = await prisma.building.upsert({
            where: { buildingCode: "AD" },
            update: {},
            create: { name: "Admin Building", buildingCode: "AD" },
        });

        flatA101 = await prisma.flat.upsert({
            where: { buildingId_flatNumber: { buildingId: buildingA.id, flatNumber: "101" } },
            update: {},
            create: { buildingId: buildingA.id, flatNumber: "101" },
        });

        flatA102 = await prisma.flat.upsert({
            where: { buildingId_flatNumber: { buildingId: buildingA.id, flatNumber: "102" } },
            update: {},
            create: { buildingId: buildingA.id, flatNumber: "102" },
        });

        flatA103 = await prisma.flat.upsert({
            where: { buildingId_flatNumber: { buildingId: buildingA.id, flatNumber: "103" } },
            update: {},
            create: { buildingId: buildingA.id, flatNumber: "103" },
        });

        const hashedPassword = await bcrypt.hash("Password123!", 10);

        // Create Admin User
        adminUser = await prisma.user.create({
            data: {
                email: "admin-test@example.com",
                name: "Admin User",
                passwordHash: hashedPassword,
                role: "ADMIN",
                status: "APPROVED",
                userType: "OWNER",
                buildingId: buildingA.id,
                flatId: flatA101.id,
            },
        });

        // Create Regular User
        regularUser = await prisma.user.create({
            data: {
                email: "regular-test@example.com",
                name: "Regular User",
                passwordHash: hashedPassword,
                role: "OWNER",
                status: "APPROVED",
                userType: "OWNER",
                buildingId: buildingA.id,
                flatId: flatA102.id,
            },
        });

        // Data for stats (ADSH-002)
        // 1. Notice
        await prisma.notice.create({
            data: {
                title: "Admin Test Notice",
                content: "This is a test notice for admin dashboard stats.",
                noticeType: "GENERAL",
                visibility: "PUBLIC",
                createdBy: adminUser.id,
                published: true,
                publishedAt: new Date(),
            }
        });

        // 2. Event
        await prisma.event.create({
            data: {
                title: "Admin Test Event",
                description: "This is a test event for admin dashboard stats.",
                eventType: "CULTURAL",
                startDate: new Date(Date.now() + 86400000), // Tomorrow
                endDate: new Date(Date.now() + 172800000), // Day after
                venue: "Community Hall",
                createdBy: adminUser.id,
                registrationRequired: true,
                registrationStartDate: new Date(),
                registrationEndDate: new Date(Date.now() + 86400000),
                participationType: "INDIVIDUAL",
                published: true,
                publishedAt: new Date(),
            }
        });

        // 3. Pending User (ADSH-003)
        testPendingUser = await prisma.user.create({
            data: {
                email: "pending-test@example.com",
                name: "Pending User",
                passwordHash: hashedPassword,
                role: "OWNER",
                status: "PENDING",
                userType: "OWNER",
                buildingId: buildingA.id,
                flatId: flatA103.id,
            },
        });
    });

    test.afterAll(async () => {
        // Cleanup if necessary
    });

    async function loginAsAdmin(page: Page) {
        await page.goto("/login");
        await page.fill('input[name="email"]', "admin-test@example.com");
        await page.fill('input[name="password"]', "Password123!");
        await page.click('button[type="submit"]');
        await page.waitForURL("/dashboard");
    }

    async function loginAsRegularUser(page: Page) {
        await page.goto("/login");
        await page.fill('input[name="email"]', "regular-test@example.com");
        await page.fill('input[name="password"]', "Password123!");
        await page.click('button[type="submit"]');
        await page.waitForURL("/dashboard");
    }

    test("ADSH-001: Dashboard loads - Admin logged in", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin");

        await expect(page.getByText("Dashboard Overview")).toBeVisible();
        await expect(page.getByText("Welcome back, Admin")).toBeVisible();
    });

    test("ADSH-002: Stats accurate - Data exists", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin");

        // We expect at least:
        // Total Users: >= 2 (Admin, Regular User)
        // Pending Approvals: >= 1
        // Active Notices: >= 1
        // Upcoming Events: >= 1

        // Use a filter to be safe with dynamic numbers
        const totalUsersCard = page.locator('div:has-text("Total Users")').last();
        const pendingApprovalsCard = page.locator('div:has-text("Pending Approvals")').last();
        const activeNoticesCard = page.locator('div:has-text("Active Notices")').last();
        const upcomingEventsCard = page.locator('div:has-text("Upcoming Events")').last();

        await expect(totalUsersCard).toBeVisible();
        await expect(pendingApprovalsCard).toBeVisible();
        await expect(activeNoticesCard).toBeVisible();
        await expect(upcomingEventsCard).toBeVisible();

        // Check if values are at least 1 (since we seeded them)
        const totalUsersValue = await totalUsersCard.locator('h3').textContent();
        expect(parseInt(totalUsersValue || "0")).toBeGreaterThanOrEqual(2);

        const pendingValue = await pendingApprovalsCard.locator('h3').textContent();
        expect(parseInt(pendingValue || "0")).toBeGreaterThanOrEqual(1);

        const noticesValue = await activeNoticesCard.locator('h3').textContent();
        expect(parseInt(noticesValue || "0")).toBeGreaterThanOrEqual(1);

        const eventsValue = await upcomingEventsCard.locator('h3').textContent();
        expect(parseInt(eventsValue || "0")).toBeGreaterThanOrEqual(1);
    });

    test("ADSH-003: Recent registrations - Pending users exist", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin");

        // Check for "Attention Needed" widget
        await expect(page.getByText("Attention Needed")).toBeVisible();
        await expect(page.getByText(/You have .* new user registrations pending approval/)).toBeVisible();

        // Link to review
        const reviewLink = page.getByRole("link", { name: "Review Applications →" });
        await expect(reviewLink).toBeVisible();
        await expect(reviewLink).toHaveAttribute("href", "/admin/users?status=PENDING");
    });

    test("ADSH-004: Quick actions work - Click Create Notice", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin");

        await expect(page.getByText("Quick Actions")).toBeVisible();

        const createNoticeLink = page.getByRole("link", { name: /Create Notice/ });
        await createNoticeLink.click();

        await page.waitForURL("**/admin/notices/create");
        await expect(page.getByText("Create New Notice")).toBeVisible();
    });

    test("ADSH-005: Activity feed - Activity exists", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin");

        await expect(page.getByText("Recent Activity")).toBeVisible();

        // Check for seeded activities
        await expect(page.getByText("Admin Test Notice")).toBeVisible();
        await expect(page.getByText("Admin Test Event")).toBeVisible();
        await expect(page.getByText("Pending User joined the portal")).toBeVisible();
    });

    test("ADSH-006: Non-admin denied - Regular user", async ({ page }) => {
        await loginAsRegularUser(page);

        // Try direct navigation
        await page.goto("/admin");

        // Should be redirected to /login because auth.config.ts authorized callback returns false for non-admins
        await page.waitForURL("**/login**");
        await expect(page.url()).toContain("/login");
        await expect(page.getByText("Dashboard Overview")).not.toBeVisible();
    });
});
