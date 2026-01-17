import { test, expect } from "@playwright/test";
import { prisma } from "../../src/lib/db";
import bcrypt from "bcryptjs";

const PREFIX = "E2E_EVENT_REG_";
const USER_EMAIL = PREFIX + "user@example.com";
const PASSWORD = "Password123!";

test.describe("E2E-002: Complete Event Registration (Individual)", () => {
    let building: any;
    let flat: any;
    let user: any;
    let event: any;

    test.beforeAll(async () => {
        // First, find and delete any existing users with this email 
        // (registrations will cascade delete due to onDelete: Cascade)
        const existingUser = await prisma.user.findUnique({
            where: { email: USER_EMAIL },
            select: { id: true }
        });

        if (existingUser) {
            // Delete all registrations for this user first  
            await prisma.eventRegistration.deleteMany({
                where: { userId: existingUser.id }
            });

            // Delete activity logs
            await prisma.activityLog.deleteMany({
                where: { userId: existingUser.id }
            });

            // Delete vehicles
            await prisma.vehicle.deleteMany({
                where: { userId: existingUser.id }
            });

            // Delete any events created by this user
            await prisma.event.deleteMany({
                where: { createdBy: existingUser.id }
            });

            // Now delete the user
            await prisma.user.delete({
                where: { id: existingUser.id }
            });
        }

        // Cleanup test events with our prefix
        await prisma.event.deleteMany({
            where: { title: { startsWith: PREFIX } }
        });

        // Cleanup test flats and buildings
        await prisma.flat.deleteMany({
            where: { flatNumber: { startsWith: PREFIX } }
        });
        await prisma.building.deleteMany({
            where: { name: { startsWith: PREFIX } }
        });

        // Create Building and Flat
        building = await prisma.building.create({
            data: {
                name: PREFIX + "Building A",
                buildingCode: "EA1",
            }
        });

        flat = await prisma.flat.create({
            data: {
                flatNumber: PREFIX + "101",
                floorNumber: 1,
                buildingId: building.id,
                bhkType: "2BHK",
            }
        });

        const hashedPassword = await bcrypt.hash(PASSWORD, 12);

        // Create Test User (APPROVED)
        user = await prisma.user.create({
            data: {
                name: PREFIX + "Test User",
                email: USER_EMAIL,
                passwordHash: hashedPassword,
                role: "OWNER",
                status: "APPROVED",
                userType: "OWNER",
                buildingId: building.id,
                flatId: flat.id,
            }
        });

        // Calculate dates for event (future dates)
        const now = new Date();
        const startDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000); // 7 days + 3 hours
        const regStartDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // Started 1 day ago
        const regEndDate = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000); // Ends in 6 days

        // Create Event with open registration
        event = await prisma.event.create({
            data: {
                title: PREFIX + "Community Yoga Session",
                description: "Join us for a relaxing yoga session in the community garden.",
                eventType: "SOCIAL",
                startDate,
                endDate,
                venue: "Community Garden",
                registrationRequired: true,
                registrationStartDate: regStartDate,
                registrationEndDate: regEndDate,
                participationType: "INDIVIDUAL",
                maxParticipants: 50,
                published: true,
                creator: {
                    connect: { id: user.id }
                }
            }
        });
    });

    test("Execute complete event registration flow", async ({ page, context }) => {
        // Clear any existing session cookies to ensure fresh login
        await context.clearCookies();

        // 1. Login as approved user
        await page.goto("/login");
        await page.fill('input[name="email"]', USER_EMAIL);
        await page.fill('input[name="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/dashboard", { timeout: 15000 });

        // Verify we're logged in as the correct user
        await expect(page.getByText(`Welcome back, ${PREFIX}Test User`)).toBeVisible();

        // 2. Navigate directly to our event's page (using event ID from setup)
        await page.goto(`/dashboard/events/${event.id}`);

        // Verify we're on the correct event page
        await expect(page.getByRole('heading', { name: PREFIX + "Community Yoga Session" })).toBeVisible({ timeout: 10000 });

        // Verify "Registration Open" badge is visible
        await expect(page.getByText("Registration Open")).toBeVisible();

        // Get the initial registration count
        const participantsText = await page.getByText(/\d+ registered/).first().textContent();
        const initialCount = parseInt(participantsText?.match(/(\d+)/)?.[1] || "0");

        // 3. Click "Register for This Event" button
        await page.click('button:has-text("Register for This Event")');

        // Wait for modal to open
        await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText("Register for Event")).toBeVisible();

        // Verify event details in modal - use heading in dialog
        await expect(page.getByRole('dialog').getByRole('heading', { name: PREFIX + "Community Yoga Session" })).toBeVisible();
        await expect(page.getByRole('dialog').getByText("Individual Event")).toBeVisible();

        // 4. Confirm registration (click the submit button)
        await page.click('button:has-text("Confirm Registration")');

        // 5. Verify success message
        await expect(page.getByText("Registration Successful!")).toBeVisible({ timeout: 10000 });
        await expect(page.getByText("You have been successfully registered.")).toBeVisible();
        await expect(page.getByText("You're all set!")).toBeVisible();

        // Wait for modal to close
        await page.waitForTimeout(2500); // Modal closes after 2 seconds

        // 6. Navigate to "My Registrations" page
        await page.goto("/dashboard/events/my-registrations");
        await expect(page.getByRole('heading', { name: 'My Registrations' })).toBeVisible();

        // Click "All" filter to see all registrations (in case our event is not in UPCOMING filter for some reason)
        await page.click('button:has-text("All")');

        // Wait for loading to complete
        await page.waitForTimeout(1000);

        // 8. Verify registration appears
        await expect(page.getByText(PREFIX + "Community Yoga Session")).toBeVisible({ timeout: 10000 });
        // The status is "REGISTERED" not "CONFIRMED" per the schema
        await expect(page.getByText("REGISTERED")).toBeVisible();

        // 9. Return to event page (click on event title or go back)
        await page.goto("/dashboard/events");
        await expect(page.getByRole('heading', { name: 'Events' })).toBeVisible();

        // Wait for events to load
        await page.waitForSelector('.grid', { timeout: 10000 });

        // 7. Verify registration status updated on OUR event card
        // Find the event card - use a more specific locator scoped to our event
        const ourEventCard = page.locator('.group').filter({ hasText: PREFIX + "Community Yoga Session" }).first();
        await expect(ourEventCard).toBeVisible({ timeout: 10000 });

        // Check the button now shows "Registered" (disabled state)
        await expect(ourEventCard.getByRole('button', { name: 'Registered' })).toBeVisible();

        // 8. Verify registration count is now 1
        // Use a specific pattern that matches "X registered" where X is a number
        await expect(ourEventCard.getByText(/^\d+ registered/)).toBeVisible();
        const countElement = ourEventCard.getByText(/^\d+ registered/);
        const countText = await countElement.textContent();
        const finalCount = parseInt(countText?.match(/^(\d+)/)?.[1] || "0");
        expect(finalCount).toBe(initialCount + 1);
    });

    // Cleanup: Delete registration
    test.afterAll(async () => {
        try {
            // Delete registration first
            await prisma.eventRegistration.deleteMany({
                where: { user: { email: USER_EMAIL } }
            });

            // Delete event
            await prisma.event.deleteMany({
                where: { title: { startsWith: PREFIX } }
            });

            // Delete user and related data
            await prisma.activityLog.deleteMany({
                where: { user: { email: USER_EMAIL } }
            });
            await prisma.vehicle.deleteMany({
                where: { user: { email: USER_EMAIL } }
            });
            await prisma.user.deleteMany({
                where: { email: USER_EMAIL }
            });

            // Delete building/flat
            await prisma.flat.deleteMany({
                where: { flatNumber: { startsWith: PREFIX } }
            });
            await prisma.building.deleteMany({
                where: { name: { startsWith: PREFIX } }
            });
        } catch (error) {
            console.error("Cleanup error:", error);
        } finally {
            await prisma.$disconnect();
        }
    });
});
