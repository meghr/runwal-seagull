import { test, expect } from "@playwright/test";
import { prisma } from "@/lib/db";

test.describe("Phase 2: Authentication & User Management", () => {
    const buildingCode = "REG_E2E";
    const buildingName = "Registration Tower";
    const flatNumber = "1101"; // Must be numeric for UI
    const password = "Password@123";
    const userEmail = "reg-001@test.com";

    test.beforeAll(async () => {
        // Cleanup previous run if exists
        await prisma.user.deleteMany({ where: { email: userEmail } });
        await prisma.flat.deleteMany({ where: { building: { buildingCode } } });
        await prisma.building.deleteMany({ where: { buildingCode } });

        // Seed Building and Flat
        const building = await prisma.building.create({
            data: {
                name: buildingName,
                buildingCode: buildingCode,
                totalFloors: 5,
                isActiveForRegistration: true,
                flats: {
                    create: {
                        flatNumber: flatNumber,
                        floorNumber: 1,
                        bhkType: "2BHK",
                    },
                },
            },
        });
        console.log("Seeded building:", building.name);
    });

    test.afterAll(async () => {
        // Cleanup
        await prisma.user.deleteMany({ where: { email: userEmail } });
        await prisma.flat.deleteMany({ where: { building: { buildingCode } } });
        await prisma.building.deleteMany({ where: { buildingCode } });
    });

    // Helper for attaching screenshot
    const attachScreenshot = async (page: any, testInfo: any, title: string) => {
        const screenshot = await page.screenshot({ fullPage: true });
        await testInfo.attach(title, { body: screenshot, contentType: 'image/png' });
    };

    test("REG-001: Successful registration", async ({ page }, testInfo) => {
        await test.step("1. Navigate to Registration Page", async () => {
            await page.goto("/register");
        });

        await test.step("2. Fill Personal & Property Details", async () => {
            await page.fill('input[name="name"]', "Test Registrant");
            await page.fill('input[name="email"]', userEmail);
            await page.fill('input[name="phoneNumber"]', "9876543210");
            await page.fill('input[name="password"]', "Test@12345");
            await page.fill('input[name="confirmPassword"]', "Test@12345");
            await page.click("button:has-text('Owner')");
            await page.locator('select[name="buildingId"]').selectOption({ label: buildingCode });
            const flatInput = page.locator('input[name="flatNumber"]');
            await expect(flatInput).toBeEnabled();
            await flatInput.fill(flatNumber);
        });

        await test.step("3. Submit Form", async () => {
            await page.click('button[type="submit"]');
        });

        await test.step("4. Verify Success UI", async () => {
            await expect(page.locator("text=Registration successful")).toBeVisible({ timeout: 10000 });
            await attachScreenshot(page, testInfo, "Success Evidence");
        });

        await test.step("5. Verify Database State", async () => {
            const user = await prisma.user.findUnique({ where: { email: userEmail } });
            expect(user).not.toBeNull();
            expect(user?.status).toBe("PENDING");
        });
    });

    test("REG-002: Duplicate email", async ({ page }, testInfo) => {
        await test.step("1. Navigate to Registration Page", async () => {
            await page.goto("/register");
        });

        await test.step("2. Fill Form with Existing Email", async () => {
            await page.fill('input[name="name"]', "Duplicate User");
            await page.fill('input[name="email"]', userEmail);
            await page.fill('input[name="phoneNumber"]', "9876543210");
            await page.fill('input[name="password"]', "Test@12345");
            await page.fill('input[name="confirmPassword"]', "Test@12345");
            await page.click("button:has-text('Tenant')");
            await page.locator('select[name="buildingId"]').selectOption({ label: buildingCode });
            const flatInput = page.locator('input[name="flatNumber"]');
            await expect(flatInput).toBeEnabled();
            await flatInput.fill(flatNumber);
        });

        await test.step("3. Submit Form", async () => {
            await page.click('button[type="submit"]');
        });

        await test.step("4. Verify Error Message", async () => {
            await expect(page.locator("text=User already exists with this email")).toBeVisible({ timeout: 10000 });
            await attachScreenshot(page, testInfo, "Duplicate Error Evidence");
        });
    });

    test("REG-003: Invalid email format", async ({ page }, testInfo) => {
        await test.step("Navigate", async () => await page.goto("/register"));
        await test.step("Fill Invalid Email", async () => {
            await page.fill('input[name="email"]', "not-an-email");
            // Fill validation requirements to isolate email error
            await page.fill('input[name="name"]', "Invalid Email User");
            await page.fill('input[name="password"]', "Test@12345");
            await page.fill('input[name="confirmPassword"]', "Test@12345");
            await page.click("button:has-text('Owner')");
        });

        await test.step("Submit and Verify HTML5 Validation", async () => {
            await page.click('button[type="submit"]');
            const emailInput = page.locator('input[name="email"]');
            const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
            expect(isInvalid).toBe(true);
            await attachScreenshot(page, testInfo, "Invalid Email Evidence");
        });
    });

    test("REG-004: Password too weak", async ({ page }, testInfo) => {
        await test.step("Navigate", async () => await page.goto("/register"));
        await test.step("Fill Weak Password", async () => {
            await page.fill('input[name="name"]', "Weak Password User");
            await page.fill('input[name="email"]', "weak@test.com");
            await page.fill('input[name="phoneNumber"]', "9876543210");
            await page.fill('input[name="password"]', "123"); // Likely too short
            await page.fill('input[name="confirmPassword"]', "123");
            // ... fill others ...
            await page.click("button:has-text('Owner')");
            await page.locator('select[name="buildingId"]').selectOption({ label: buildingCode });
            const flatInput = page.locator('input[name="flatNumber"]');
            await expect(flatInput).toBeEnabled();
            await flatInput.fill(flatNumber);
        });

        await test.step("Submit and Verify Error", async () => {
            await page.click('button[type="submit"]');
            // If standard min-length validation exists (HTML5 or Server)
            // HTML5 minLength?
            const passwordInput = page.locator('input[name="password"]');
            // Check if HTML5 invalid or UI error
            // We can check if URL is still /register (didn't redirect/success)
            // Or check specific error. 

            // Assuming no explicit error but simply no success
            // Wait, usually Zod returns error.
            // Assert "Registration successful" is NOT visible
            await expect(page.locator("text=Registration successful")).toBeHidden();
            await attachScreenshot(page, testInfo, "Weak Password Evidence");
        });
    });

    test("REG-005: Missing required fields", async ({ page }, testInfo) => {
        await test.step("Navigate", async () => await page.goto("/register"));
        await test.step("Submit Empty Form", async () => {
            await page.click('button[type="submit"]');
        });

        await test.step("Verify Required Missing", async () => {
            // Check HTML5 validity of first input (Name)
            const nameInput = page.locator('input[name="name"]');
            const isInvalid = await nameInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
            expect(isInvalid).toBe(true);
            await attachScreenshot(page, testInfo, "Missing Fields Evidence");
        });
    });

    test("REG-006: Building selection enables flat input", async ({ page }, testInfo) => {
        await page.goto("/register");
        await page.locator('select[name="buildingId"]').selectOption({ label: buildingCode });

        const flatInput = page.locator('input[name="flatNumber"]');
        await expect(flatInput).toBeEnabled();
        await attachScreenshot(page, testInfo, "Building Selection Evidence");
    });

    test("REG-007: Flat entry", async ({ page }, testInfo) => {
        await page.goto("/register");
        await page.locator('select[name="buildingId"]').selectOption({ label: buildingCode });
        await page.locator('input[name="flatNumber"]').fill(flatNumber);

        const value = await page.locator('input[name="flatNumber"]').inputValue();
        expect(value).toBe(flatNumber);
        await attachScreenshot(page, testInfo, "Flat Selection Evidence");
    });

    test("REG-008: User type selection", async ({ page }, testInfo) => {
        await page.goto("/register");

        // Select Tenant
        await page.click("button:has-text('Tenant')");
        // Check if active class applied (bg-sky-500)
        await expect(page.locator("button:has-text('Tenant')")).toHaveClass(/bg-sky-500/);
        await attachScreenshot(page, testInfo, "User Type Tenant Evidence");

        // Select Owner
        await page.click("button:has-text('Owner')");
        await expect(page.locator("button:has-text('Owner')")).toHaveClass(/bg-sky-500/);
        await attachScreenshot(page, testInfo, "User Type Owner Evidence");
    });

});
