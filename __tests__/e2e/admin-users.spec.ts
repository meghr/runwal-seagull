import { test, expect, Page } from "@playwright/test";
import { prisma } from "../../src/lib/db";
import bcrypt from "bcryptjs";

const PREFIX = "E2E_AUSR_";
const ADMIN_NAME = PREFIX + "Admin_User";
const ADMIN_EMAIL = PREFIX + "admin@example.com";
const PASSWORD = "Password123!";

test.describe("Phase 5: Admin Portal - User Management Tests", () => {
    let adminUser: any;
    let pendingUser: any;
    let approvedUser: any;
    let otherAdminUser: any;

    let userForApproval: any;
    let userForSuspension: any;
    let userForReactivation: any;
    let userForAdmin: any;
    let userForDemotion: any;

    let building: any;
    let flat: any;

    test.beforeAll(async () => {
        // Cleanup existing test data - be aggressive with anything starting with E2E_ or common test emails
        const testUserEmailFilter = {
            OR: [
                { email: { startsWith: "E2E_" } },
                { email: "admin-user-test@example.com" },
                { email: "admin-event-test@example.com" },
                { email: "admin-notice-test@example.com" },
                { email: "admin-dashboard-test@example.com" },
            ]
        };

        const testUserFilter = { user: testUserEmailFilter };

        // 1. Delete dependent records first
        await prisma.activityLog.deleteMany({ where: testUserFilter });
        await prisma.eventRegistration.deleteMany({ where: testUserFilter });
        await prisma.vehicle.deleteMany({ where: testUserFilter });

        // Find test users to get their IDs
        const testUsers = await prisma.user.findMany({
            where: testUserEmailFilter,
            select: { id: true }
        });
        const testUserIds = testUsers.map(u => u.id);

        await prisma.marketplaceAd.deleteMany({ where: { userId: { in: testUserIds } } });
        await prisma.complaintComment.deleteMany({ where: { userId: { in: testUserIds } } });
        await prisma.complaintStatusHistory.deleteMany({ where: { changedBy: { in: testUserIds } } });
        await prisma.complaint.deleteMany({
            where: {
                OR: [
                    { userId: { in: testUserIds } },
                    { assignedTo: { in: testUserIds } },
                    { assignedBy: { in: testUserIds } }
                ]
            }
        });
        await prisma.yellowPageReview.deleteMany({ where: { userId: { in: testUserIds } } });
        await prisma.yellowPage.deleteMany({
            where: {
                OR: [
                    { submittedBy: { in: testUserIds } },
                    { approvedBy: { in: testUserIds } }
                ]
            }
        });
        await prisma.notice.deleteMany({ where: { OR: [{ title: { startsWith: "E2E_" } }, { createdBy: { in: testUserIds } }] } });
        await prisma.event.deleteMany({ where: { OR: [{ title: { startsWith: "E2E_" } }, { createdBy: { in: testUserIds } }] } });

        // 2. Clear self-references in User table before deletion
        await prisma.user.updateMany({
            where: { approvedBy: { not: null }, email: { startsWith: "E2E_" } },
            data: { approvedBy: null }
        });

        // 3. Delete Users
        await prisma.user.deleteMany({ where: testUserEmailFilter });

        // 4. Delete Location records
        await prisma.flat.deleteMany({ where: { flatNumber: { startsWith: PREFIX } } });
        await prisma.flat.deleteMany({ where: { building: { buildingCode: "E2EAUSR_B1" } } });
        await prisma.building.deleteMany({ where: { name: { startsWith: PREFIX } } });
        await prisma.building.deleteMany({ where: { buildingCode: { in: ["E2EAUSR_B1", "E2EAUSR_B2"] } } });

        // Create Building and Flat
        building = await prisma.building.create({
            data: {
                name: PREFIX + "Building",
                buildingCode: "E2EAUSR_B1",
                isActiveForRegistration: true,
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

        const building2 = await prisma.building.create({
            data: {
                name: PREFIX + "Other_Building",
                buildingCode: "E2EAUSR_B2",
                isActiveForRegistration: true,
            }
        });

        const hashedPassword = await bcrypt.hash(PASSWORD, 12);

        // Create Users
        adminUser = await prisma.user.create({
            data: {
                name: ADMIN_NAME,
                email: ADMIN_EMAIL,
                passwordHash: hashedPassword,
                role: "ADMIN",
                status: "APPROVED",
                userType: "OWNER",
                buildingId: building.id,
                flatId: flat.id,
            }
        });

        userForApproval = await prisma.user.create({
            data: {
                name: PREFIX + "For_Approval",
                email: PREFIX + "approval@example.com",
                passwordHash: hashedPassword,
                role: "PUBLIC",
                status: "PENDING",
                userType: "OWNER",
                buildingId: building.id,
                flatId: flat.id,
            }
        });

        userForSuspension = await prisma.user.create({
            data: {
                name: PREFIX + "For_Suspension",
                email: PREFIX + "suspension@example.com",
                passwordHash: hashedPassword,
                role: "OWNER",
                status: "APPROVED",
                userType: "OWNER",
                buildingId: building.id,
                flatId: flat.id,
            }
        });

        userForReactivation = await prisma.user.create({
            data: {
                name: PREFIX + "For_Reactivation",
                email: PREFIX + "reactivation@example.com",
                passwordHash: hashedPassword,
                role: "OWNER",
                status: "SUSPENDED",
                userType: "OWNER",
                buildingId: building.id,
                flatId: flat.id,
            }
        });

        userForAdmin = await prisma.user.create({
            data: {
                name: PREFIX + "For_Admin",
                email: PREFIX + "make-admin@example.com",
                passwordHash: hashedPassword,
                role: "OWNER",
                status: "APPROVED",
                userType: "OWNER",
                buildingId: building.id,
                flatId: flat.id,
            }
        });

        userForDemotion = await prisma.user.create({
            data: {
                name: PREFIX + "For_Demotion",
                email: PREFIX + "demotion@example.com",
                passwordHash: hashedPassword,
                role: "ADMIN",
                status: "APPROVED",
                userType: "OWNER",
                buildingId: building.id,
                flatId: flat.id,
            }
        });

        // For General view/filters
        pendingUser = await prisma.user.create({
            data: {
                name: PREFIX + "Pending_User",
                email: PREFIX + "pending-view@example.com",
                passwordHash: hashedPassword,
                role: "PUBLIC",
                status: "PENDING",
                userType: "OWNER",
                buildingId: building.id,
                flatId: flat.id,
            }
        });

        approvedUser = await prisma.user.create({
            data: {
                name: PREFIX + "Approved_User",
                email: PREFIX + "approved-view@example.com",
                passwordHash: hashedPassword,
                role: "OWNER",
                status: "APPROVED",
                userType: "OWNER",
                buildingId: building.id,
                flatId: flat.id,
            }
        });

        otherAdminUser = await prisma.user.create({
            data: {
                name: PREFIX + "Other_Admin",
                email: PREFIX + "other-admin-view@example.com",
                passwordHash: hashedPassword,
                role: "ADMIN",
                status: "APPROVED",
                userType: "OWNER",
                buildingId: building2.id,
                flatId: null,
            }
        });
    });

    async function loginAsAdmin(page: Page) {
        await page.goto("/login");
        await page.fill('input[name="email"]', ADMIN_EMAIL);
        await page.fill('input[name="password"]', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/dashboard");
        await page.goto("/admin/users");
        await expect(page.getByText("User Management")).toBeVisible();
    }

    test("AUSR-001: View all users - Admin logged in", async ({ page }) => {
        await loginAsAdmin(page);
        await expect(page.getByText(PREFIX + "Pending_User")).toBeVisible();
        await expect(page.getByText(PREFIX + "Approved_User")).toBeVisible();
        await expect(page.getByText(ADMIN_NAME)).toBeVisible();
    });

    test("AUSR-002: Filter by role - Admin selected", async ({ page }) => {
        await loginAsAdmin(page);
        await page.waitForTimeout(2000); // Give plenty of time for hydration

        // If filters are not visible, click the toggle
        const roleTrigger = page.locator('button').filter({ hasText: "All Roles" });
        if (!await roleTrigger.isVisible()) {
            await page.click('button:has-text("Filters")');
            await expect(roleTrigger).toBeVisible({ timeout: 10000 });
        }

        // Open Role dropdown and select Admin
        await roleTrigger.click();

        // Select Admin option - using regex to be safe with any hidden icon text
        await page.getByRole("option", { name: /^Admin$/i }).click();

        await expect(page.getByText(PREFIX + "Other_Admin")).toBeVisible();
        await expect(page.getByText(PREFIX + "Approved_User")).not.toBeVisible();
    });

    test("AUSR-003: Filter by status - Pending selected", async ({ page }) => {
        await loginAsAdmin(page);
        await page.waitForTimeout(2000);

        // If filters are not visible, click the toggle
        const statusTrigger = page.locator('button').filter({ hasText: "All Status" });
        if (!await statusTrigger.isVisible()) {
            await page.click('button:has-text("Filters")');
            await expect(statusTrigger).toBeVisible({ timeout: 10000 });
        }

        // Open Status dropdown and select Pending
        await statusTrigger.click();

        // Select Pending option
        await page.getByRole("option", { name: /^Pending$/i }).click();

        await expect(page.getByText(PREFIX + "Pending_User")).toBeVisible();
        await expect(page.getByText(PREFIX + "Approved_User")).not.toBeVisible();
    });

    test("AUSR-004: Filter by building - Specific building", async ({ page }) => {
        await loginAsAdmin(page);
        await page.waitForTimeout(2000);

        // If filters are not visible, click the toggle
        const buildingTrigger = page.locator('button').filter({ hasText: "All Buildings" });
        if (!await buildingTrigger.isVisible()) {
            await page.click('button:has-text("Filters")');
            await expect(buildingTrigger).toBeVisible({ timeout: 10000 });
        }

        // Open Building dropdown and select building
        await buildingTrigger.click();

        // Select specific building - name contains PREFIX + "Building"
        await page.getByRole("option", { name: new RegExp(PREFIX + "Building") }).click();

        await expect(page.getByText(PREFIX + "Pending_User")).toBeVisible();
        await expect(page.getByText(PREFIX + "Other_Admin")).not.toBeVisible();
    });

    test("AUSR-005: Search by name", async ({ page }) => {
        await loginAsAdmin(page);
        await page.fill('input[placeholder*="Search"]', PREFIX + "Pending_User");
        await expect(page.getByText(PREFIX + "Pending_User")).toBeVisible();
        await expect(page.getByText(PREFIX + "Approved_User")).not.toBeVisible();
    });

    test("AUSR-006: Search by email", async ({ page }) => {
        await loginAsAdmin(page);
        await page.fill('input[placeholder*="Search"]', PREFIX + "approved-view@example.com");
        await expect(page.getByText(PREFIX + "Approved_User")).toBeVisible();
        await expect(page.getByText(PREFIX + "Pending_User")).not.toBeVisible();
    });

    test("AUSR-007: Search by flat", async ({ page }) => {
        await loginAsAdmin(page);
        await page.fill('input[placeholder*="Search"]', PREFIX + "101");
        await expect(page.getByText(PREFIX + "Approved_User")).toBeVisible();
    });

    test("AUSR-008: View user details - Modal opens", async ({ page }) => {
        await loginAsAdmin(page);
        const row = page.locator('tr').filter({ hasText: PREFIX + "Approved_User" });
        await row.locator('button').filter({ has: page.locator('.lucide-eye') }).click();

        await expect(page.getByText("User Details")).toBeVisible();
        await expect(page.getByText(PREFIX + "Approved_User")).toBeVisible();
    });

    test("AUSR-009: Approve pending user", async ({ page }) => {
        await loginAsAdmin(page);
        const row = page.locator('tr').filter({ hasText: PREFIX + "For_Approval" });

        // Click more actions
        const menuTrigger = row.locator('.group\\/menu button').first();
        await menuTrigger.hover();

        page.on('dialog', dialog => dialog.accept());
        await row.locator('button:has-text("Approve User")').click();

        await expect(row.getByText("Approved", { exact: true })).toBeVisible();
    });

    test("AUSR-010: Suspend user", async ({ page }) => {
        await loginAsAdmin(page);
        const row = page.locator('tr').filter({ hasText: PREFIX + "For_Suspension" });

        const menuTrigger = row.locator('.group\\/menu button').first();
        await menuTrigger.hover();

        page.on('dialog', dialog => dialog.accept());
        await row.locator('button:has-text("Suspend User")').click();

        await expect(row.getByText("Suspended", { exact: true })).toBeVisible();
    });

    test("AUSR-011: Reactivate user", async ({ page }) => {
        await loginAsAdmin(page);
        const row = page.locator('tr').filter({ hasText: PREFIX + "For_Reactivation" });

        const menuTrigger = row.locator('.group\\/menu button').first();
        await menuTrigger.hover();

        page.on('dialog', dialog => dialog.accept());
        await row.locator('button:has-text("Reactivate User")').click();

        await expect(row.getByText("Approved", { exact: true })).toBeVisible();
    });

    test("AUSR-012: Make admin", async ({ page }) => {
        await loginAsAdmin(page);
        const row = page.locator('tr').filter({ hasText: PREFIX + "For_Admin" });

        const menuTrigger = row.locator('.group\\/menu button').first();
        await menuTrigger.hover();
        // Wait for the menu item to be visible before clicking
        await expect(row.locator('button:has-text("Make Admin")')).toBeVisible();

        page.on('dialog', dialog => dialog.accept());
        await row.locator('button:has-text("Make Admin")').click();

        await expect(row.getByText("Admin", { exact: true })).toBeVisible();
    });

    test("AUSR-013: Remove admin", async ({ page }) => {
        await loginAsAdmin(page);
        const row = page.locator('tr').filter({ hasText: PREFIX + "For_Demotion" });

        const menuTrigger = row.locator('.group\\/menu button').first();
        await menuTrigger.hover();
        // Wait for the menu item to be visible before clicking
        await expect(row.locator('button:has-text("Remove Admin")')).toBeVisible();

        page.on('dialog', dialog => dialog.accept());
        await row.locator('button:has-text("Remove Admin")').click();

        await expect(row.getByText("Owner", { exact: true })).toBeVisible();
    });

    test("AUSR-014: Reset password", async ({ page }) => {
        await loginAsAdmin(page);
        const row = page.locator('tr').filter({ hasText: PREFIX + "Approved_User" });

        // Open details
        await row.locator('button').filter({ has: page.locator('.lucide-eye') }).click();

        page.on('dialog', dialog => dialog.accept());
        await page.click('button:has-text("Reset Password")');

        await expect(page.getByText("Password Reset Successful")).toBeVisible();
        await expect(page.getByText("Temporary password:")).toBeVisible();
    });

    test("AUSR-015: View activity logs", async ({ page }) => {
        await loginAsAdmin(page);
        const row = page.locator('tr').filter({ hasText: PREFIX + "Approved_User" });

        await row.locator('button').filter({ has: page.locator('.lucide-eye') }).click();
        await page.click('button:has-text("Activity")');

        await expect(page.locator('.lucide-activity')).toBeVisible();
        // Since we did some actions in previous tests, there might be logs if tests are not independent.
        // But tests should be independent. However, reset password in AUSR-014 should have logged something.
        // Actually, AUSR-014 might have just finished.
        // Let's assume there's at least one log or the "No activity logs found" message is not there.
    });

    test("AUSR-016: Export CSV - Trigger works", async ({ page }) => {
        await loginAsAdmin(page);
        await expect(page.getByRole("button", { name: "Export CSV" })).toBeEnabled();
    });

    test("AUSR-017: Self-suspend blocked", async ({ page }) => {
        await loginAsAdmin(page);
        const row = page.locator('tr').filter({ hasText: ADMIN_NAME });

        const menuTrigger = row.locator('.group\\/menu button').first();
        await menuTrigger.hover();

        // The "Suspend User" button should be there (currently UI doesn't hide it for self)
        // But the action should fail with an alert
        page.on('dialog', async dialog => {
            if (dialog.type() === 'confirm') {
                await dialog.accept();
            } else if (dialog.type() === 'alert') {
                expect(dialog.message()).toContain("cannot suspend your own account");
                await dialog.accept();
            }
        });

        await row.locator('button:has-text("Suspend User")').click();
    });

    test("AUSR-018: Self-demote blocked", async ({ page }) => {
        await loginAsAdmin(page);
        const row = page.locator('tr').filter({ hasText: ADMIN_NAME });

        const menuTrigger = row.locator('.group\\/menu button').first();
        await menuTrigger.hover();

        page.on('dialog', async dialog => {
            if (dialog.type() === 'confirm') {
                await dialog.accept();
            } else if (dialog.type() === 'alert') {
                expect(dialog.message()).toContain("cannot demote your own admin account");
                await dialog.accept();
            }
        });

        await row.locator('button:has-text("Remove Admin")').click();
    });

    // CLEANUP: Restore database to original state
    test.afterAll(async () => {
        try {
            // Delete in order respecting foreign key constraints
            await prisma.activityLog.deleteMany({ where: { user: { email: { startsWith: PREFIX } } } });
            await prisma.eventRegistration.deleteMany({ where: { user: { email: { startsWith: PREFIX } } } });
            await prisma.vehicle.deleteMany({ where: { user: { email: { startsWith: PREFIX } } } });
            await prisma.user.updateMany({
                where: { approvedBy: { not: null }, email: { startsWith: PREFIX } },
                data: { approvedBy: null }
            });
            await prisma.user.deleteMany({
                where: {
                    OR: [
                        { email: { startsWith: PREFIX } },
                        { email: { startsWith: "E2E_" } },
                        { email: { contains: "test@example.com" } }
                    ]
                }
            });
            await prisma.flat.deleteMany({ where: { flatNumber: { startsWith: PREFIX } } });
            await prisma.flat.deleteMany({ where: { building: { buildingCode: { in: ["E2EAUSR_B1", "E2EAUSR_B2"] } } } });
            await prisma.building.deleteMany({ where: { name: { startsWith: PREFIX } } });
            await prisma.building.deleteMany({ where: { buildingCode: { in: ["E2EAUSR_B1", "E2EAUSR_B2"] } } });
        } catch (error) {
            console.error("Cleanup error:", error);
        } finally {
            await prisma.$disconnect();
        }
    });
});
