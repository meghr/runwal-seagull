import { test, expect } from "@playwright/test";
import { prisma } from "../../src/lib/db";
import bcrypt from "bcryptjs";

const PREFIX = "E2E_ADMIN_USER_";
const ADMIN_EMAIL = PREFIX + "admin@example.com";
const USER_EMAIL = PREFIX + "testuser@example.com";
const PASSWORD = "Password123!";
const NEW_PASSWORD = "NewPassword123!";

test.describe("E2E-005: Admin User Lifecycle Management", () => {
    let building: any;
    let flat: any;
    let admin: any;

    test.setTimeout(180000); // 3 minutes for this long flow

    test.beforeAll(async () => {
        // Cleanup existing test data
        await prisma.activityLog.deleteMany({
            where: { user: { email: { startsWith: PREFIX } } }
        });
        await prisma.user.deleteMany({
            where: { email: { startsWith: PREFIX } }
        });
        await prisma.flat.deleteMany({
            where: { flatNumber: { startsWith: PREFIX } }
        });
        await prisma.flat.deleteMany({
            where: { building: { buildingCode: "E2E_EB5" } }
        });
        await prisma.building.deleteMany({
            where: { name: { startsWith: PREFIX } }
        });
        await prisma.building.deleteMany({
            where: { buildingCode: "E2E_EB5" }
        });

        // Create Building and Flat
        building = await prisma.building.create({
            data: {
                name: PREFIX + "Building B",
                buildingCode: "E2E_EB5",
                isActiveForRegistration: true,
            }
        });

        flat = await prisma.flat.create({
            data: {
                flatNumber: "1505",
                floorNumber: 5,
                buildingId: building.id,
                bhkType: "3BHK",
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
    });

    test("Admin full user lifecycle management", async ({ page, context }) => {
        // 1. Create test user via registration
        await page.goto("/register");
        await page.click('button:has-text("Owner")'); // Default but good to be explicit
        await page.fill('input[name="name"]', PREFIX + "Test User");
        await page.fill('input[name="email"]', USER_EMAIL);
        await page.fill('input[name="phoneNumber"]', "9876543210");

        // Select Building
        await page.selectOption('select[name="buildingId"]', building.id);

        // Select Flat
        await page.locator('input[name="flatNumber"]').fill("1505");

        await page.fill('input[name="password"]', PASSWORD);
        await page.fill('input[name="confirmPassword"]', PASSWORD);

        await page.click('button[type="submit"]');

        // Wait for redirect to pending-approval or success message
        await expect(page).toHaveURL(/\/pending-approval/, { timeout: 15000 });
        await expect(page.getByText("Registration Successful")).toBeVisible();

        // 2. Login as admin
        await context.clearCookies();
        await page.goto("/login");
        await page.fill('input[name="email"]', ADMIN_EMAIL);
        await page.fill('input[name="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/dashboard", { timeout: 15000 });

        // 3. Navigate to user management
        await page.goto("/admin/users");
        await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();

        // 4. Verify user in list (should be pending)
        await page.fill('input[placeholder*="Search"]', USER_EMAIL);
        const userRow = page.locator('tr').filter({ hasText: USER_EMAIL });
        await expect(userRow).toBeVisible();
        await expect(userRow.getByText("Pending")).toBeVisible();

        // 5. View user details
        await userRow.locator('button:has(svg.lucide-eye)').click();
        await expect(page.getByText("User Details")).toBeVisible();
        await expect(page.getByText(PREFIX + "Test User")).toBeVisible();

        // 6. Approve user
        page.once('dialog', dialog => dialog.accept());
        await page.waitForTimeout(1000);
        const modal = page.locator('div.relative.bg-slate-900').filter({ hasText: "User Details" });
        await modal.getByRole('button', { name: "Approve", exact: true }).click();
        // Status should change to Approved
        await expect(modal.locator('div.flex.flex-wrap.gap-2.mt-2').getByText("Approved")).toBeVisible();

        // 8. Change role to Admin
        page.once('dialog', dialog => dialog.accept());
        await page.waitForTimeout(1000);
        await modal.getByRole('button', { name: "Make Admin", exact: true }).click();
        await expect(modal.locator('div.flex.flex-wrap.gap-2.mt-2').getByText("Admin")).toBeVisible();

        // 10. Remove admin role
        page.once('dialog', dialog => dialog.accept());
        await page.waitForTimeout(1000);
        await modal.getByRole('button', { name: "Remove Admin", exact: true }).click();
        await expect(modal.locator('div.flex.flex-wrap.gap-2.mt-2').getByText("Owner")).toBeVisible();

        // 12. Suspend user
        page.once('dialog', dialog => dialog.accept());
        await page.waitForTimeout(1000);
        await modal.getByRole('button', { name: "Suspend", exact: true }).click();
        await expect(modal.locator('div.flex.flex-wrap.gap-2.mt-2').getByText("Suspended")).toBeVisible();

        // 13. [User] Attempt login - should fail
        await context.clearCookies();
        await page.goto("/login");
        await page.fill('input[name="email"]', USER_EMAIL);
        await page.fill('input[name="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await expect(page.getByText(/Account suspended/i)).toBeVisible();

        // 14. [Admin] Reactivate user
        await context.clearCookies();
        await page.goto("/login");
        await page.fill('input[name="email"]', ADMIN_EMAIL);
        await page.fill('input[name="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/dashboard", { timeout: 15000 });
        await page.goto("/admin/users");

        await page.fill('input[placeholder*="Search"]', USER_EMAIL);
        await page.locator('tr').filter({ hasText: USER_EMAIL }).locator('button:has(svg.lucide-eye)').click();

        page.once('dialog', dialog => dialog.accept());
        await page.waitForTimeout(1000);
        const modal2 = page.locator('div.relative.bg-slate-900').filter({ hasText: "User Details" });
        await modal2.getByRole('button', { name: "Reactivate", exact: true }).click();
        await expect(modal2.locator('div.flex.flex-wrap.gap-2.mt-2').getByText("Approved")).toBeVisible();

        // 15. [User] Login successfully
        await context.clearCookies();
        await page.goto("/login");
        await page.fill('input[name="email"]', USER_EMAIL);
        await page.fill('input[name="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/dashboard", { timeout: 15000 });

        // 16. [Admin] Reset password
        await context.clearCookies();
        await page.goto("/login");
        await page.fill('input[name="email"]', ADMIN_EMAIL);
        await page.fill('input[name="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/dashboard", { timeout: 15000 });
        await page.goto("/admin/users");

        await page.fill('input[placeholder*="Search"]', USER_EMAIL);
        await page.locator('tr').filter({ hasText: USER_EMAIL }).locator('button:has(svg.lucide-eye)').click();

        page.once('dialog', dialog => dialog.accept());
        await page.click('button:has-text("Reset Password")');

        // 17. Copy temporary password
        const tempPasswordElement = page.locator('code.bg-emerald-500\\/20');
        await expect(tempPasswordElement).toBeVisible();
        const tempPassword = await tempPasswordElement.innerText();
        console.log("Temporary Password:", tempPassword);

        // 18. [User] Login with temp password
        await context.clearCookies();
        await page.goto("/login");
        await page.fill('input[name="email"]', USER_EMAIL);
        await page.fill('input[name="password"]', tempPassword);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/dashboard", { timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    });

    test.afterAll(async () => {
        try {
            await prisma.activityLog.deleteMany({
                where: { user: { email: { startsWith: PREFIX } } }
            });
            await prisma.user.deleteMany({
                where: { email: { startsWith: PREFIX } }
            });
            await prisma.flat.deleteMany({
                where: { flatNumber: { startsWith: PREFIX } }
            });
            await prisma.flat.deleteMany({
                where: { building: { buildingCode: "E2E_EB5" } }
            });
            await prisma.building.deleteMany({
                where: { name: { startsWith: PREFIX } }
            });
            await prisma.building.deleteMany({
                where: { buildingCode: "E2E_EB5" }
            });
        } catch (error) {
            console.error("Cleanup error:", error);
        } finally {
            await prisma.$disconnect();
        }
    });
});
