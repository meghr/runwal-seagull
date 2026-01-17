import { test, expect } from "@playwright/test";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

test.describe("Phase 2: Login Tests", () => {
    const buildingCode = "LOGIN_E2E";
    const buildingName = "Login Tower";
    const flatNumber = "1101";
    const password = "Password@123";
    const flowEmail = "flow-login@test.com";

    // Test Users
    const userApproved = {
        email: "login-approved@test.com",
        name: "Approved User",
        status: "APPROVED" as const,
    };
    const userPending = {
        email: "login-pending@test.com",
        name: "Pending User",
        status: "PENDING" as const,
    };
    const userSuspended = {
        email: "login-suspended@test.com",
        name: "Suspended User",
        status: "SUSPENDED" as const,
    };

    test.beforeAll(async () => {
        // 1. Cleanup
        const emails = [userApproved.email, userPending.email, userSuspended.email, flowEmail];
        await prisma.user.deleteMany({ where: { email: { in: emails } } });
        await prisma.flat.deleteMany({ where: { building: { buildingCode } } });
        await prisma.building.deleteMany({ where: { buildingCode } });

        // 2. Create Building & Flat
        const building = await prisma.building.create({
            data: {
                name: buildingName,
                buildingCode,
                totalFloors: 5,
                isActiveForRegistration: true,
                flats: {
                    create: { flatNumber, floorNumber: 1, bhkType: "2BHK" },
                },
            },
            include: { flats: true },
        });

        const flat = building.flats[0];
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create Users
        await prisma.user.create({
            data: {
                email: userApproved.email,
                name: userApproved.name,
                passwordHash: hashedPassword,
                status: userApproved.status,
                role: "OWNER",
                userType: "OWNER",
                flatId: flat.id,
                buildingId: building.id,
            },
        });

        await prisma.user.create({
            data: {
                email: userPending.email,
                name: userPending.name,
                passwordHash: hashedPassword,
                status: userPending.status,
                role: "OWNER",
                userType: "OWNER",
                flatId: flat.id,
                buildingId: building.id,
            },
        });

        await prisma.user.create({
            data: {
                email: userSuspended.email,
                name: userSuspended.name,
                passwordHash: hashedPassword,
                status: userSuspended.status,
                role: "OWNER",
                userType: "OWNER",
                flatId: flat.id,
                buildingId: building.id,
            },
        });
        console.log("Seeded Login Users");
    });

    test.afterAll(async () => {
        const emails = [userApproved.email, userPending.email, userSuspended.email, flowEmail];
        await prisma.user.deleteMany({ where: { email: { in: emails } } });
        await prisma.flat.deleteMany({ where: { building: { buildingCode } } });
        await prisma.building.deleteMany({ where: { buildingCode } });
    });

    const attachScreenshot = async (page: any, testInfo: any, title: string) => {
        const screenshot = await page.screenshot({ fullPage: true });
        await testInfo.attach(title, { body: screenshot, contentType: 'image/png' });
    };

    test("LOGIN-001: Valid credentials (Approved)", async ({ page }, testInfo) => {
        await test.step("1. Register User via UI", async () => {
            await page.goto("/register");
            await page.fill('input[name="name"]', "Login Flow User");
            await page.fill('input[name="email"]', flowEmail);
            await page.fill('input[name="phoneNumber"]', "9876543210");
            await page.fill('input[name="password"]', password);
            await page.fill('input[name="confirmPassword"]', password);
            await page.click("button:has-text('Owner')");
            await page.locator('select[name="buildingId"]').selectOption({ label: buildingCode });
            await page.locator('input[name="flatNumber"]').fill(flatNumber);

            await page.click('button[type="submit"]');
            await expect(page.locator("text=Registration successful")).toBeVisible();
        });

        await test.step("2. Admin Approves User (DB)", async () => {
            await prisma.user.update({
                where: { email: flowEmail },
                data: { status: "APPROVED" }
            });
        });

        await test.step("3. Login with New User", async () => {
            await page.goto("/login");
            await page.fill('input[name="email"]', flowEmail);
            await page.fill('input[name="password"]', password);
            await Promise.all([
                page.waitForURL(/.*\/(dashboard|login)/, { timeout: 15000 }),
                page.click('button[type="submit"]'),
            ]);
        });

        await test.step("4. Verify Redirect to Dashboard", async () => {
            // Validate dashboard URL and presence
            await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
            await expect(page.getByRole('heading', { name: "Dashboard" })).toBeVisible();
            await attachScreenshot(page, testInfo, "Login Success Evidence");
        });
    });

    test("LOGIN-002: Invalid password", async ({ page }, testInfo) => {
        await page.goto("/login");
        await page.fill('input[name="email"]', userApproved.email);
        await page.fill('input[name="password"]', "WrongPass");
        await page.click('button[type="submit"]');

        await expect(page.locator("text=Invalid credentials")).toBeVisible();
        await attachScreenshot(page, testInfo, "Invalid Password Evidence");
    });

    test("LOGIN-003: Non-existent user", async ({ page }, testInfo) => {
        await page.goto("/login");
        await page.fill('input[name="email"]', "ghost@test.com");
        await page.fill('input[name="password"]', "AnyPass");
        await page.click('button[type="submit"]');

        await expect(page.locator("text=Invalid credentials")).toBeVisible();
        await attachScreenshot(page, testInfo, "Non-existent User Evidence");
    });

    test("LOGIN-004: Pending user login", async ({ page }, testInfo) => {
        await page.goto("/login");
        await page.fill('input[name="email"]', userPending.email);
        await page.fill('input[name="password"]', password);
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Account pending approval')).toBeVisible();
        await attachScreenshot(page, testInfo, "Pending Login Evidence");
    });

    test("LOGIN-005: Suspended user login", async ({ page }, testInfo) => {
        await page.goto("/login");
        await page.fill('input[name="email"]', userSuspended.email);
        await page.fill('input[name="password"]', password);
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Account suspended')).toBeVisible();
        await attachScreenshot(page, testInfo, "Suspended Login Evidence");
    });

    test("LOGIN-006: Session persistence", async ({ page }, testInfo) => {
        // Use Flow Email or Approved Email? 
        // Approved Email failed. Use Flow Email?
        // Session Persistence Test depends on successful login.
        // So I'll use flowEmail but I need to ensure LOGIN-001 ran successfully.
        // OR I repeat the login logic here. 
        // I'll repeat login using flowEmail (since it's approved now).

        await page.goto("/login");
        await page.fill('input[name="email"]', flowEmail);
        await page.fill('input[name="password"]', password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/.*\/dashboard/);

        await page.reload();
        await expect(page).toHaveURL(/.*\/dashboard/);
        await attachScreenshot(page, testInfo, "Session Persistence Evidence");
    });

    test("LOGIN-007: Logout", async ({ page }, testInfo) => {
        await page.goto("/login");
        // Use userApproved which is seeded in beforeAll (not flowEmail which depends on LOGIN-001)
        await page.fill('input[name="email"]', userApproved.email);
        await page.fill('input[name="password"]', password);

        // Wait for login to complete and redirect to dashboard
        await Promise.all([
            page.waitForURL(/.*\/dashboard/, { timeout: 15000 }),
            page.click('button[type="submit"]'),
        ]);

        await test.step("Perform Logout", async () => {
            // The Sign Out button is directly visible in the header
            const signOutButton = page.locator('button:has-text("Sign Out"), a:has-text("Sign Out")');

            await expect(signOutButton).toBeVisible({ timeout: 5000 });

            // Click and wait for redirect to login page
            await Promise.all([
                page.waitForURL(/.*\/login/, { timeout: 15000 }),
                signOutButton.click(),
            ]);
        });

        await expect(page).toHaveURL(/.*\/login/);
        await attachScreenshot(page, testInfo, "Logout Evidence");
    });
});
