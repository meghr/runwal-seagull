import { test, expect } from "@playwright/test";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

test.describe("Phase 3: Public Pages - Public Notices Tests", () => {
    // Admin user for creating content
    let adminUserId: string;
    const adminEmail = "pnot-admin@test.com";
    const buildingCode = "PNOT_B";

    // Test notices with different configurations
    const notices = {
        publicGeneral: {
            title: "PNOT Public General Notice",
            content: "Content for public general notice testing.",
            noticeType: "GENERAL" as const,
            visibility: "PUBLIC" as const,
            published: true,
        },
        publicUrgent: {
            title: "PNOT Public Urgent Notice",
            content: "Content for public urgent notice testing.",
            noticeType: "URGENT" as const,
            visibility: "PUBLIC" as const,
            published: true,
        },
        publicMaintenance: {
            title: "PNOT Public Maintenance Notice",
            content: "Content for public maintenance notice testing.",
            noticeType: "MAINTENANCE" as const,
            visibility: "PUBLIC" as const,
            published: true,
        },
        registeredOnly: {
            title: "PNOT Registered Only Notice",
            content: "Content for registered only notice testing.",
            noticeType: "GENERAL" as const,
            visibility: "REGISTERED" as const,
            published: true,
        },
        adminOnly: {
            title: "PNOT Admin Only Notice",
            content: "Content for admin only notice testing.",
            noticeType: "GENERAL" as const,
            visibility: "ADMIN" as const,
            published: true,
        },
        draftNotice: {
            title: "PNOT Draft Notice Not Published",
            content: "Content for draft notice testing.",
            noticeType: "GENERAL" as const,
            visibility: "PUBLIC" as const,
            published: false,
        },
    };

    test.beforeAll(async () => {
        // Cleanup existing test data
        await prisma.notice.deleteMany({
            where: {
                title: {
                    in: Object.values(notices).map((n) => n.title),
                },
            },
        });
        await prisma.user.deleteMany({ where: { email: adminEmail } });
        await prisma.building.deleteMany({ where: { buildingCode } });

        // Create Building
        const building = await prisma.building.create({
            data: {
                name: "Public Notice Test Building",
                buildingCode,
                totalFloors: 2,
            },
        });

        // Create Admin User
        const hashedPassword = await bcrypt.hash("password123", 10);
        const user = await prisma.user.create({
            data: {
                email: adminEmail,
                name: "PNOT Admin",
                passwordHash: hashedPassword,
                role: "ADMIN",
                status: "APPROVED",
                buildingId: building.id,
                phoneNumber: "+919888888888",
            },
        });
        adminUserId = user.id;

        // Create all test notices
        for (const noticeData of Object.values(notices)) {
            await prisma.notice.create({
                data: {
                    ...noticeData,
                    publishedAt: noticeData.published ? new Date() : null,
                    creator: { connect: { id: adminUserId } },
                },
            });
        }

        console.log("Seeded Public Notices Test Data");
    });

    test.afterAll(async () => {
        // Cleanup
        await prisma.notice.deleteMany({
            where: {
                title: {
                    in: Object.values(notices).map((n) => n.title),
                },
            },
        });
        await prisma.user.deleteMany({ where: { email: adminEmail } });
        await prisma.building.deleteMany({ where: { buildingCode } });
    });

    test("PNOT-001: Only PUBLIC visibility notices are shown", async ({
        page,
    }) => {
        await page.goto("/");

        // Scroll to notices section
        const noticesSection = page.locator("#notices");
        await noticesSection.scrollIntoViewIfNeeded();

        // Wait for notices to load
        await page.waitForTimeout(1000);

        // PUBLIC notices should be visible (use getByRole for headings)
        await expect(
            page.getByRole("heading", { name: notices.publicGeneral.title })
        ).toBeVisible();
        await expect(
            page.getByRole("heading", { name: notices.publicUrgent.title })
        ).toBeVisible();
        await expect(
            page.getByRole("heading", { name: notices.publicMaintenance.title })
        ).toBeVisible();

        // REGISTERED only notices should NOT be visible
        await expect(
            page.getByRole("heading", { name: notices.registeredOnly.title })
        ).not.toBeVisible();

        // ADMIN only notices should NOT be visible
        await expect(
            page.getByRole("heading", { name: notices.adminOnly.title })
        ).not.toBeVisible();
    });

    test("PNOT-002: Only published notices visible - Drafts not shown", async ({
        page,
    }) => {
        await page.goto("/");

        // Scroll to notices section
        const noticesSection = page.locator("#notices");
        await noticesSection.scrollIntoViewIfNeeded();

        // Wait for notices to load
        await page.waitForTimeout(1000);

        // Published notices should be visible
        await expect(
            page.getByRole("heading", { name: notices.publicGeneral.title })
        ).toBeVisible();

        // Draft notices should NOT be visible (even if PUBLIC visibility)
        await expect(
            page.getByRole("heading", { name: notices.draftNotice.title })
        ).not.toBeVisible();
    });

    test("PNOT-003: Notice type badges display with correct colors", async ({
        page,
    }) => {
        await page.goto("/");

        // Scroll to notices section
        const noticesSection = page.locator("#notices");
        await noticesSection.scrollIntoViewIfNeeded();

        // Wait for notices to load
        await page.waitForTimeout(1000);

        // Check GENERAL badge exists with blue color class
        const generalBadge = page.locator('[class*="bg-blue"][class*="text-blue"]').filter({ hasText: 'GENERAL' });
        await expect(generalBadge.first()).toBeVisible();

        // Check URGENT badge exists with red color class
        const urgentBadge = page.locator('[class*="bg-red"][class*="text-red"]').filter({ hasText: 'URGENT' });
        await expect(urgentBadge.first()).toBeVisible();

        // Check MAINTENANCE badge exists with orange color class
        const maintenanceBadge = page.locator('[class*="bg-orange"][class*="text-orange"]').filter({ hasText: 'MAINTENANCE' });
        await expect(maintenanceBadge.first()).toBeVisible();
    });

    test("PNOT-004: Notice detail view - Modal opens on click", async ({
        page,
    }) => {
        await page.goto("/");

        // Scroll to notices section
        const noticesSection = page.locator("#notices");
        await noticesSection.scrollIntoViewIfNeeded();

        // Wait for notices to load
        await page.waitForTimeout(1000);

        // Click on a notice card (find by heading)
        const noticeHeading = page.getByRole("heading", {
            name: notices.publicGeneral.title,
        });
        await expect(noticeHeading).toBeVisible();
        await noticeHeading.click();

        // Wait for modal to appear
        await page.waitForTimeout(500);

        // Verify modal is open - check for modal container with fixed positioning
        const modalOverlay = page.locator('.fixed.inset-0.z-50');
        await expect(modalOverlay).toBeVisible();

        // Check that the full notice title is visible in the modal (h2 element in modal)
        // The modal's h2 is styled with text-3xl
        const modalTitle = page.locator('h2.text-3xl').filter({ hasText: notices.publicGeneral.title });
        await expect(modalTitle).toBeVisible();

        // Check that notice content is displayed in the modal (use first() to avoid matching card content too)
        await expect(
            page.locator(`text=${notices.publicGeneral.content}`).first()
        ).toBeVisible();

        // Verify the Close button exists in the modal
        const closeButton = page.locator('button:has-text("Close")');
        await expect(closeButton).toBeVisible();

        // Click Close button to dismiss the modal
        await closeButton.click();

        // Verify modal is closed
        await page.waitForTimeout(300);
        await expect(modalOverlay).not.toBeVisible();
    });

    test("PNOT-004b: Notice modal can be closed by clicking overlay", async ({
        page,
    }) => {
        await page.goto("/");

        // Scroll to notices section
        const noticesSection = page.locator("#notices");
        await noticesSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);

        // Click on a notice to open modal (using getByRole for specific heading)
        const noticeHeading = page.getByRole("heading", {
            name: notices.publicUrgent.title,
        });
        await noticeHeading.click();

        // Wait for modal
        await page.waitForTimeout(500);

        // Verify modal is open
        const modalOverlay = page.locator('.fixed.inset-0.z-50');
        await expect(modalOverlay).toBeVisible();

        // Click on the overlay background (outside the modal content)
        // The modal content has stopPropagation, so clicking on the overlay should close it
        await page.click('.fixed.inset-0.z-50', { position: { x: 10, y: 10 } });

        // Verify modal is closed
        await page.waitForTimeout(300);
        await expect(modalOverlay).not.toBeVisible();
    });
});
