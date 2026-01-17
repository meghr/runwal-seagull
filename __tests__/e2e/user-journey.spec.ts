import { test, expect, Page } from "@playwright/test";
import { prisma } from "../../src/lib/db";
import bcrypt from "bcryptjs";

const PREFIX = "E2E_JOURNEY_";
const ADMIN_EMAIL = PREFIX + "admin@example.com";
const NEW_USER_EMAIL = PREFIX + "newuser@test.com";
const PASSWORD = "Password123!";
const NEW_USER_PASSWORD = "Test@12345";

test.describe("E2E-001: Complete New User Registration to Dashboard Access", () => {
    let building: any;
    let flat: any;
    let adminUser: any;

    test.beforeAll(async () => {
        // Cleanup existing test data
        const testUserEmails = [ADMIN_EMAIL, NEW_USER_EMAIL];

        await prisma.activityLog.deleteMany({
            where: { user: { email: { in: testUserEmails } } }
        });
        await prisma.vehicle.deleteMany({
            where: { user: { email: { in: testUserEmails } } }
        });
        await prisma.eventRegistration.deleteMany({
            where: { user: { email: { in: testUserEmails } } }
        });
        await prisma.user.deleteMany({
            where: { email: { in: testUserEmails } }
        });
        await prisma.flat.deleteMany({
            where: { flatNumber: { startsWith: PREFIX } }
        });
        await prisma.flat.deleteMany({
            where: { building: { buildingCode: "E2EJN_BA1" } }
        });
        await prisma.building.deleteMany({
            where: { name: { startsWith: PREFIX } }
        });
        await prisma.building.deleteMany({
            where: { buildingCode: "E2EJN_BA1" }
        });

        // Create Building and Flat
        building = await prisma.building.create({
            data: {
                name: PREFIX + "Building A",
                buildingCode: "E2EJN_BA1",
                isActiveForRegistration: true,
            }
        });

        flat = await prisma.flat.create({
            data: {
                flatNumber: "1004",
                floorNumber: 1,
                buildingId: building.id,
                bhkType: "2BHK",
            }
        });

        const hashedPassword = await bcrypt.hash(PASSWORD, 12);

        // Create Admin User
        adminUser = await prisma.user.create({
            data: {
                name: PREFIX + "Admin",
                email: ADMIN_EMAIL,
                passwordHash: hashedPassword,
                role: "ADMIN",
                status: "APPROVED",
                userType: "OWNER",
                buildingId: building.id,
                flatId: flat.id,
            }
        });
    });

    test("Execute complete user journey", async ({ page }) => {
        // 1. Navigate to landing page (/)
        await page.goto("/");
        await expect(page).toHaveTitle(/Runwal Seagull/);

        // 2. Click "Register" button
        await page.click('a:has-text("Register")');
        await page.waitForURL("**/register");

        // 3. Fill registration form
        await page.fill('input[name="name"]', PREFIX + "Test User");
        await page.fill('input[name="email"]', NEW_USER_EMAIL);
        await page.fill('input[name="phoneNumber"]', "9876543210");
        await page.fill('input[name="password"]', NEW_USER_PASSWORD);
        await page.fill('input[name="confirmPassword"]', NEW_USER_PASSWORD);

        // Select User Type (Owner) - it's a button that gets active class
        await page.click('button:has-text("Owner")');

        // Select Building - it's a native select
        await page.selectOption('select[name="buildingId"]', { label: "E2EJN_BA1" });

        // Select Flat - it's a manual input now
        // Wait for it to be enabled after building selection
        const flatInput = page.locator('input[name="flatNumber"]');
        await expect(flatInput).toBeEnabled();
        await flatInput.fill("1004");

        // 4. Submit form
        await page.click('button[type="submit"]');

        // 5. Verify redirect to pending approval page
        await page.waitForURL("**/pending-approval", { timeout: 15000 });
        await expect(page.getByText("Registration Successful")).toBeVisible();
        await expect(page.getByText("Pending Approval")).toBeVisible();

        // 6. [Admin] Login as admin
        await page.goto("/login");
        await page.fill('input[name="email"]', ADMIN_EMAIL);
        await page.fill('input[name="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/dashboard", { timeout: 15000 });

        // 7. [Admin] Navigate to user management
        await page.goto("/admin/users");
        await expect(page.getByText("User Management")).toBeVisible();

        // 8. [Admin] Find pending user
        const row = page.locator('tr').filter({ hasText: NEW_USER_EMAIL });
        await expect(row).toBeVisible({ timeout: 10000 });
        await expect(row.getByText("Pending", { exact: true })).toBeVisible();

        // 9. [Admin] Approve user
        const menuTrigger = row.locator('.group\\/menu button').first();
        await menuTrigger.hover();
        await expect(row.locator('button:has-text("Approve User")')).toBeVisible({ timeout: 5000 });

        page.on('dialog', dialog => dialog.accept());
        await row.locator('button:has-text("Approve User")').click();

        // Verify status change in UI
        await expect(row.getByText("Approved", { exact: true })).toBeVisible({ timeout: 10000 });

        // Logout (button says "Sign Out" not "Logout")
        await page.click('button:has-text("Sign Out")');
        // Wait for signout to process and redirect
        await page.waitForURL("**/login", { timeout: 10000 }).catch(() => {
            // If not redirected to login, manually navigate
        });
        await page.goto("/login");

        // 10. [User] Login as new user
        await page.fill('input[name="email"]', NEW_USER_EMAIL);
        await page.fill('input[name="password"]', NEW_USER_PASSWORD);
        await page.click('button[type="submit"]');

        // 11. Verify redirect to dashboard
        await page.waitForURL("**/dashboard", { timeout: 15000 });
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

        // 12. Verify welcome message shows correct name
        await expect(page.getByText(`Welcome back, ${PREFIX}Test User`)).toBeVisible();

        // 13. Navigate to profile
        await page.goto("/dashboard/profile");
        await expect(page.getByText("My Profile")).toBeVisible();

        // 14. Verify profile information correct
        // Name input - verify the name field has correct value
        const formInputs = page.locator('form input:not([disabled])').first();
        await expect(formInputs).toHaveValue(PREFIX + "Test User");

        // Email input (disabled) - should show user email
        const emailInput = page.locator('input[disabled]').first();
        await expect(emailInput).toHaveValue(NEW_USER_EMAIL);

        // Building and Flat (in the My Residence section)
        const residenceSection = page.locator('text=My Residence').locator('..');
        await expect(page.getByText(PREFIX + "Building A")).toBeVisible();
        await expect(page.getByText("1004")).toBeVisible();
    });

    // Cleanup: Delete test user, reset flat assignment
    test.afterAll(async () => {
        const testUserEmails = [ADMIN_EMAIL, NEW_USER_EMAIL];

        try {
            // Cleanup in order respecting foreign key constraints
            await prisma.activityLog.deleteMany({
                where: { user: { email: { in: testUserEmails } } }
            });
            await prisma.vehicle.deleteMany({
                where: { user: { email: { in: testUserEmails } } }
            });
            await prisma.eventRegistration.deleteMany({
                where: { user: { email: { in: testUserEmails } } }
            });
            await prisma.user.deleteMany({
                where: { email: { in: testUserEmails } }
            });
            await prisma.flat.deleteMany({
                where: { flatNumber: { startsWith: PREFIX } }
            });
            await prisma.flat.deleteMany({
                where: { building: { buildingCode: "E2EJN_BA1" } }
            });
            await prisma.building.deleteMany({
                where: { name: { startsWith: PREFIX } }
            });
            await prisma.building.deleteMany({
                where: { buildingCode: "E2EJN_BA1" }
            });
        } catch (error) {
            console.error("Cleanup error:", error);
        } finally {
            await prisma.$disconnect();
        }
    });
});
