import { test, expect, Page } from "@playwright/test";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

test.describe("Phase 5: Admin Portal - Notice Management Tests", () => {
    let adminUser: any;
    let buildingNB: any;
    let flatNB101: any;

    const PREFIX = "E2E_ANOT_";
    const NOTICE_T1 = PREFIX + "Listing_Test";
    const NOTICE_T_DRAFT = PREFIX + "Draft_To_Publish";
    const NOTICE_T_EDIT = PREFIX + "To_Edit";
    const NOTICE_T_DELETE = PREFIX + "To_Delete";

    test.beforeAll(async () => {
        // Cleanup
        const testUsers = await prisma.user.findMany({
            where: { email: "admin-notice-test@example.com" },
            select: { id: true }
        });
        const userIds = testUsers.map(u => u.id);
        if (userIds.length > 0) {
            await prisma.notice.deleteMany({
                where: { createdBy: { in: userIds } }
            });
        }
        await prisma.notice.deleteMany({
            where: { title: { startsWith: PREFIX } }
        });
        await prisma.user.deleteMany({
            where: { email: "admin-notice-test@example.com" }
        });

        buildingNB = await prisma.building.upsert({
            where: { buildingCode: "NB" },
            update: {},
            create: { name: "Notice Building", buildingCode: "NB" },
        });

        flatNB101 = await prisma.flat.upsert({
            where: { buildingId_flatNumber: { buildingId: buildingNB.id, flatNumber: "101" } },
            update: {},
            create: { buildingId: buildingNB.id, flatNumber: "101" },
        });

        const hashedPassword = await bcrypt.hash("Password123!", 10);
        adminUser = await prisma.user.create({
            data: {
                email: "admin-notice-test@example.com",
                name: "Admin Notice User",
                passwordHash: hashedPassword,
                role: "ADMIN",
                status: "APPROVED",
                userType: "OWNER",
                buildingId: buildingNB.id,
                flatId: flatNB101.id,
            },
        });

        // Seed
        await prisma.notice.createMany({
            data: [
                {
                    title: NOTICE_T1,
                    content: "<p>Listing test content</p>",
                    noticeType: "GENERAL",
                    createdBy: adminUser.id,
                    published: true,
                    publishedAt: new Date(),
                },
                {
                    title: NOTICE_T_DRAFT,
                    content: "<p>This is a draft notice</p>",
                    noticeType: "MAINTENANCE",
                    createdBy: adminUser.id,
                    published: false,
                },
                {
                    title: NOTICE_T_EDIT,
                    content: "<p>Content to edit</p>",
                    noticeType: "EVENT",
                    createdBy: adminUser.id,
                    published: true,
                    publishedAt: new Date(),
                },
                {
                    title: NOTICE_T_DELETE,
                    content: "<p>Content to delete</p>",
                    noticeType: "URGENT",
                    createdBy: adminUser.id,
                    published: false,
                }
            ]
        });
    });

    async function loginAsAdmin(page: Page) {
        await page.goto("/login");
        await page.fill('input[name="email"]', "admin-notice-test@example.com");
        await page.fill('input[name="password"]', "Password123!");
        await page.click('button[type="submit"]');
        await page.waitForURL("/dashboard");
    }

    test("ANOT-001: View all notices - Admin logged in", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/notices");
        await expect(page.getByText("Notice Management")).toBeVisible();
        await expect(page.getByText(NOTICE_T1)).toBeVisible();
        await expect(page.getByText(NOTICE_T_DRAFT)).toBeVisible();
    });

    test("ANOT-002: Create notice - Fill form, submit", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/notices/create");
        const title = PREFIX + "Created_Notice";
        await page.fill('input[id="title"]', title);
        await page.locator(".tiptap.prose").fill("Content for new notice.");
        await page.click('button:has-text("Publish Notice")');
        await page.waitForURL("**/admin/notices");
        await expect(page.getByText(title)).toBeVisible();
    });

    test("ANOT-003: Rich text editor - Format text", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/notices/create");
        const title = PREFIX + "Rich_Text";
        await page.fill('input[id="title"]', title);
        const editor = page.locator(".tiptap.prose");
        await editor.focus();
        await page.keyboard.type("Rich text formatting test");
        await page.keyboard.press("Control+a");
        await page.locator('button:has(.lucide-bold)').click();
        await page.click('button:has-text("Publish Notice")');
        await page.waitForURL("**/admin/notices");
        await expect(page.getByText(title)).toBeVisible();
    });

    test("ANOT-004: Upload attachment - Verify trigger", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/notices/create");
        await page.click('button:has-text("Add Attachment")');
        await expect(page.getByRole("button", { name: "Upload Document" })).toBeVisible();
    });

    test("ANOT-005: Save as draft - Notice unpublished", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/notices/create");
        const title = PREFIX + "Draft_Saved";
        await page.fill('input[id="title"]', title);
        await page.locator(".tiptap.prose").fill("Draft content");
        await page.click('button:has-text("Save Draft")');
        await page.waitForURL("**/admin/notices");
        const row = page.locator("tr").filter({ hasText: title });
        await expect(row.getByText("Draft", { exact: true })).toBeVisible();
    });

    test("ANOT-006: Publish notice - Click Publish", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/notices");
        const row = page.locator("tr").filter({ hasText: NOTICE_T_DRAFT });
        await row.locator('a[href*="/edit"]').click();
        await expect(page.getByRole("heading", { name: "Edit Notice", exact: true })).toBeVisible();
        await page.click('button:has-text("Publish Notice")');
        await page.waitForURL("**/admin/notices");
        const updatedRow = page.locator("tr").filter({ hasText: NOTICE_T_DRAFT });
        await expect(updatedRow.getByText("Published", { exact: true })).toBeVisible();
    });

    test("ANOT-007: Edit notice - Update and save", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/notices");
        const row = page.locator("tr").filter({ hasText: NOTICE_T_EDIT });
        await row.locator('a[href*="/edit"]').click();
        const newTitle = NOTICE_T_EDIT + "_Updated";
        await page.fill('input[id="title"]', newTitle);
        await page.click('button:has-text("Update & Publish")');
        await page.waitForURL("**/admin/notices");
        await expect(page.getByText(newTitle)).toBeVisible();
    });

    test("ANOT-008: Delete notice - Click delete", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/notices");
        const row = page.locator("tr").filter({ hasText: NOTICE_T_DELETE });
        page.on('dialog', dialog => dialog.accept());
        await row.locator('button:has(.lucide-trash2)').click();
        await expect(page.getByText(NOTICE_T_DELETE)).not.toBeVisible();
    });

    test("ANOT-009: Set visibility - Select visibility", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/notices/create");
        const title = PREFIX + "Visibility";
        await page.fill('input[id="title"]', title);
        await page.locator(".tiptap.prose").fill("Content");
        await page.locator('button:has-text("Public (Everyone)")').click();
        await page.getByRole("option", { name: "Registered Users Only" }).click();
        await page.click('button:has-text("Publish Notice")');
        await page.waitForURL("**/admin/notices");
        const row = page.locator("tr").filter({ hasText: title });
        await expect(row.getByText("REGISTERED")).toBeVisible();
    });

    test("ANOT-010: Set notice type - Select type", async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto("/admin/notices/create");
        const title = PREFIX + "Type";
        await page.fill('input[id="title"]', title);
        await page.locator(".tiptap.prose").fill("Content");
        await page.locator('button:has-text("General Announcement")').click();
        await page.getByRole("option", { name: "Urgent Alert" }).click();
        await page.click('button:has-text("Publish Notice")');
        await page.waitForURL("**/admin/notices");
        const row = page.locator("tr").filter({ hasText: title });
        await expect(row.getByText("URGENT")).toBeVisible();
    });
});
