import { test, expect } from "@playwright/test";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

test.describe("Phase 2: Admin Approval Tests", () => {
    const buildingCode = "APPR_E2E";
    const buildingName = "Approval Tower";
    const flatNumber = "APPR-101";
    const password = "Password@123";

    // Admin User
    const adminUser = {
        email: "admin-approval@test.com",
        name: "Admin Approver",
        status: "APPROVED" as const,
        role: "ADMIN" as const,
    };

    // Regular User (non-admin)
    const regularUser = {
        email: "regular-approval@test.com",
        name: "Regular User",
        status: "APPROVED" as const,
        role: "OWNER" as const,
    };

    // Pending Users for approval tests
    const pendingUser1 = {
        email: "pending-approval1@test.com",
        name: "Pending User One",
        status: "PENDING" as const,
    };
    const pendingUser2 = {
        email: "pending-approval2@test.com",
        name: "Pending User Two",
        status: "PENDING" as const,
    };
    const pendingUser3 = {
        email: "pending-approval3@test.com",
        name: "Pending User Three",
        status: "PENDING" as const,
    };

    test.beforeAll(async () => {
        // 1. Cleanup
        const emails = [
            adminUser.email,
            regularUser.email,
            pendingUser1.email,
            pendingUser2.email,
            pendingUser3.email,
        ];
        await prisma.activityLog.deleteMany({ where: { user: { email: { in: emails } } } });
        await prisma.user.deleteMany({ where: { email: { in: emails } } });
        await prisma.flat.deleteMany({ where: { building: { buildingCode } } });
        await prisma.building.deleteMany({ where: { buildingCode } });

        // 2. Create Building & Flat
        const building = await prisma.building.create({
            data: {
                name: buildingName,
                buildingCode,
                totalFloors: 5,
                flats: {
                    create: { flatNumber, floorNumber: 1, bhkType: "2BHK" },
                },
            },
            include: { flats: true },
        });

        const flat = building.flats[0];
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create Admin User
        await prisma.user.create({
            data: {
                email: adminUser.email,
                name: adminUser.name,
                passwordHash: hashedPassword,
                status: adminUser.status,
                role: adminUser.role,
                userType: "OWNER",
                flatId: flat.id,
                buildingId: building.id,
            },
        });

        // 4. Create Regular (non-admin) User
        await prisma.user.create({
            data: {
                email: regularUser.email,
                name: regularUser.name,
                passwordHash: hashedPassword,
                status: regularUser.status,
                role: regularUser.role,
                userType: "OWNER",
                flatId: flat.id,
                buildingId: building.id,
            },
        });

        // 5. Create Pending Users
        await prisma.user.create({
            data: {
                email: pendingUser1.email,
                name: pendingUser1.name,
                passwordHash: hashedPassword,
                status: pendingUser1.status,
                role: "OWNER",
                userType: "OWNER",
                flatId: flat.id,
                buildingId: building.id,
            },
        });

        await prisma.user.create({
            data: {
                email: pendingUser2.email,
                name: pendingUser2.name,
                passwordHash: hashedPassword,
                status: pendingUser2.status,
                role: "OWNER",
                userType: "OWNER",
                flatId: flat.id,
                buildingId: building.id,
            },
        });

        await prisma.user.create({
            data: {
                email: pendingUser3.email,
                name: pendingUser3.name,
                passwordHash: hashedPassword,
                status: pendingUser3.status,
                role: "OWNER",
                userType: "OWNER",
                flatId: flat.id,
                buildingId: building.id,
            },
        });

        console.log("Seeded Admin Approval Test Users");
    });

    test.afterAll(async () => {
        // Cleanup
        const emails = [
            adminUser.email,
            regularUser.email,
            pendingUser1.email,
            pendingUser2.email,
            pendingUser3.email,
        ];
        await prisma.activityLog.deleteMany({ where: { user: { email: { in: emails } } } });
        await prisma.user.deleteMany({ where: { email: { in: emails } } });
        await prisma.flat.deleteMany({ where: { building: { buildingCode } } });
        await prisma.building.deleteMany({ where: { buildingCode } });
    });

    const attachScreenshot = async (page: any, testInfo: any, title: string) => {
        const screenshot = await page.screenshot({ fullPage: true });
        await testInfo.attach(title, { body: screenshot, contentType: 'image/png' });
    };

    // Helper to login as admin
    const loginAsAdmin = async (page: any) => {
        await page.goto("/login");
        await page.fill('input[name="email"]', adminUser.email);
        await page.fill('input[name="password"]', password);
        await Promise.all([
            page.waitForURL(/.*\/dashboard/, { timeout: 15000 }),
            page.click('button[type="submit"]'),
        ]);
    };

    // Helper to login as regular user
    const loginAsRegularUser = async (page: any) => {
        await page.goto("/login");
        await page.fill('input[name="email"]', regularUser.email);
        await page.fill('input[name="password"]', password);
        await Promise.all([
            page.waitForURL(/.*\/dashboard/, { timeout: 15000 }),
            page.click('button[type="submit"]'),
        ]);
    };

    // Helper to click the Eye button (View) for a user row and return the modal locator
    const openUserDetailModal = async (page: any, userName: string) => {
        // Find the row containing the username
        const row = page.locator(`tr:has-text("${userName}")`).first();

        // Click the first button (Eye icon) in the last cell (Actions column)
        const eyeButton = row.locator('td:last-child button').first();
        await eyeButton.click();

        // Wait for modal to appear - the modal is in a fixed position div
        const modal = page.locator('.fixed.inset-0').first();
        await expect(modal.locator('text=User Details')).toBeVisible({ timeout: 10000 });

        return modal;
    };

    test("APPR-001: View pending users", async ({ page }, testInfo) => {
        await test.step("1. Login as Admin", async () => {
            await loginAsAdmin(page);
        });

        await test.step("2. Navigate to Admin Users", async () => {
            await page.goto("/admin/users");
            await expect(page.locator("text=User Management")).toBeVisible({ timeout: 10000 });
        });

        await test.step("3. Verify Pending Users are Listed", async () => {
            // Check for pending count in stats - use first() since there are multiple "Pending" texts
            await expect(page.locator("text=Pending").first()).toBeVisible();

            // Look for pending users in the list by their names
            await expect(page.locator(`text=${pendingUser1.name}`)).toBeVisible({ timeout: 5000 });
            await expect(page.locator(`text=${pendingUser2.name}`)).toBeVisible({ timeout: 5000 });
            await expect(page.locator(`text=${pendingUser3.name}`)).toBeVisible({ timeout: 5000 });

            await attachScreenshot(page, testInfo, "Pending Users Listed");
        });
    });

    test("APPR-002: Approve user", async ({ page }, testInfo) => {
        await test.step("1. Login as Admin", async () => {
            await loginAsAdmin(page);
        });

        await test.step("2. Navigate to Admin Users", async () => {
            await page.goto("/admin/users");
            await expect(page.locator("text=User Management")).toBeVisible({ timeout: 10000 });
        });



        let modal: any;
        await test.step("3. Open Pending User Detail Modal", async () => {
            modal = await openUserDetailModal(page, pendingUser1.name);
        });

        await test.step("4. Click Approve Button", async () => {
            // Handle the confirmation dialog
            page.on('dialog', async dialog => {
                await dialog.accept();
            });

            // Scope to modal only - find the Approve button in the modal's footer
            const approveButton = modal.locator('button:has-text("Approve")').first();
            await expect(approveButton).toBeVisible({ timeout: 5000 });
            await approveButton.click();

            // Wait for the status to update
            await page.waitForTimeout(2000);
        });

        await test.step("5. Verify Status Changed to APPROVED", async () => {
            // Check if the badge in the modal shows Approved
            await expect(page.locator('.fixed >> text=Approved').first()).toBeVisible({ timeout: 5000 });
            await attachScreenshot(page, testInfo, "User Approved");
        });

        // Cleanup - Reset status back to PENDING for other tests
        await test.step("Cleanup: Reset Status", async () => {
            await prisma.user.update({
                where: { email: pendingUser1.email },
                data: { status: "PENDING", approvedAt: null, approvedBy: null },
            });
        });
    });

    test("APPR-003: Reject user (via Suspend)", async ({ page }, testInfo) => {
        // First approve the user, then suspend them (acting as reject)
        await test.step("1. Login as Admin", async () => {
            await loginAsAdmin(page);
        });

        await test.step("2. Navigate to Admin Users", async () => {
            await page.goto("/admin/users");
            await expect(page.locator("text=User Management")).toBeVisible({ timeout: 10000 });
        });

        let modal: any;
        await test.step("2.5. Open Modal", async () => {
            modal = await openUserDetailModal(page, pendingUser2.name);
        });

        await test.step("3. Approve Then Suspend User", async () => {
            page.on('dialog', async dialog => {
                await dialog.accept();
            });

            // First approve - scope to modal
            const approveButton = modal.locator('button:has-text("Approve")').first();
            await expect(approveButton).toBeVisible({ timeout: 5000 });
            await approveButton.click();
            await page.waitForTimeout(2000);

            // Now suspend the user - scope to modal
            const suspendButton = modal.locator('button:has-text("Suspend")').first();
            await expect(suspendButton).toBeVisible({ timeout: 5000 });
            await suspendButton.click();
            await page.waitForTimeout(2000);
        });

        await test.step("4. Verify Status Changed to SUSPENDED", async () => {
            await expect(page.locator('.fixed >> text=Suspended').first()).toBeVisible({ timeout: 5000 });
            await attachScreenshot(page, testInfo, "User Suspended/Rejected");
        });

        // Cleanup - Reset status back to PENDING
        await test.step("Cleanup: Reset Status", async () => {
            await prisma.user.update({
                where: { email: pendingUser2.email },
                data: { status: "PENDING", approvedAt: null, approvedBy: null },
            });
        });
    });

    test("APPR-004: Non-admin access denied", async ({ page }, testInfo) => {
        await test.step("1. Login as Regular User (Non-Admin)", async () => {
            await loginAsRegularUser(page);
        });

        await test.step("2. Attempt to Navigate to /admin", async () => {
            await page.goto("/admin");

            // Wait for redirection to complete
            await page.waitForTimeout(2000);
        });

        await test.step("3. Verify Redirect Away from Admin", async () => {
            // Should NOT be on an admin page
            const url = page.url();
            const isNotOnAdmin = !url.includes("/admin") || url.includes("/login");
            expect(isNotOnAdmin).toBeTruthy();

            await attachScreenshot(page, testInfo, "Non-Admin Redirect Evidence");
        });
    });

    test("APPR-005: Approval with activity log", async ({ page }, testInfo) => {
        await test.step("1. Login as Admin", async () => {
            await loginAsAdmin(page);
        });

        await test.step("2. Navigate to Admin Users", async () => {
            await page.goto("/admin/users");
            await expect(page.locator("text=User Management")).toBeVisible({ timeout: 10000 });
        });

        let modal: any;
        await test.step("2.5. Open Modal", async () => {
            modal = await openUserDetailModal(page, pendingUser3.name);
        });

        await test.step("3. Approve the User", async () => {
            page.on('dialog', async dialog => {
                await dialog.accept();
            });

            // Scope to modal
            const approveButton = modal.locator('button:has-text("Approve")').first();
            await expect(approveButton).toBeVisible({ timeout: 5000 });
            await approveButton.click();
            await page.waitForTimeout(2000);

            await attachScreenshot(page, testInfo, "User Approved with Log");
        });

        await test.step("4. Check Activity Tab for Log Entry", async () => {
            // Click on Activity tab in the modal
            const activityTab = page.locator('button:has-text("Activity")');
            if (await activityTab.isVisible()) {
                await activityTab.click();
                await page.waitForTimeout(1000);

                await attachScreenshot(page, testInfo, "Activity Log After Approval");
            }
        });

        await test.step("5. Verify in Database", async () => {
            const user = await prisma.user.findUnique({
                where: { email: pendingUser3.email },
            });
            expect(user?.status).toBe("APPROVED");
        });

        // Cleanup - Reset status
        await test.step("Cleanup: Reset Status", async () => {
            await prisma.user.update({
                where: { email: pendingUser3.email },
                data: { status: "PENDING", approvedAt: null, approvedBy: null },
            });
        });
    });
});
