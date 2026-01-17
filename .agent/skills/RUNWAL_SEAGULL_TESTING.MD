---
description: Runwal Seagull Testing - Comprehensive Testing Guide
---

# Runwal Seagull Testing Skill

This skill provides comprehensive guidelines for writing and maintaining tests in the Runwal Seagull project.

## Testing Framework Overview

**Primary Framework**: Playwright (E2E) + Vitest (Unit/Integration)  
**Test Count**: 23 E2E test files, ~300+ test cases  
**Coverage Target**: 85% overall, 100% for critical paths  
**Test Execution**: Sequential (workers: 1) for database consistency

## Test Stack

- **E2E**: Playwright 1.57.0
- **Unit**: Vitest 4.0.17
- **Component**: React Testing Library 16.3.1
- **Mocking**: MSW 2.12.7
- **Data**: @faker-js/faker 10.2.0

## Test Isolation Principles

### 1. Unique Prefixes (CRITICAL!)

**Every test file MUST use a unique prefix to avoid data conflicts:**

```typescript
// registration.spec.ts
const PREFIX = "REG_E2E_";

// login.spec.ts  
const PREFIX = "LOGIN_E2E_";

// admin-users.spec.ts
const PREFIX = "E2E_AUSR_";

// dashboard.spec.ts
const PREFIX = "E2E_DASHBOARD_";
```

**Naming Convention**:
| Test File | Prefix | Building Code |
|-----------|--------|---------------|
| registration.spec.ts | `REG_E2E_` | `REG_E2E_B1` |
| login.spec.ts | `LOGIN_E2E_` | `LOGIN_B1` |
| admin-users.spec.ts | `E2E_AUSR_` | `E2EAUSR_B1` |

### 2. Self-Contained Tests

Every test suite must:
- ✅ Setup its own data in `beforeAll`
- ✅ Cleanup its data in `afterAll`
- ✅ Not depend on other tests
- ✅ Be runnable independently

### 3. Test Structure Template

```typescript
import { test, expect } from "@playwright/test";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

const PREFIX = "E2E_MYTEST_";  // UNIQUE!
const TEST_EMAIL = PREFIX + "user@test.com";
const PASSWORD = "Password123!";

test.describe("Feature Name", () => {
  let testUser: any;
  let building: any;
  let flat: any;

  test.beforeAll(async () => {
    // STEP 1: Cleanup (aggressive, catch leftovers)
    await cleanupTestData();

    // STEP 2: Create fresh test data
    building = await prisma.building.create({
      data: {
        name: PREFIX + "Building",
        buildingCode: PREFIX + "B1",  // Unique code!
        isActiveForRegistration: true,  // REQUIRED!
        totalFloors: 5,
      },
    });

    flat = await prisma.flat.create({
      data: {
        flatNumber: PREFIX + "101",
        floorNumber: 1,
        buildingId: building.id,
        bhkType: "2BHK",
      },
    });

    const hashedPassword = await bcrypt.hash(PASSWORD, 12);
    testUser = await prisma.user.create({
      data: {
        name: PREFIX + "Test User",
        email: TEST_EMAIL,
        passwordHash: hashedPassword,
        role: "OWNER",
        status: "APPROVED",  // Must be APPROVED for login!
        userType: "OWNER",
        buildingId: building.id,
        flatId: flat.id,
      },
    });
  });

  test.afterAll(async () => {
    // STEP 3: Cleanup (mirror beforeAll)
    await cleanupTestData();
    await prisma.$disconnect();
  });

  // Helper function
  async function cleanupTestData() {
    // Follow cleanup order!
    await prisma.eventRegistration.deleteMany({
      where: { user: { email: { startsWith: PREFIX } } },
    });
    await prisma.vehicle.deleteMany({
      where: { user: { email: { startsWith: PREFIX } } },
    });
    await prisma.event.deleteMany({
      where: { title: { startsWith: PREFIX } } },
    });
    await prisma.notice.deleteMany({
      where: { title: { startsWith: PREFIX } },
    });
    await prisma.user.updateMany({
      where: { approvedBy: { not: null }, email: { startsWith: PREFIX } },
      data: { approvedBy: null },
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: PREFIX } },
    });
    await prisma.flat.deleteMany({
      where: { flatNumber: { startsWith: PREFIX } },
    });
    await prisma.building.deleteMany({
      where: { buildingCode: { startsWith: PREFIX } },
    });
  }

  test("TEST-001: Description", async ({ page }) => {
    // Test implementation
    await page.goto("/some-page");
    
    // Use explicit waits
    await page.waitForSelector("text=Expected Text");
    
    // Assertions
    await expect(page.locator("h1")).toContainText("Title");
  });
});
```

