import { test, expect } from "@playwright/test";
import { prisma } from "../../src/lib/db";
import bcrypt from "bcryptjs";
import path from "path";

const PREFIX = "E2E_ADMIN_EVENT_";
const ADMIN_EMAIL = PREFIX + "admin@example.com";
const USER_EMAIL = PREFIX + "user@example.com";
const PASSWORD = "Password123!";

test.describe("E2E-004: Admin Creates and Manages Event", () => {
    let building: any;
    let flat: any;
    let admin: any;
    let user: any;

    test.setTimeout(120000);

    test.beforeAll(async () => {
        // Cleanup
        await prisma.eventRegistration.deleteMany({
            where: { user: { email: { startsWith: PREFIX } } }
        });
        await prisma.activityLog.deleteMany({
            where: { user: { email: { startsWith: PREFIX } } }
        });
        await prisma.vehicle.deleteMany({
            where: { user: { email: { startsWith: PREFIX } } }
        });
        await prisma.event.deleteMany({
            where: { title: { startsWith: PREFIX } }
        });
        await prisma.user.deleteMany({
            where: { email: { startsWith: PREFIX } }
        });
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
                buildingCode: "EA4",
            }
        });

        flat = await prisma.flat.create({
            data: {
                flatNumber: PREFIX + "404",
                floorNumber: 4,
                buildingId: building.id,
                bhkType: "2BHK",
            }
        });

        const hashedPassword = await bcrypt.hash(PASSWORD, 12);

        // Create Admin
        admin = await prisma.user.create({
            data: {
                name: PREFIX + "Admin User",
                email: ADMIN_EMAIL,
                passwordHash: hashedPassword,
                role: "ADMIN",
                status: "APPROVED",
            }
        });

        // Create User
        user = await prisma.user.create({
            data: {
                name: PREFIX + "Normal User",
                email: USER_EMAIL,
                passwordHash: hashedPassword,
                role: "OWNER",
                status: "APPROVED",
                userType: "OWNER",
                buildingId: building.id,
                flatId: flat.id,
            }
        });
    });

    test("Admin full event lifecycle management", async ({ page, context }) => {
        // 1. Login as admin
        await page.goto("/login");
        await page.fill('input[name="email"]', ADMIN_EMAIL);
        await page.fill('input[name="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/dashboard", { timeout: 15000 });

        // 2. Navigate to admin events
        await page.goto("/admin/events");
        await expect(page.getByRole("heading", { name: "Event Management", exact: true })).toBeVisible();

        // 3. Click "Create Event"
        await page.click('button:has-text("Create Event")');
        await expect(page.getByRole("heading", { name: "Create New Event" })).toBeVisible();

        // 4. Fill event form
        const eventTitle = PREFIX + "Test Event";
        await page.fill('input#title', eventTitle);

        // Select Category: SPORTS
        await page.click('button:has-text("Other")'); // Default is Other
        await page.getByRole('option', { name: "Sports" }).click();

        await page.fill('textarea#description', "This is a test event managed by E2E test.");
        await page.fill('input#venue', "Sports Ground");

        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        const formatDate = (date: Date) => {
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
        };

        await page.fill('input#startDate', formatDate(tomorrow));
        await page.fill('input#endDate', formatDate(dayAfter));

        // Ensure registration is enabled (it should be by default)
        const regSwitch = page.getByRole("switch");
        const isChecked = await regSwitch.getAttribute("aria-checked");
        if (isChecked === "false") {
            await regSwitch.click();
        }

        await page.fill('input#regStart', formatDate(now));
        await page.fill('input#regEnd', formatDate(tomorrow));

        // Participation Type: Team
        await page.click('button:has-text("Individual")'); // Default
        // In Shadcn UI, dropdown items are in a portal, so we search globally for the role
        await page.getByRole('option', { name: "Team" }).click();

        await page.fill('input#maxParticipants', "10");

        // 5. Upload event image (Optional in flow, but mentioned. We'll skip for now if no simple input available, 
        // but let's see if we can use a dummy URL via JS if needed. 
        // Actually, the form has a dummy imageUrl field potentially or we can skip it as it's optional in schema.)

        // 6. Save as Draft
        await page.waitForTimeout(1000);
        await page.click('button:has-text("Save Draft")');

        // 7. Verify event in drafts
        await page.waitForURL("**/admin/events");
        const eventRow = page.locator('.group').filter({ hasText: eventTitle });
        await expect(eventRow).toBeVisible();
        await expect(eventRow.getByText("Draft")).toBeVisible();

        // 8. Edit event
        await eventRow.locator('a[href*="/edit"]').click();
        await expect(page.getByRole("heading", { name: "Edit Event" })).toBeVisible();
        await page.fill('input#title', eventTitle + " (Published)");

        // 9. Publish event
        await page.waitForTimeout(1000);
        await page.click('button:has-text("Publish Event")');

        // 10. Verify event visible in public (as user)
        await context.clearCookies();
        await page.goto("/login");
        await page.fill('input[name="email"]', USER_EMAIL);
        await page.fill('input[name="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/dashboard", { timeout: 15000 });

        await page.goto("/dashboard/events");
        const publishedTitle = eventTitle + " (Published)";
        await expect(page.getByText(publishedTitle)).toBeVisible({ timeout: 10000 });

        // 11. [User] Register for event
        // Navigation to details
        const userEventCard = page.locator('.group').filter({ hasText: publishedTitle });
        await userEventCard.getByRole('button', { name: 'View Details' }).click();

        await page.waitForTimeout(1000);
        await page.click('button:has-text("Register for This Event")');
        await expect(page.getByRole("dialog")).toBeVisible();

        // Team member registration
        await page.locator('input[placeholder="Name *"]').fill(PREFIX + "Member 1");
        await page.click('button:has-text("Add Member")');
        await page.locator('input[placeholder="Name *"]').nth(1).fill(PREFIX + "Member 2");

        await page.waitForTimeout(1000);
        await page.click('button:has-text("Confirm Registration")');
        await expect(page.getByText("Registration Successful!")).toBeVisible();
        await page.waitForTimeout(2500);

        // 12. [Admin] View registration dashboard
        await context.clearCookies();
        await page.goto("/login");
        await page.fill('input[name="email"]', ADMIN_EMAIL);
        await page.fill('input[name="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/dashboard", { timeout: 15000 });

        await page.goto("/admin/events");
        const adminEventRow = page.locator('.group').filter({ hasText: publishedTitle });
        await adminEventRow.locator('a:has-text("View")').click();

        // 13. [Admin] Search registrations
        await expect(page.getByText("Registration Dashboard")).toBeVisible();
        await page.fill('input[placeholder*="Search"]', PREFIX + "Normal User");
        await expect(page.getByText(PREFIX + "Normal User")).toBeVisible();

        // 14. [Admin] Close registration
        await page.waitForTimeout(1000);
        page.once('dialog', dialog => dialog.accept());
        await page.click('button:has-text("Close Registration")');
        await expect(page.getByText("Closed", { exact: true })).toBeVisible();

        // 15. [User] Verify cannot register anymore
        await context.clearCookies();
        await page.goto("/login");
        await page.fill('input[name="email"]', USER_EMAIL);
        await page.fill('input[name="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/dashboard", { timeout: 15000 });

        await page.goto("/dashboard/events");
        const userEventCardClosed = page.locator('.group').filter({ hasText: publishedTitle });
        await userEventCardClosed.getByRole('button', { name: 'View Details' }).click();

        // When closed, it displays "Registration Closed" text
        await expect(page.getByText("Registration Closed")).toBeVisible();

        // 16. [Admin] Cancel event with reason
        await context.clearCookies();
        await page.goto("/login");
        await page.fill('input[name="email"]', ADMIN_EMAIL);
        await page.fill('input[name="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/dashboard", { timeout: 15000 });

        await page.goto("/admin/events");
        const adminEventRowToCancel = page.locator('.group').filter({ hasText: publishedTitle });

        // Hover over the trigger to show the menu
        const menuTrigger = adminEventRowToCancel.locator('div.relative.group\\/menu button').first();
        await menuTrigger.hover();

        // Handle the prompt for cancellation reason
        page.once('dialog', async dialog => {
            if (dialog.type() === 'prompt') {
                await dialog.accept("Cancelled due to bad weather.");
            } else {
                await dialog.accept();
            }
        });

        await page.waitForTimeout(1000);
        await page.click('button:has-text("Cancel Event")');

        // 17. Verify event no longer visible (in public)
        await context.clearCookies();
        await page.goto("/login");
        await page.fill('input[name="email"]', USER_EMAIL);
        await page.fill('input[name="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/dashboard", { timeout: 15000 });

        await page.goto("/dashboard/events");
        await expect(page.getByText(publishedTitle)).not.toBeVisible({ timeout: 5000 });
    });

    test.afterAll(async () => {
        try {
            await prisma.eventRegistration.deleteMany({
                where: { user: { email: { startsWith: PREFIX } } }
            });
            await prisma.activityLog.deleteMany({
                where: { user: { email: { startsWith: PREFIX } } }
            });
            await prisma.event.deleteMany({
                where: { title: { startsWith: PREFIX } }
            });
            await prisma.user.deleteMany({
                where: { email: { startsWith: PREFIX } }
            });
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
