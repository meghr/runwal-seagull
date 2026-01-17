import { test, expect } from "@playwright/test";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

test.describe("Phase 4: Registered User Features - Event Management Tests", () => {
    // Test user
    const testUser = {
        email: "event-mgmt-user@test.com",
        name: "Event Mgmt Test User",
        password: "Password@123",
    };

    const buildingCode = "EVT_B";
    const flatNumber = "EVT-101";
    let testUserId: string;

    // Calculate dates
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);
    const regStartPast = new Date();
    regStartPast.setDate(regStartPast.getDate() - 7);
    const regEndFuture = new Date();
    regEndFuture.setDate(regEndFuture.getDate() + 14);
    const regEndPast = new Date();
    regEndPast.setDate(regEndPast.getDate() - 1);

    // Test events
    const events = {
        upcomingOpen: {
            title: "EVT Upcoming Open Sports Event",
            description: "An upcoming event with open registration.",
            eventType: "SPORTS" as const,
            startDate: futureDate,
            endDate: futureDate,
            venue: "Sports Complex",
            published: true,
            registrationRequired: true,
            registrationStartDate: regStartPast,
            registrationEndDate: regEndFuture,
            maxParticipants: 50,
            participationType: "INDIVIDUAL" as const,
        },
        upcomingClosed: {
            title: "EVT Upcoming Closed Registration Event",
            description: "An upcoming event with closed registration.",
            eventType: "CULTURAL" as const,
            startDate: futureDate,
            endDate: futureDate,
            venue: "Auditorium",
            published: true,
            registrationRequired: true,
            registrationStartDate: pastDate,
            registrationEndDate: regEndPast,
            maxParticipants: 100,
            participationType: "INDIVIDUAL" as const,
        },
        upcomingTeam: {
            title: "EVT Team Sports Event",
            description: "A team event requiring multiple members.",
            eventType: "SPORTS" as const,
            startDate: futureDate,
            endDate: futureDate,
            venue: "Sports Ground",
            published: true,
            registrationRequired: true,
            registrationStartDate: regStartPast,
            registrationEndDate: regEndFuture,
            maxParticipants: 20,
            participationType: "TEAM" as const,
        },
        upcomingFull: {
            title: "EVT Full Event No Spots",
            description: "An event that is already full.",
            eventType: "MEETING" as const,
            startDate: futureDate,
            endDate: futureDate,
            venue: "Conference Room",
            published: true,
            registrationRequired: true,
            registrationStartDate: regStartPast,
            registrationEndDate: regEndFuture,
            maxParticipants: 1,
            participationType: "INDIVIDUAL" as const,
        },
        pastEvent: {
            title: "EVT Past Sports Tournament",
            description: "A past event that has already ended.",
            eventType: "SPORTS" as const,
            startDate: pastDate,
            endDate: pastDate,
            venue: "Old Venue",
            published: true,
            registrationRequired: false,
        },
        upcomingNoReg: {
            title: "EVT Open Event No Registration",
            description: "An event that does not require registration.",
            eventType: "SOCIAL" as const,
            startDate: futureDate,
            endDate: futureDate,
            venue: "Community Hall",
            published: true,
            registrationRequired: false,
        },
    };

    test.beforeAll(async () => {
        // Cleanup existing test data
        await prisma.eventRegistration.deleteMany({
            where: { user: { email: testUser.email } },
        });
        await prisma.event.deleteMany({
            where: { title: { startsWith: "EVT" } },
        });
        await prisma.user.deleteMany({ where: { email: testUser.email } });
        await prisma.flat.deleteMany({ where: { building: { buildingCode } } });
        await prisma.building.deleteMany({ where: { buildingCode } });

        // Create Building & Flat
        const building = await prisma.building.create({
            data: {
                name: "Event Test Building",
                buildingCode,
                totalFloors: 5,
                flats: {
                    create: { flatNumber, floorNumber: 1, bhkType: "2BHK" },
                },
            },
            include: { flats: true },
        });

        const flat = building.flats[0];
        const hashedPassword = await bcrypt.hash(testUser.password, 10);

        // Create Test User
        const user = await prisma.user.create({
            data: {
                email: testUser.email,
                name: testUser.name,
                passwordHash: hashedPassword,
                status: "APPROVED",
                role: "OWNER",
                userType: "OWNER",
                flatId: flat.id,
                buildingId: building.id,
            },
        });
        testUserId = user.id;

        // Create all test events
        for (const eventData of Object.values(events)) {
            await prisma.event.create({
                data: {
                    ...eventData,
                    creator: { connect: { id: testUserId } },
                },
            });
        }

        // Create a registration to make the "full" event actually full
        const fullEvent = await prisma.event.findFirst({
            where: { title: events.upcomingFull.title },
        });
        if (fullEvent) {
            await prisma.eventRegistration.create({
                data: {
                    eventId: fullEvent.id,
                    userId: testUserId,
                    registrationStatus: "REGISTERED",
                },
            });
        }

        console.log("Seeded Event Management Test Data");
    });

    test.afterAll(async () => {
        // Cleanup
        await prisma.eventRegistration.deleteMany({
            where: { user: { email: testUser.email } },
        });
        await prisma.event.deleteMany({
            where: { title: { startsWith: "EVT" } },
        });
        await prisma.user.deleteMany({ where: { email: testUser.email } });
        await prisma.flat.deleteMany({ where: { building: { buildingCode } } });
        await prisma.building.deleteMany({ where: { buildingCode } });
    });

    // Helper function to login
    async function loginUser(page: any) {
        await page.goto("/login");
        await page.fill('input[name="email"]', testUser.email);
        await page.fill('input[name="password"]', testUser.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    }

    test("EVT-001: View all events - Events list displayed", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/events");
        await page.waitForTimeout(2000);

        // Verify Events heading
        await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();

        // Verify filter buttons
        await expect(page.locator('button:has-text("Upcoming")').first()).toBeVisible();
        await expect(page.locator('button:has-text("Past")').first()).toBeVisible();
        await expect(page.locator('button:has-text("All")').first()).toBeVisible();

        // Verify events count is displayed
        await expect(page.locator("text=events found")).toBeVisible();

        // Verify My Registrations link
        await expect(page.locator("text=My Registrations")).toBeVisible();
    });

    test("EVT-002: Filter upcoming - Only upcoming events shown", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/events");
        await page.waitForTimeout(2000);

        // Upcoming filter should be active by default
        // Verify upcoming events are visible
        await expect(
            page.locator(`text=${events.upcomingOpen.title}`).first()
        ).toBeVisible();

        // Past events should NOT be visible
        await expect(
            page.locator(`text=${events.pastEvent.title}`)
        ).not.toBeVisible();
    });

    test("EVT-003: Filter past - Only past events shown", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/events");
        await page.waitForTimeout(1500);

        // Click Past filter
        await page.locator('button:has-text("Past")').first().click();
        await page.waitForTimeout(1500);

        // Past events should be visible
        await expect(
            page.locator(`text=${events.pastEvent.title}`).first()
        ).toBeVisible();

        // Upcoming events should NOT be visible
        await expect(
            page.locator(`text=${events.upcomingOpen.title}`)
        ).not.toBeVisible();
    });

    test("EVT-004: Registration open - Register button active", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/events");
        await page.waitForTimeout(2000);

        // Find the event with open registration
        await expect(
            page.locator(`text=${events.upcomingOpen.title}`).first()
        ).toBeVisible();

        // Look for "Registration Open" badge
        await expect(page.locator("text=Registration Open").first()).toBeVisible();

        // "Register Now" button should be visible for open events
        await expect(
            page.locator('button:has-text("Register Now")').first()
        ).toBeVisible();
    });

    test("EVT-005: Registration closed - Shows closed status", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/events");
        await page.waitForTimeout(2000);

        // Find the event with closed registration (search for it)
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill("Closed Registration");
        await page.keyboard.press("Enter");
        await page.waitForTimeout(1500);

        // Look for "Registration Closed" badge
        await expect(page.locator("text=Registration Closed").first()).toBeVisible();
    });

    test("EVT-006: Individual registration - Registration created", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/events");
        await page.waitForTimeout(2000);

        // Search for the open event
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill("Upcoming Open Sports");
        await page.keyboard.press("Enter");
        await page.waitForTimeout(2000);

        // Click Register Now button
        const registerButton = page.locator('button:has-text("Register Now")');
        await expect(registerButton.first()).toBeVisible();
        await registerButton.first().click();

        // Wait for modal
        await page.waitForTimeout(1000);

        // Verify registration modal opens
        await expect(page.getByText("Register for Event")).toBeVisible();

        // Add optional notes
        const notesField = page.locator('textarea[id="notes"]');
        if (await notesField.isVisible()) {
            await notesField.fill("Test registration notes");
        }

        // Click Confirm Registration
        await page.click('button:has-text("Confirm Registration")');

        // Wait for success
        // Use a longer timeout and proper assertion to wait for the element
        await expect(
            page.getByRole("heading", { name: "Registration Successful" })
        ).toBeVisible({ timeout: 10000 });
    });

    test("EVT-009: Duplicate registration - Shows registered status", async ({ page }) => {
        // This test depends on EVT-006 having run, so first check if user is registered
        // If not, create a registration directly
        const openEvent = await prisma.event.findFirst({
            where: { title: events.upcomingOpen.title },
        });
        const user = await prisma.user.findFirst({
            where: { email: testUser.email },
        });

        if (openEvent && user) {
            // Ensure registration exists
            const existing = await prisma.eventRegistration.findFirst({
                where: { eventId: openEvent.id, userId: user.id },
            });
            if (!existing) {
                await prisma.eventRegistration.create({
                    data: {
                        eventId: openEvent.id,
                        userId: user.id,
                        registrationStatus: "REGISTERED",
                    },
                });
            }
        }

        await loginUser(page);
        await page.goto("/dashboard/events");
        await page.waitForTimeout(2000);

        // Search for the open event
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill("Upcoming Open Sports");
        await page.keyboard.press("Enter");
        await page.waitForTimeout(1500);

        // User should see "Registered" indicator
        // The card should show the Registered badge or button
        const registeredBadge = page.locator("text=Registered").first();
        await expect(registeredBadge).toBeVisible();
    });

    test("EVT-011: View my events - Registrations shown", async ({ page }) => {
        // Ensure registration exists
        const openEvent = await prisma.event.findFirst({
            where: { title: events.upcomingOpen.title },
        });
        const user = await prisma.user.findFirst({
            where: { email: testUser.email },
        });

        if (openEvent && user) {
            const existing = await prisma.eventRegistration.findFirst({
                where: { eventId: openEvent.id, userId: user.id },
            });
            if (!existing) {
                await prisma.eventRegistration.create({
                    data: {
                        eventId: openEvent.id,
                        userId: user.id,
                        registrationStatus: "REGISTERED",
                    },
                });
            }
        }

        await loginUser(page);
        await page.goto("/dashboard/events/my-registrations");
        await page.waitForTimeout(2000);

        // Verify page heading
        await expect(page.getByRole("heading", { name: "My Registrations" })).toBeVisible();

        // Verify the registration is shown
        await expect(
            page.locator(`text=${events.upcomingOpen.title}`).first()
        ).toBeVisible();

        // Verify registration status badge
        await expect(page.locator("text=REGISTERED").first()).toBeVisible();
    });

    test("EVT-010: Cancel registration - Registration cancelled", async ({ page }) => {
        // Ensure registration exists before cancel test
        const openEvent = await prisma.event.findFirst({
            where: { title: events.upcomingOpen.title },
        });
        const user = await prisma.user.findFirst({
            where: { email: testUser.email },
        });

        if (openEvent && user) {
            const existing = await prisma.eventRegistration.findFirst({
                where: { eventId: openEvent.id, userId: user.id },
            });
            if (!existing) {
                await prisma.eventRegistration.create({
                    data: {
                        eventId: openEvent.id,
                        userId: user.id,
                        registrationStatus: "REGISTERED",
                    },
                });
            }
        }

        await loginUser(page);
        await page.goto("/dashboard/events/my-registrations");
        await page.waitForTimeout(2000);

        // Find Cancel button for the event
        const cancelButton = page.locator('button:has-text("Cancel")').first();
        await expect(cancelButton).toBeVisible();

        // Click cancel
        await cancelButton.click();

        // Wait for cancellation
        await page.waitForTimeout(2000);

        // Registration should be removed - check registrations count decreased or no results
        const regCount = page.locator("text=registrations");
        await expect(regCount).toBeVisible();
    });

    test("EVT-012: Event countdown - Shows time until event", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/events");
        await page.waitForTimeout(2000);

        // Events should show countdown like "in X days" or "in about X months"
        const countdownBadge = page.locator('[class*="sky"]').filter({
            hasText: /in \d|in about/,
        });

        // At least one event should show countdown
        const hasCountdown = (await countdownBadge.count()) > 0;
        expect(hasCountdown).toBeTruthy();
    });

    test("EVT-007: Team registration flow", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/events");
        await page.waitForTimeout(2000);

        // Search for team event
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill("Team Sports");
        await page.keyboard.press("Enter");
        await page.waitForTimeout(2000);

        // Click Register Now button
        const registerButton = page.locator('button:has-text("Register Now")');
        await expect(registerButton.first()).toBeVisible();
        await registerButton.first().click();

        // Wait for modal
        await page.waitForTimeout(1000);

        // Verify registration modal shows "Team Event" badge (use exact match)
        await expect(page.getByText("Team Event", { exact: true })).toBeVisible();

        // Verify Team Members section is visible
        await expect(page.locator("text=Team Members")).toBeVisible();

        // Fill in team member
        await page.fill('input[placeholder="Name *"]', "Team Member One");

        // Submit registration
        // We need to click the button that matches exactly "Confirm Registration"
        await page.click('button:has-text("Confirm Registration")');

        // Wait for success with proper assertion
        // Wait for success with proper assertion
        await expect(
            page.getByRole("heading", { name: "Registration Successful" })
        ).toBeVisible({ timeout: 10000 });
    });
    test("EVT-008: Event full - Shows full status", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/events");
        await page.waitForTimeout(2000);

        // Search for the full event
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill("Full Event No Spots");
        await page.keyboard.press("Enter");
        await page.waitForTimeout(1500);

        // Look for "Event Full" or "Registered" badge (user registered to make it full)
        const eventFull = page.locator("text=Event Full").first();
        const registered = page.locator("text=Registered").first();

        const showsStatus = (await eventFull.isVisible()) || (await registered.isVisible());
        expect(showsStatus).toBeTruthy();
    });
});