## Critical Rules

### Building Creation (MUST HAVE!)

**Always include `isActiveForRegistration: true` for registration tests:**

```typescript
const building = await prisma.building.create({
  data: {
    name: PREFIX + "Building",
    buildingCode: PREFIX + "B1",  // Must be unique!
    isActiveForRegistration: true,  // REQUIRED!
    totalFloors: 5,  // Optional but recommended
  },
});
```

❌ **Common Mistake**:
```typescript
// Missing isActiveForRegistration - building won't appear in dropdown!
const building = await prisma.building.create({
  data: {
    name: "Building",
    buildingCode: "B1",  // ❌ Not unique
  },
});
```

### User Status (CRITICAL!)

**For login tests, user MUST have `status: "APPROVED"`:**

```typescript
const user = await prisma.user.create({
  data: {
    // ... other fields
    status: "APPROVED",  // REQUIRED for login!
  },
});
```

**User Status Flow**:
```
PENDING → Cannot login (show "Account pending approval")
APPROVED → Can login successfully
SUSPENDED → Cannot login (show "Account suspended")
REJECTED → Cannot login
```

### Cleanup Order (Foreign Keys!)

**ALWAYS cleanup in this order to respect foreign key constraints:**

```typescript
async function cleanupTestData() {
  // 1. Activity logs (references users)
  await prisma.activityLog.deleteMany({
    where: { user: { email: { startsWith: PREFIX } } },
  });

  // 2. Event registrations (references events & users)
  await prisma.eventRegistration.deleteMany({
    where: { user: { email: { startsWith: PREFIX } } },
  });

  // 3. Vehicles (references users)
  await prisma.vehicle.deleteMany({
    where: { user: { email: { startsWith: PREFIX } } },
  });

  // 4. Marketplace ads (references users)
  await prisma.marketplaceAd.deleteMany({
    where: { userId: { in: testUserIds } },
  });

  // 5. Complaints and related (complex dependencies)
  await prisma.complaintComment.deleteMany(...);
  await prisma.complaintStatusHistory.deleteMany(...);
  await prisma.complaint.deleteMany(...);

  // 6. Notices (references users)
  await prisma.notice.deleteMany({
    where: { title: { startsWith: PREFIX } },
  });

  // 7. Events (references users)
  await prisma.event.deleteMany({
    where: { title: { startsWith: PREFIX } },
  });

  // 8. Clear self-references in users (IMPORTANT!)
  await prisma.user.updateMany({
    where: { approvedBy: { not: null }, email: { startsWith: PREFIX } },
    data: { approvedBy: null },
  });

  // 9. Users
  await prisma.user.deleteMany({
    where: { email: { startsWith: PREFIX } },
  });

  // 10. Flats (references buildings)
  await prisma.flat.deleteMany({
    where: { flatNumber: { startsWith: PREFIX } },
  });

  // 11. Buildings (no dependencies)
  await prisma.building.deleteMany({
    where: { buildingCode: { startsWith: PREFIX } },
  });
}
```

## Test Data Patterns

### Creating Users

