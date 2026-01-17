import { test, expect } from "@playwright/test";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

test.describe("Phase 3: Public Pages - Public Events Tests", () => {
    // Admin user for creating content
    let adminUserId: string;
    const adminEmail = "pevt-admin@test.com";
    const buildingCode = "PEVT_B";

    // Calculate dates for test data
    const now = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);
    const farFutureDate = new Date();
    farFutureDate.setMonth(farFutureDate.getMonth() + 2);

    // Registration dates for open registration
    const regStartPast = new Date();
    regStartPast.setDate(regStartPast.getDate() - 7);
    const regEndFuture = new Date();
    regEndFuture.setDate(regEndFuture.getDate() + 14);

    // Test events with different configurations
    const events = {
        futureSports: {
            title: "PEVT Future Sports Event",
            description: "An upcoming sports event for testing.",
            eventType: "SPORTS" as const,
            startDate: futureDate,
            endDate: futureDate,
            venue: "Sports Complex",
            published: true,
            registrationRequired: true,
            registrationStartDate: regStartPast,
            registrationEndDate: regEndFuture,
            maxParticipants: 50,
        },
        futureCultural: {
            title: "PEVT Future Cultural Event",
            description: "An upcoming cultural event for testing.",
            eventType: "CULTURAL" as const,
            startDate: futureDate,
            endDate: futureDate,
            venue: "Auditorium",
            published: true,
            registrationRequired: true,
            registrationStartDate: regStartPast,
            registrationEndDate: regEndFuture,
            maxParticipants: 100,
        },
        futureMeeting: {
            title: "PEVT Future Meeting Event",
            description: "An upcoming meeting event for testing.",
            eventType: "MEETING" as const,
            startDate: futureDate,
            endDate: futureDate,
            venue: "Conference Room",
            published: true,
            registrationRequired: false,
        },
        pastEvent: {
            title: "PEVT Past Sports Tournament",
            description: "A past sports event that should not be shown.",
            eventType: "SPORTS" as const,
            startDate: pastDate,
            endDate: pastDate,
            venue: "Sports Ground",
            published: true,
            registrationRequired: false,
        },
        unpublishedEvent: {
            title: "PEVT Unpublished Draft Event",
            description: "An unpublished event that should not be shown.",
            eventType: "OTHER" as const,
            startDate: futureDate,
            endDate: futureDate,
            venue: "Unknown",
            published: false,
            registrationRequired: false,
        },
    };

    test.beforeAll(async () => {
        // Cleanup existing test data
        await prisma.event.deleteMany({
            where: {
                title: {
                    in: Object.values(events).map((e) => e.title),
                },
            },
        });
        await prisma.user.deleteMany({ where: { email: adminEmail } });
        await prisma.building.deleteMany({ where: { buildingCode } });

        // Create Building
        const building = await prisma.building.create({
            data: {
                name: "Public Events Test Building",
                buildingCode,
                totalFloors: 2,
            },
        });

        // Create Admin User
        const hashedPassword = await bcrypt.hash("password123", 10);
        const user = await prisma.user.create({
            data: {
                email: adminEmail,
                name: "PEVT Admin",
                passwordHash: hashedPassword,
                role: "ADMIN",
                status: "APPROVED",
                buildingId: building.id,
                phoneNumber: "+919777777777",
            },
        });
        adminUserId = user.id;

        // Create all test events
        for (const eventData of Object.values(events)) {
            await prisma.event.create({
                data: {
                    ...eventData,
                    creator: { connect: { id: adminUserId } },
                },
            });
        }

        console.log("Seeded Public Events Test Data");
    });

    test.afterAll(async () => {
        // Cleanup
        await prisma.event.deleteMany({
            where: {
                title: {
                    in: Object.values(events).map((e) => e.title),
                },
            },
        });
        await prisma.user.deleteMany({ where: { email: adminEmail } });
        await prisma.building.deleteMany({ where: { buildingCode } });
    });

    test("PEVT-001: Upcoming events shown - Only future events visible", async ({
        page,
    }) => {
        await page.goto("/");

        // Scroll to events section
        const eventsSection = page.locator("#events");
        await eventsSection.scrollIntoViewIfNeeded();

        // Wait for events to load
        await page.waitForTimeout(1000);

        // Future events should be visible (use getByRole for headings)
        await expect(
            page.getByRole("heading", { name: events.futureSports.title })
        ).toBeVisible();
        await expect(
            page.getByRole("heading", { name: events.futureCultural.title })
        ).toBeVisible();
        await expect(
            page.getByRole("heading", { name: events.futureMeeting.title })
        ).toBeVisible();
    });

    test("PEVT-002: Past events hidden - Past events not shown", async ({
        page,
    }) => {
        await page.goto("/");

        // Scroll to events section
        const eventsSection = page.locator("#events");
        await eventsSection.scrollIntoViewIfNeeded();

        // Wait for events to load
        await page.waitForTimeout(1000);

        // Past events should NOT be visible
        await expect(
            page.getByRole("heading", { name: events.pastEvent.title })
        ).not.toBeVisible();

        // Unpublished events should also NOT be visible
        await expect(
            page.getByRole("heading", { name: events.unpublishedEvent.title })
        ).not.toBeVisible();
    });

    test("PEVT-003: Event type badges display with correct colors", async ({
        page,
    }) => {
        await page.goto("/");

        // Scroll to events section
        const eventsSection = page.locator("#events");
        await eventsSection.scrollIntoViewIfNeeded();

        // Wait for events to load
        await page.waitForTimeout(1000);

        // Check SPORTS badge exists with green color class
        const sportsBadge = page
            .locator('[class*="bg-green"][class*="text-green"]')
            .filter({ hasText: "SPORTS" });
        await expect(sportsBadge.first()).toBeVisible();

        // Check CULTURAL badge exists with purple color class
        const culturalBadge = page
            .locator('[class*="bg-purple"][class*="text-purple"]')
            .filter({ hasText: "CULTURAL" });
        await expect(culturalBadge.first()).toBeVisible();

        // Check MEETING badge exists with blue color class
        const meetingBadge = page
            .locator('[class*="bg-blue"][class*="text-blue"]')
            .filter({ hasText: "MEETING" });
        await expect(meetingBadge.first()).toBeVisible();
    });

    test("PEVT-004: Login to Register CTA shown for events with open registration", async ({
        page,
    }) => {
        await page.goto("/");

        // Scroll to events section
        const eventsSection = page.locator("#events");
        await eventsSection.scrollIntoViewIfNeeded();

        // Wait for events to load
        await page.waitForTimeout(1000);

        // Find an event with open registration - sports event has registration open
        // The "Login to Register" button should be visible for events with OPEN status
        const loginToRegisterBtn = page.locator(
            'button:has-text("Login to Register")'
        );
        await expect(loginToRegisterBtn.first()).toBeVisible();

        // Click the Login to Register button and verify navigation to login page
        await loginToRegisterBtn.first().click();
        await expect(page).toHaveURL(/\/login/);
    });

    test("PEVT-004b: Events without registration show View Details instead", async ({
        page,
    }) => {
        await page.goto("/");

        // Scroll to events section
        const eventsSection = page.locator("#events");
        await eventsSection.scrollIntoViewIfNeeded();

        // Wait for events to load
        await page.waitForTimeout(1000);

        // For meeting event which has registrationRequired: false
        // It should show "No Registration Required" status
        const noRegBadge = page.locator("text=No Registration Required");
        await expect(noRegBadge.first()).toBeVisible();

        // Should show "View Details →" text for non-registration events
        const viewDetailsText = page.locator("text=View Details →");
        await expect(viewDetailsText.first()).toBeVisible();
    });

    test("PEVT-004c: Registration Open status displayed for events with active registration", async ({
        page,
    }) => {
        await page.goto("/");

        // Scroll to events section
        const eventsSection = page.locator("#events");
        await eventsSection.scrollIntoViewIfNeeded();

        // Wait for events to load
        await page.waitForTimeout(1000);

        // Events with open registration should show "Registration Open" status
        const regOpenBadge = page.locator("text=Registration Open");
        await expect(regOpenBadge.first()).toBeVisible();
    });

    test("PEVT-Event Modal: Clicking event opens detail modal", async ({
        page,
    }) => {
        await page.goto("/");

        // Scroll to events section
        const eventsSection = page.locator("#events");
        await eventsSection.scrollIntoViewIfNeeded();

        // Wait for events to load
        await page.waitForTimeout(1000);

        // Click on a meeting event (doesn't redirect to login)
        const eventHeading = page.getByRole("heading", {
            name: events.futureMeeting.title,
        });
        await expect(eventHeading).toBeVisible();
        await eventHeading.click();

        // Wait for modal to appear
        await page.waitForTimeout(500);

        // Verify modal is open
        const modalOverlay = page.locator(".fixed.inset-0.z-50");
        await expect(modalOverlay).toBeVisible();

        // Check event title is displayed in modal
        const modalTitle = page
            .locator("h2")
            .filter({ hasText: events.futureMeeting.title });
        await expect(modalTitle).toBeVisible();

        // Check venue is displayed
        await expect(
            page.locator(`text=${events.futureMeeting.venue}`).first()
        ).toBeVisible();

        // Close modal
        const closeButton = page.locator('button:has-text("Close")');
        await closeButton.click();

        // Verify modal is closed
        await page.waitForTimeout(300);
        await expect(modalOverlay).not.toBeVisible();
    });
});
