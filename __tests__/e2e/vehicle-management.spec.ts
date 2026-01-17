import { test, expect, Page } from "@playwright/test";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

test.describe("Phase 4: Registered User Features - Vehicle Management Tests", () => {
    let testUser: any;
    let neighborUser: any;
    let buildingA: any;
    let flatA101: any;
    let flatA102: any;

    const VEH_N1 = "MH01AB1234"; // Neighbor's
    const VEH_T1 = "MH02CD5678"; // Test User's
    const VEH_T2 = "KA03EF9012"; // Created in Add test
    const VEH_T_DEL = "DL04GH3456"; // To be deleted

    test.beforeAll(async () => {
        // Cleanup
        await prisma.vehicle.deleteMany({
            where: {
                vehicleNumber: {
                    in: [VEH_N1, VEH_T1, VEH_T2, VEH_T_DEL, "MH02CD5678-EDITED", "NONEXISTENT", "GJ05IJ7890"],
                },
            },
        });
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: ["vehicle-test-user@example.com", "vehicle-neighbor@example.com"],
                },
            },
        });

        // Setup
        buildingA = await prisma.building.upsert({
            where: { buildingCode: "V" },
            update: {},
            create: { name: "Vehicle Building", buildingCode: "V" },
        });

        flatA101 = await prisma.flat.upsert({
            where: { buildingId_flatNumber: { buildingId: buildingA.id, flatNumber: "101" } },
            update: {},
            create: { buildingId: buildingA.id, flatNumber: "101" },
        });

        flatA102 = await prisma.flat.upsert({
            where: { buildingId_flatNumber: { buildingId: buildingA.id, flatNumber: "102" } },
            update: {},
            create: { buildingId: buildingA.id, flatNumber: "102" },
        });

        const hashedPassword = await bcrypt.hash("Password123!", 10);

        testUser = await prisma.user.create({
            data: {
                email: "vehicle-test-user@example.com",
                name: "Vehicle Owner",
                passwordHash: hashedPassword,
                role: "OWNER",
                status: "APPROVED",
                userType: "OWNER",
                buildingId: buildingA.id,
                flatId: flatA101.id,
                phoneNumber: "1234567890",
            },
        });

        neighborUser = await prisma.user.create({
            data: {
                email: "vehicle-neighbor@example.com",
                name: "Neighbor Owner",
                passwordHash: hashedPassword,
                role: "OWNER",
                status: "APPROVED",
                userType: "OWNER",
                buildingId: buildingA.id,
                flatId: flatA102.id,
                phoneNumber: "9876543210",
            },
        });

        // Seed initial vehicles
        await prisma.vehicle.createMany({
            data: [
                {
                    userId: neighborUser.id,
                    vehicleNumber: VEH_N1,
                    vehicleType: "CAR",
                    brand: "Toyota",
                    model: "Fortuner",
                    color: "White",
                },
                {
                    userId: testUser.id,
                    vehicleNumber: VEH_T1,
                    vehicleType: "CAR",
                    brand: "Honda",
                    model: "City",
                    color: "Silver",
                },
                {
                    userId: testUser.id,
                    vehicleNumber: VEH_T_DEL,
                    vehicleType: "BIKE",
                    brand: "Yamaha",
                    model: "R15",
                    color: "Blue",
                }
            ]
        });
    });

    test.afterAll(async () => {
        await prisma.vehicle.deleteMany({
            where: { userId: { in: [testUser.id, neighborUser.id] } },
        });
        await prisma.user.deleteMany({
            where: { id: { in: [testUser.id, neighborUser.id] } },
        });
    });

    async function loginUser(page: Page) {
        await page.goto("/login");
        await page.fill('input[name="email"]', "vehicle-test-user@example.com");
        await page.fill('input[name="password"]', "Password123!");
        await page.click('button[type="submit"]');
        await page.waitForURL("/dashboard");
    }

    test("VEH-001: Search vehicle - Owner details shown", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/vehicles/search");

        await page.fill('input[placeholder*="Enter vehicle number"]', VEH_N1);
        await page.click('button:has-text("Search")');

        await expect(page.getByText("Neighbor Owner")).toBeVisible({ timeout: 10000 });
        await expect(page.getByText("Vehicle Building - Flat 102")).toBeVisible();
        await expect(page.getByRole("heading", { name: VEH_N1 })).toBeVisible();
        await expect(page.getByText("9876543210")).toBeVisible();
    });

    test("VEH-002: Vehicle not found - Not found message", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/vehicles/search");

        await page.fill('input[placeholder*="Enter vehicle number"]', "NONEXISTENT");
        await page.click('button:has-text("Search")');

        await expect(page.getByText("No vehicles found")).toBeVisible();
        await expect(page.getByText('No vehicles matching "NONEXISTENT"')).toBeVisible();
    });

    test("VEH-003: View my vehicles - Vehicles listed", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/vehicles");

        await expect(page.getByRole("heading", { name: VEH_T1 })).toBeVisible();
        await expect(page.getByText("Honda City")).toBeVisible();
    });

    test("VEH-004: Add vehicle - Vehicle created", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/vehicles");

        await page.click('button:has-text("Add Vehicle")');

        const modal = page.getByRole("dialog");
        await modal.locator('input[id="vehicleNumber"]').fill(VEH_T2);
        await modal.locator('input[id="brand"]').fill("Suzuki");
        await modal.locator('input[id="model"]').fill("Swift");
        await modal.locator('input[id="color"]').fill("Red");
        await modal.locator('input[id="parkingSlot"]').fill("P-45");

        await modal.getByRole("button", { name: "Add Vehicle" }).click();

        // Wait for modal to close
        await expect(modal).not.toBeVisible({ timeout: 15000 });

        await expect(page.getByRole("heading", { name: VEH_T2 })).toBeVisible();
        await expect(page.getByText("Suzuki Swift")).toBeVisible();
    });

    test("VEH-005: Duplicate vehicle - Error message", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/vehicles");

        await page.click('button:has-text("Add Vehicle")');
        const modal = page.getByRole("dialog");
        await modal.locator('input[id="vehicleNumber"]').fill(VEH_N1); // Already exists
        await modal.getByRole("button", { name: "Add Vehicle" }).click();

        await expect(page.getByText("already registered")).toBeVisible();
        // Close modal for next test
        await page.click('button:has-text("Cancel")');
    });

    test("VEH-006: Edit vehicle - Vehicle updated", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/vehicles");

        const card = page.locator(".group").filter({ has: page.getByRole("heading", { name: VEH_T1 }) });
        await card.locator('button:has-text("Edit")').click();

        const modal = page.getByRole("dialog");
        // Verify initial value is loaded
        await expect(modal.locator('input[id="vehicleNumber"]')).toHaveValue(VEH_T1);

        await modal.locator('input[id="color"]').fill("Blue_Edit");
        const updateBtn = modal.getByRole("button", { name: "Update Vehicle" });
        await updateBtn.click();

        // Check for server-side error message if modal stays open
        const errorLocator = modal.locator('.text-red-400');
        await expect(errorLocator).not.toBeVisible();
        await expect(modal).not.toBeVisible({ timeout: 15000 });

        // Wait for updated text to appear in the card
        await expect(page.locator(".group").filter({ hasText: VEH_T1 }).getByText("Blue_Edit")).toBeVisible();
    });

    test("VEH-007: Delete vehicle - Vehicle removed", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/vehicles");

        const card = page.locator(".group").filter({ has: page.getByRole("heading", { name: VEH_T_DEL }) });

        page.on('dialog', dialog => dialog.accept());
        await card.locator('button:has-text("Delete")').click();

        await expect(page.getByRole("heading", { name: VEH_T_DEL })).not.toBeVisible({ timeout: 15000 });
    });

    test("VEH-008: Invalid vehicle number - Validation error", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/vehicles");

        await page.click('button:has-text("Add Vehicle")');
        const modal = page.getByRole("dialog");
        // Submit empty
        await modal.getByRole("button", { name: "Add Vehicle" }).click();

        await expect(page.getByText("Vehicle number is required")).toBeVisible();
    });
});