```typescript
// Admin User
const adminUser = await prisma.user.create({
  data: {
    name: PREFIX + "Admin",
    email: PREFIX + "admin@test.com",
    passwordHash: await bcrypt.hash("Password123!", 12),
    role: "ADMIN",  // Special role
    status: "APPROVED",
    userType: "OWNER",
    buildingId: building.id,
    flatId: flat.id,
  },
});

// Regular User (Owner)
const ownerUser = await prisma.user.create({
  data: {
    name: PREFIX + "Owner",
    email: PREFIX + "owner@test.com",
    passwordHash: await bcrypt.hash("Password123!", 12),
    role: "OWNER",
    status: "APPROVED",
    userType: "OWNER",
    buildingId: building.id,
    flatId: flat.id,
  },
});

// Tenant User
const tenantUser = await prisma.user.create({
  data: {
    name: PREFIX + "Tenant",
    email: PREFIX + "tenant@test.com",
    passwordHash: await bcrypt.hash("Password123!", 12),
    role: "TENANT",
    status: "APPROVED",
    userType: "TENANT",
    buildingId: building.id,
    // Note: Tenant may not have flatId ownership
  },
});

// Pending User
const pendingUser = await prisma.user.create({
  data: {
    name: PREFIX + "Pending",
    email: PREFIX + "pending@test.com",
    passwordHash: await bcrypt.hash("Password123!", 12),
    role: "PUBLIC",
    status: "PENDING",  // Not approved yet
    userType: "OWNER",
    buildingId: building.id,
  },
});
```

### Creating Events

```typescript
// Individual Event (Open Registration)
const individualEvent = await prisma.event.create({
  data: {
    title: PREFIX + "Individual Event",
    description: "Test individual event",
    eventType: "SPORTS",
    startDate: new Date("2026-03-01"),
    endDate: new Date("2026-03-02"),
    venue: "Sports Ground",
    registrationRequired: true,
    registrationStartDate: new Date(),  // Started
    registrationEndDate: new Date("2026-02-28"),  // Future
    participationType: "INDIVIDUAL",
    maxParticipants: 50,
    published: true,
    createdBy: adminUser.id,
  },
});

// Team Event
const teamEvent = await prisma.event.create({
  data: {
    title: PREFIX + "Team Event",
    description: "Test team event",
    eventType: "SPORTS",
    startDate: new Date("2026-03-15"),
    endDate: new Date("2026-03-16"),
    venue: "Main Hall",
    registrationRequired: true,
    registrationStartDate: new Date(),
    registrationEndDate: new Date("2026-03-14"),
    participationType: "TEAM",  // Team event!
    maxParticipants: 10,  // 10 teams
    published: true,
    createdBy: adminUser.id,
  },
});

// Event with Registration Closed
const closedEvent = await prisma.event.create({
  data: {
    title: PREFIX + "Closed Event",
    eventType: "MEETING",
    startDate: new Date("2026-02-01"),
    endDate: new Date("2026-02-01"),
    registrationRequired: true,
    registrationEndDate: new Date("2026-01-01"),  // Past date!
    published: true,
    createdBy: adminUser.id,
  },
});
```

### Creating Notices

```typescript
// Public Notice
const publicNotice = await prisma.notice.create({
  data: {
    title: PREFIX + "Public Notice",
    content: "This is a public notice for testing.",
    noticeType: "GENERAL",
    visibility: "PUBLIC",  // Visible to all
    published: true,
    publishedAt: new Date(),
    createdBy: adminUser.id,
  },
});

// Registered-Only Notice
const registeredNotice = await prisma.notice.create({
  data: {
    title: PREFIX + "Registered Notice",
    content: "This notice is only for registered users.",
    noticeType: "URGENT",
    visibility: "REGISTERED",  // Only registered users
    published: true,
    publishedAt: new Date(),
    createdBy: adminUser.id,
  },
});

// Draft Notice
const draftNotice = await prisma.notice.create({
  data: {
    title: PREFIX + "Draft Notice",
    content: "This is a draft notice.",
    noticeType: "GENERAL",
    visibility: "PUBLIC",
    published: false,  // Not published!
    createdBy: adminUser.id,
  },
});
```

