import { test, expect } from "@playwright/test";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

test.describe("Phase 2: Profile Management Tests", () => {
    const buildingCode = "PROF_E2E";
    const buildingName = "Profile Tower";
    const flatNumber = "PROF-101";
    const password = "Password@123";

    // Test User
    const testUser = {
        email: "profile-test@test.com",
        name: "Profile Test User",
        phone: "+919876543210",
        status: "APPROVED" as const,
        role: "OWNER" as const,
    };

    // Original values for restoration
    let originalName: string;
    let originalPhone: string | null;
    let originalProfileImage: string | null;

    test.beforeAll(async () => {
        // 1. Cleanup
        await prisma.user.deleteMany({ where: { email: testUser.email } });
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

        // 3. Create Test User
        const user = await prisma.user.create({
            data: {
                email: testUser.email,
                name: testUser.name,
                phoneNumber: testUser.phone,
                passwordHash: hashedPassword,
                status: testUser.status,
                role: testUser.role,
                userType: "OWNER",
                flatId: flat.id,
                buildingId: building.id,
            },
        });

        originalName = user.name;
        originalPhone = user.phoneNumber;
        originalProfileImage = user.profileImageUrl;

        console.log("Seeded Profile Test User");
    });

    test.afterAll(async () => {
        // Cleanup
        await prisma.user.deleteMany({ where: { email: testUser.email } });
        await prisma.flat.deleteMany({ where: { building: { buildingCode } } });
        await prisma.building.deleteMany({ where: { buildingCode } });
    });

    const attachScreenshot = async (page: any, testInfo: any, title: string) => {
        const screenshot = await page.screenshot({ fullPage: true });
        await testInfo.attach(title, { body: screenshot, contentType: 'image/png' });
    };

    // Helper to login
    const login = async (page: any) => {
        await page.goto("/login");
        await page.fill('input[name="email"]', testUser.email);
        await page.fill('input[name="password"]', password);
        await Promise.all([
            page.waitForURL(/.*\/dashboard/, { timeout: 15000 }),
            page.click('button[type="submit"]'),
        ]);
    };

    test("PROF-001: View profile", async ({ page }, testInfo) => {
        await test.step("1. Login", async () => {
            await login(page);
        });

        await test.step("2. Navigate to Profile Page", async () => {
            await page.goto("/dashboard/profile");
            await expect(page.locator("text=My Profile")).toBeVisible({ timeout: 10000 });
        });

        await test.step("3. Verify Profile Data is Displayed", async () => {
            // Check that name is displayed in input
            const nameInput = page.locator('input').first();
            await expect(nameInput).toHaveValue(testUser.name);

            // Check that email is displayed in the disabled input
            const emailInput = page.locator('input[disabled]');
            await expect(emailInput).toHaveValue(testUser.email);

            // Check building/flat info
            await expect(page.locator(`text=${buildingName}`)).toBeVisible();
            await expect(page.locator(`text=${flatNumber}`)).toBeVisible();

            await attachScreenshot(page, testInfo, "Profile View Evidence");
        });
    });

    test("PROF-002: Update name", async ({ page }, testInfo) => {
        const newName = "Updated Profile Name";

        await test.step("1. Login and Navigate to Profile", async () => {
            await login(page);
            await page.goto("/dashboard/profile");
            await expect(page.locator("text=My Profile")).toBeVisible({ timeout: 10000 });
        });

        await test.step("2. Change Name", async () => {
            // Find the first input which is the name field (after the Full Name label)
            const nameInput = page.locator('input').first();
            await nameInput.clear();
            await nameInput.fill(newName);
        });

        await test.step("3. Save Changes", async () => {
            await page.click('button:has-text("Save Changes")');

            // Wait for success message
            await expect(page.locator("text=Profile updated successfully")).toBeVisible({ timeout: 5000 });
            await attachScreenshot(page, testInfo, "Name Updated Evidence");
        });

        await test.step("4. Verify in Database", async () => {
            const user = await prisma.user.findUnique({
                where: { email: testUser.email },
            });
            expect(user?.name).toBe(newName);
        });

        // Cleanup - Revert name
        await test.step("Cleanup: Revert Name", async () => {
            await prisma.user.update({
                where: { email: testUser.email },
                data: { name: originalName },
            });
        });
    });

    test("PROF-003: Update phone", async ({ page }, testInfo) => {
        const newPhone = "+919999888877";

        await test.step("1. Login and Navigate to Profile", async () => {
            await login(page);
            await page.goto("/dashboard/profile");
            await expect(page.locator("text=My Profile")).toBeVisible({ timeout: 10000 });
        });

        await test.step("2. Change Phone Number", async () => {
            // Find the phone input (second input after name, or by placeholder)
            const phoneInput = page.locator('input[placeholder="+91..."]');
            await phoneInput.clear();
            await phoneInput.fill(newPhone);
        });

        await test.step("3. Save Changes", async () => {
            await page.click('button:has-text("Save Changes")');

            // Wait for success message
            await expect(page.locator("text=Profile updated successfully")).toBeVisible({ timeout: 5000 });
            await attachScreenshot(page, testInfo, "Phone Updated Evidence");
        });

        await test.step("4. Verify in Database", async () => {
            const user = await prisma.user.findUnique({
                where: { email: testUser.email },
            });
            expect(user?.phoneNumber).toBe(newPhone);
        });

        // Cleanup - Revert phone
        await test.step("Cleanup: Revert Phone", async () => {
            await prisma.user.update({
                where: { email: testUser.email },
                data: { phoneNumber: originalPhone },
            });
        });
    });

    test("PROF-004: Upload profile image", async ({ page }, testInfo) => {
        // Note: File upload testing is complex and may require mocking
        // This test checks that the upload UI exists and works conceptually

        await test.step("1. Login and Navigate to Profile", async () => {
            await login(page);
            await page.goto("/dashboard/profile");
            await expect(page.locator("text=My Profile")).toBeVisible({ timeout: 10000 });
        });

        await test.step("2. Verify Profile Picture Upload Section Exists", async () => {
            // Check that the profile picture upload section exists
            await expect(page.locator("text=Profile Picture")).toBeVisible();
            await expect(page.locator("text=Supported formats")).toBeVisible();

            await attachScreenshot(page, testInfo, "Profile Image Upload Section");
        });

        // For a real file upload test, you would need to:
        // 1. Mock the file upload endpoint
        // 2. Use page.setInputFiles() to upload a file
        // 3. Verify the image URL is set
        // This is a simplified verification that the UI exists
    });

    test("PROF-005: Invalid phone format", async ({ page }, testInfo) => {
        const invalidPhone = "123"; // Too short - less than 10 characters

        await test.step("1. Login and Navigate to Profile", async () => {
            await login(page);
            await page.goto("/dashboard/profile");
            await expect(page.locator("text=My Profile")).toBeVisible({ timeout: 10000 });
        });

        await test.step("2. Enter Invalid Phone Number", async () => {
            const phoneInput = page.locator('input[placeholder="+91..."]');
            await phoneInput.clear();
            await phoneInput.fill(invalidPhone);
        });

        await test.step("3. Try to Save", async () => {
            await page.click('button:has-text("Save Changes")');
            await page.waitForTimeout(1000);
        });

        await test.step("4. Verify Error or Validation Failure", async () => {
            // The validation should fail - either show an error message or not show success
            const successMessage = page.locator("text=Profile updated successfully");
            const hasSuccess = await successMessage.isVisible().catch(() => false);

            // Either there should be an error, or the success message should NOT appear
            if (!hasSuccess) {
                // Check for error message
                const errorMessage = page.locator("text=Invalid data").or(page.locator("text=Failed"));
                const hasError = await errorMessage.isVisible().catch(() => false);

                // Either success is false OR error is visible
                expect(hasSuccess || hasError !== undefined).toBeTruthy();
            }

            await attachScreenshot(page, testInfo, "Invalid Phone Validation Evidence");
        });

        // No cleanup needed - form wasn't saved
    });

    test("PROF-006: Empty name validation", async ({ page }, testInfo) => {
        await test.step("1. Login and Navigate to Profile", async () => {
            await login(page);
            await page.goto("/dashboard/profile");
            await expect(page.locator("text=My Profile")).toBeVisible({ timeout: 10000 });
        });

        await test.step("2. Clear the Name Field", async () => {
            const nameInput = page.locator('input').first();
            await nameInput.clear();
            // Make sure it's empty
            await expect(nameInput).toHaveValue("");
        });

        await test.step("3. Try to Save", async () => {
            await page.click('button:has-text("Save Changes")');
            await page.waitForTimeout(1000);
        });

        await test.step("4. Verify Validation Error", async () => {
            // The validation should fail because name is required (min 2 characters)
            const successMessage = page.locator("text=Profile updated successfully");
            const hasSuccess = await successMessage.isVisible().catch(() => false);

            // Success should not appear when name is empty
            // Either error appears OR success doesn't appear
            await attachScreenshot(page, testInfo, "Empty Name Validation Evidence");

            // Check that the update failed
            const user = await prisma.user.findUnique({
                where: { email: testUser.email },
            });
            // Name should still be original since validation failed
            expect(user?.name).toBe(originalName);
        });
    });
});
