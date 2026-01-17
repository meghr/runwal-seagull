import { test, expect } from "@playwright/test";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

test.describe("Phase 4: Registered User Features - Neighbor Directory Tests", () => {
    let testUser: any;
    let neighborUser: any;
    let hiddenUser: any;
    let buildingA: any;
    let buildingB: any;
    let flatA101: any;
    let flatA102: any;
    let flatB201: any;
    let flatB202: any;

    test.beforeAll(async () => {
        // Cleanup existing test data
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: [
                        "testuser@example.com",
                        "neighbor1@example.com",
                        "neighbor-hidden@example.com",
                        "neighbor-tenant@example.com",
                    ],
                },
            },
        });

        // Ensure buildings exist
        buildingA = await prisma.building.upsert({
            where: { buildingCode: "A" },
            update: {},
            create: {
                name: "Building A",
                buildingCode: "A",
            },
        });

        buildingB = await prisma.building.upsert({
            where: { buildingCode: "B" },
            update: {},
            create: {
                name: "Building B",
                buildingCode: "B",
            },
        });

        // Ensure flats exist
        flatA101 = await prisma.flat.upsert({
            where: { buildingId_flatNumber: { buildingId: buildingA.id, flatNumber: "101" } },
            update: {},
            create: {
                buildingId: buildingA.id,
                flatNumber: "101",
                floorNumber: 1,
            },
        });

        flatA102 = await prisma.flat.upsert({
            where: { buildingId_flatNumber: { buildingId: buildingA.id, flatNumber: "102" } },
            update: {},
            create: {
                buildingId: buildingA.id,
                flatNumber: "102",
                floorNumber: 1,
            },
        });

        flatB201 = await prisma.flat.upsert({
            where: { buildingId_flatNumber: { buildingId: buildingB.id, flatNumber: "201" } },
            update: {},
            create: {
                buildingId: buildingB.id,
                flatNumber: "201",
                floorNumber: 2,
            },
        });

        flatB202 = await prisma.flat.upsert({
            where: { buildingId_flatNumber: { buildingId: buildingB.id, flatNumber: "202" } },
            update: {},
            create: {
                buildingId: buildingB.id,
                flatNumber: "202",
                floorNumber: 2,
            },
        });

        const hashedPassword = await bcrypt.hash("Password123!", 10);

        // Create main test user (Logged in user)
        testUser = await prisma.user.create({
            data: {
                email: "testuser@example.com",
                name: "Test User",
                passwordHash: hashedPassword,
                role: "OWNER",
                status: "APPROVED",
                userType: "OWNER",
                buildingId: buildingA.id,
                flatId: flatA101.id,
            },
        });

        // Create a visible neighbor (Owner)
        neighborUser = await prisma.user.create({
            data: {
                email: "neighbor1@example.com",
                name: "Visible Neighbor",
                passwordHash: hashedPassword,
                role: "OWNER",
                status: "APPROVED",
                userType: "OWNER",
                buildingId: buildingB.id,
                flatId: flatB201.id,
                phoneNumber: "9876543210",
                isProfilePublic: true,
            },
        });

        // Create a tenant neighbor
        await prisma.user.create({
            data: {
                email: "neighbor-tenant@example.com",
                name: "Tenant Neighbor",
                passwordHash: hashedPassword,
                role: "TENANT",
                status: "APPROVED",
                userType: "TENANT",
                buildingId: buildingA.id,
                flatId: flatA102.id,
                isProfilePublic: true,
            },
        });

        // Create a HIDDEN neighbor
        hiddenUser = await prisma.user.create({
            data: {
                email: "neighbor-hidden@example.com",
                name: "Hidden Neighbor",
                passwordHash: hashedPassword,
                role: "OWNER",
                status: "APPROVED",
                userType: "OWNER",
                buildingId: buildingB.id,
                flatId: flatB202.id,
                isProfilePublic: false, // HIDDEN
            },
        });
    });

    test.afterAll(async () => {
        // Don't delete everything to avoid breaking other tests, 
        // but can cleanup our specific test users
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: [
                        "testuser@example.com",
                        "neighbor1@example.com",
                        "neighbor-hidden@example.com",
                        "neighbor-tenant@example.com",
                    ],
                },
            },
        });
    });

    async function loginUser(page) {
        await page.goto("/login");
        await page.fill('input[name="email"]', "testuser@example.com");
        await page.fill('input[name="password"]', "Password123!");
        await page.click('button[type="submit"]');
        await page.waitForURL("/dashboard");
    }

    test("NBR-001: View directory - Directory loads", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/neighbors");

        await expect(page.getByText("Neighbor Directory")).toBeVisible();
        // Check if at least one resident count is shown
        await expect(page.locator("text=residents found")).toBeVisible();

        // Should show Visible Neighbor and Tenant Neighbor
        await expect(page.getByText("Visible Neighbor")).toBeVisible();
        await expect(page.getByText("Tenant Neighbor")).toBeVisible();
    });

    test("NBR-002: Search by building - Building users shown", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/neighbors");

        // Open building filter
        await page.click('button:has-text("All Buildings")');
        // Select Building A
        await page.click('span:has-text("Building A")');

        // Should show Tenant Neighbor (who is in Building A)
        await expect(page.getByText("Tenant Neighbor")).toBeVisible();
        // Should NOT show Visible Neighbor (who is in Building B)
        await expect(page.getByText("Visible Neighbor")).not.toBeVisible();
    });

    test("NBR-003: Search by flat - User found", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/neighbors");

        // Search for flat 201
        const searchInput = page.getByPlaceholder("Search by name, email, or flat number...");
        await searchInput.fill("201");
        await searchInput.press("Enter");

        // Should show Visible Neighbor (Flat 201)
        await expect(page.getByText("Visible Neighbor")).toBeVisible();
        // Should NOT show Tenant Neighbor (Flat 102)
        await expect(page.getByText("Tenant Neighbor")).not.toBeVisible();
    });

    test("NBR-004: Privacy respected - Hidden profile not displayed", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/neighbors");

        // Search for "Hidden Neighbor"
        const searchInput = page.getByPlaceholder("Search by name, email, or flat number...");
        await searchInput.fill("Hidden Neighbor");
        await searchInput.press("Enter");

        // Should NOT be found in results
        const neighborCard = page.locator('h3', { hasText: /^Hidden Neighbor$/ });
        await expect(neighborCard).not.toBeVisible({ timeout: 5000 });

        // Check for empty state message which is more reliable
        await expect(page.getByText('No residents match your search "Hidden Neighbor"')).toBeVisible();
        await expect(page.locator("div.text-sm.text-slate-400").first()).toContainText("0");
    });

    test("NBR-005: Contact details shown - Contact info shown", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/neighbors");

        // Search for Visible Neighbor to find the card
        const searchInput = page.getByPlaceholder("Search by name, email, or flat number...");
        await searchInput.fill("Visible Neighbor");
        await searchInput.press("Enter");

        // Check for Email and Phone
        await expect(page.getByText("neighbor1@example.com")).toBeVisible();
        await expect(page.getByText("9876543210")).toBeVisible();
    });

    test("NBR-006: Owner/Tenant badge - Correct badges", async ({ page }) => {
        await loginUser(page);
        await page.goto("/dashboard/neighbors");

        // Visible Neighbor is OWNER
        const ownerCard = page.locator(".group").filter({ hasText: "Visible Neighbor" });
        await expect(ownerCard.getByText("OWNER", { exact: true })).toBeVisible();

        // Tenant Neighbor is TENANT
        const tenantCard = page.locator(".group").filter({ hasText: "Tenant Neighbor" });
        await expect(tenantCard.getByText("TENANT", { exact: true })).toBeVisible();
    });
});