## Playwright Best Practices

### 1. Explicit Waits (Never use sleep!)

✅ **Do**:
```typescript
// Wait for URL
await page.waitForURL("**/dashboard");

// Wait for element
await page.waitForSelector("text=Welcome");

// Wait for load state
await page.waitForLoadState("networkidle");

// Wait for navigation
await Promise.all([
  page.waitForNavigation(),
  page.click('button[type="submit"]'),
]);
```

❌ **Don't**:
```typescript
// Never use arbitrary waits!
await page.waitForTimeout(3000);  // ❌ Flaky!
```

### 2. Robust Selectors

✅ **Preferred Order**:
```typescript
// 1. Text content (best for user-facing elements)
await page.click("text=Login");

// 2. Test IDs (add data-testid in components)
await page.click('[data-testid="login-button"]');

// 3. Role-based
await page.click('button[type="submit"]');

// 4. CSS selectors (last resort)
await page.click(".login-button");
```

❌ **Avoid**:
```typescript
// Fragile selectors
await page.click("div > div > button");  // ❌ Breaks easily
```

### 3. Login Helper Pattern

```typescript
// Define helper function
async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard");
  await expect(page.getByText("Dashboard")).toBeVisible();
}

// Use in tests
test("Admin can view users", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/users");
  // ... rest of test
});
```

### 4. Dialog Handling

```typescript
// Accept confirmation dialogs
page.on('dialog', dialog => dialog.accept());
await page.click('button:has-text("Delete")');

// Assert specific dialog message
page.on('dialog', async dialog => {
  expect(dialog.message()).toContain("Are you sure?");
  await dialog.accept();
});
await page.click('button:has-text("Delete")');
```

### 5. Form Filling

```typescript
// Fill form fields
await page.fill('input[name="email"]', "test@example.com");
await page.fill('input[name="password"]', "Password123");

// Select from dropdown (native select)
await page.selectOption('select[name="building"]', building.id);

// Select from Radix UI Select (custom dropdown)
await page.click('button:has-text("Select Building")');
await page.click('div[role="option"]:has-text("Building A")');

// Upload file
await page.setInputFiles('input[type="file"]', '/path/to/file.pdf');

// Check checkbox
await page.check('input[type="checkbox"]');
```

## Running Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test __tests__/e2e/login.spec.ts

# Run tests matching pattern
npx playwright test -g "LOGIN-001"

# Run with UI (interactive debugging)
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode (pause on failure)
npx playwright test --debug

# Run specific test by line number
npx playwright test login.spec.ts:42
```

### Advanced Options

```bash
# Run on different browser
npx playwright test --project=firefox

# Run with specific workers (parallel)
npx playwright test --workers=2

# Update snapshots (visual regression)
npx playwright test --update-snapshots

