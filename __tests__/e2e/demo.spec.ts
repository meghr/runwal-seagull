import { test, expect } from "@playwright/test";
import { prisma } from "../../src/lib/db";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const PREFIX = "E2E_TEAM_REG_";
const USER_EMAIL = PREFIX + "user@example.com";
const ADMIN_EMAIL = PREFIX + "admin@example.com";
const PASSWORD = "Password123!";

test.describe("E2E-003: Complete Event Registration (Team)", () => {
    let building: any;
    let flat: any;
    let user: any;
    let admin: any;
    let event: any;

    test.beforeAll(async () => {
        // Cleanup existing test data
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
                buildingCode: "ET1",
            }
        });

        flat = await prisma.flat.create({
            data: {
                flatNumber: PREFIX + "101",
                floorNumber: 1,
                buildingId: building.id,
                bhkType: "3BHK",
            }
        });

        const hashedPassword = await bcrypt.hash(PASSWORD, 12);

        // Create Test User (APPROVED)
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

        // Create Admin User
        admin = await prisma.user.create({
            data: {
                name: PREFIX + "Admin User",
                email: ADMIN_EMAIL,
                passwordHash: hashedPassword,
                role: "ADMIN",
                status: "APPROVED",
            }
        });

        // Create TEAM Event with open registration
        const now = new Date();
        const startDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
        const endDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000);
        const regStartDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
        const regEndDate = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000);

        event = await prisma.event.create({
            data: {
                title: PREFIX + "Cricket Tournament",
                description: "Annual community cricket tournament. Teams of 3 required.",
                eventType: "SPORTS",
                startDate,
                endDate,
                venue: "Main Ground",
                registrationRequired: true,
                registrationStartDate: regStartDate,
                registrationEndDate: regEndDate,
                participationType: "TEAM",
                maxParticipants: 30, // 30 registrations (teams)
                published: true,
                creator: {
                    connect: { id: admin.id }
                }
            }
        });
    });

    test("Execute complete team event registration flow", async ({ page, context }) => {
        // 1. Login as approved user
        await context.clearCookies();
        await page.goto("/login");
        await page.fill('input[name="email"]', USER_EMAIL);
        await page.fill('input[name="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/dashboard", { timeout: 15000 });

        // 2. Navigate to events page and select our team event
        await page.goto(`/dashboard/events/${event.id}`);
        await expect(page.getByRole('heading', { name: PREFIX + "Cricket Tournament" })).toBeVisible();

        // 3. Click "Register for This Event" button
        await page.click('button:has-text("Register for This Event")');

        // Wait for modal to open
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByRole('dialog').getByText("Team Event")).toBeVisible();

        // 4. Add team member 1
        // The first member input is already there by default (from component state: [{ name: "", email: "", phone: "" }])
        await page.locator('input[placeholder="Name *"]').fill("Team Member 1");
        await page.locator('input[placeholder="Phone"]').fill("1111111111");

        // 5. Add team member 2
        await page.click('button:has-text("Add Member")');
        // Now there should be two sets of inputs. Use nth(1) for the second set.
        await page.locator('input[placeholder="Name *"]').nth(1).fill("Team Member 2");
        await page.locator('input[placeholder="Phone"]').nth(1).fill("2222222222");

        // 6. Submit registration
        await page.click('button:has-text("Confirm Registration")');

        // 7. Verify success message
        await expect(page.getByText("Registration Successful!")).toBeVisible({ timeout: 10000 });

        // Wait for modal to close
        await page.waitForTimeout(2500);

        // 8. Navigate to "My Registrations"
        await page.goto("/dashboard/events/my-registrations");
        await page.click('button:has-text("All")');
        await expect(page.getByText(PREFIX + "Cricket Tournament")).toBeVisible();

        // Verify team details: it shows "Team: Member 1, Member 2"
        await expect(page.getByText("Team Member 1, Team Member 2")).toBeVisible();

        // 9. [Admin] Login as admin
        await context.clearCookies();
        await page.goto("/login");
        await page.fill('input[name="email"]', ADMIN_EMAIL);
        await page.fill('input[name="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/dashboard", { timeout: 15000 });

        // 10. [Admin] View registration dashboard
        await page.goto(`/admin/events/${event.id}/registrations`);
        await expect(page.getByRole('heading', { name: PREFIX + "Cricket Tournament" })).toBeVisible();
        await expect(page.getByText("Registration Dashboard")).toBeVisible();

        // 11. [Admin] Verify team members listed
        // Find the registration in the table and click it to open details
        await page.getByText(PREFIX + "Normal User").click();

        // Modal should open with team members
        await expect(page.getByText("Team Member 1")).toBeVisible();
        await expect(page.getByText("1111111111")).toBeVisible();
        await expect(page.getByText("Team Member 2")).toBeVisible();
        await expect(page.getByText("2222222222")).toBeVisible();

        // Close details modal - use exact match or scope to modal to avoid "Close Registration" button
        await page.getByRole('button', { name: /^Close$/ }).click();

        // 12. [Admin] Export CSV
        const downloadPromise = page.waitForEvent('download');
        await page.click('button:has-text("Export CSV")');
        const download = await downloadPromise;

        // Save the download to a temporary path
        const downloadPath = path.join(__dirname, 'test-export.csv');
        await download.saveAs(downloadPath);

        // 13. Verify CSV contains team data
        // The event title is in the filename, not the content
        expect(download.suggestedFilename()).toContain(PREFIX + "Cricket_Tournament");

        const csvContent = fs.readFileSync(downloadPath, 'utf8');
        expect(csvContent).toContain("Team Member 1");
        expect(csvContent).toContain("Team Member 2");

        // Cleanup the file
        fs.unlinkSync(downloadPath);
    });

    // No cleanup for demo
});