# Show browser and slow down actions
npx playwright test --headed --slow-mo=1000
```

## Debugging Failed Tests

### 1. HTML Report

```bash
npx playwright show-report
```

Shows:
- ✅ Test results summary
- ✅ Error messages and stack traces
- ✅ Screenshots of failures
- ✅ Video recordings
- ✅ Network activity

### 2. Trace Viewer

```bash
npx playwright show-trace playwright-results/trace.zip
```

Provides:
- ✅ Step-by-step timeline
- ✅ DOM snapshots at each step
- ✅ Network requests
- ✅ Console logs
- ✅ Screenshots

### 3. Inspect Database

```bash
npx prisma studio
```

Verify:
- ✅ Test data exists
- ✅ Correct values
- ✅ Relationships correct
- ✅ Cleanup worked

### 4. Add Debug Logging

```typescript
test("my test", async ({ page }) => {
  console.log("Step 1: Navigate");
  await page.goto("/login");
  
  console.log("Current URL:", page.url());
  
  console.log("Step 2: Fill form");
  await page.fill('input[name="email"]', email);
  
  // Take screenshots
  await page.screenshot({ path: 'debug-before-submit.png' });
  
  await page.click('button[type="submit"]');
  
  await page.screenshot({ path: 'debug-after-submit.png' });
});
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| **Building not in dropdown** | `isActiveForRegistration: false` | Set to `true` in seed |
| **Login fails after registration** | User status is PENDING | Approve user: `status: "APPROVED"` |
| **Unique constraint error** | Building code conflict | Use PREFIX-based unique codes |
| **Timeout error** | Element not found | Check selector, add explicit wait |
| **Data left in DB** | Missing cleanup | Implement `afterAll` cleanup |
| **Test fails only in CI** | Race condition | Add `waitForSelector()` |
| **Random failures** | Parallel execution | Set `workers: 1` in config |

## Test Checklist

Before committing a new test:

- [ ] Unique `PREFIX` defined
- [ ] `beforeAll` has **cleanup** and seed
- [ ] `afterAll` has cleanup
- [ ] Buildings have `isActiveForRegistration: true`
- [ ] Building codes use PREFIX (unique)
- [ ] Users have correct `status` (APPROVED for login)
- [ ] Cleanup order respects foreign keys
- [ ] No hardcoded `waitForTimeout`
- [ ] Descriptive test names (TEST-001: Description)
- [ ] Test passes locally
- [ ] Test is independent (can run alone)

## Test Naming Convention

Follow the TEST_PLAN.md convention:

```
Feature Prefix + Test Number: Description

Examples:
✅ LOGIN-001: Valid credentials - Redirect to dashboard
✅ REG-003: Invalid email format - Show validation error
✅ AUSR-009: Approve pending user - Status changes to APPROVED
✅ EVT-006: Individual registration - Registration created successfully
```

## Writing New Tests

### Step-by-Step Guide

1. **Choose Unique Prefix**
   ```typescript
   const PREFIX = "E2E_MYFEATURE_";
   ```

2. **Create Test File**
   ```bash
   touch __tests__/e2e/my-feature.spec.ts
   ```

3. **Setup Test Structure**
   ```typescript
   import { test, expect } from "@playwright/test";
   import { prisma } from "@/lib/db";
   import bcrypt from "bcryptjs";

   const PREFIX = "E2E_MYFEATURE_";

   test.describe("My Feature Tests", () => {
     test.beforeAll(async () => { /* ... */ });
     test.afterAll(async () => { /* ... */ });
     
     test("FEAT-001: Test description", async ({ page }) => {
       // ...
     });
   });
   ```

4. **Implement Cleanup**
   ```typescript
   async function cleanupTestData() {
     // Follow cleanup order!
   }
   ```

5. **Create Test Data**
   ```typescript
   test.beforeAll(async () => {
     await cleanupTestData();
     
     building = await prisma.building.create({ /* ... */ });
     // ... more data
   });
   ```

6. **Write Test Cases**
   ```typescript
   test("FEAT-001: User can do action", async ({ page }) => {
     await page.goto("/my-page");
     await page.click("button");
     await expect(page).toHaveURL(/success/);
   });
   ```

7. **Run and Debug**
   ```bash
   npx playwright test my-feature.spec.ts --headed
   ```

## Resources

### Documentation
- [Playwright Docs](https://playwright.dev)
- [Vitest Docs](https://vitest.dev)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro)

### Project Files
- `TEST_PLAN.md` - Comprehensive test plan
- `playwright.config.ts` - Playwright configuration
- `vitest.config.ts` - Vitest configuration
- `docs/TESTING_FRAMEWORK.md` - Detailed testing guide

---

**Skill Version**: 2.0  
**Last Updated**: January 18, 2026  
**Maintained By**: QA Team
