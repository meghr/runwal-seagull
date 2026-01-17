# Runwal Seagull - Testing Framework Documentation

**Version**: 1.0  
**Last Updated**: January 18, 2026  
**Test Coverage Target**: 85%  
**Document Type**: Testing Strategy & Implementation Guide

---

## 📋 Table of Contents

1. [Testing Strategy Overview](#testing-strategy-overview)
2. [Testing Stack](#testing-stack)
3. [Test Directory Structure](#test-directory-structure)
4. [Unit Testing with Vitest](#unit-testing-with-vitest)
5. [E2E Testing with Playwright](#e2e-testing-with-playwright)
6. [Test Data Management](#test-data-management)
7. [Testing Patterns & Best Practices](#testing-patterns--best-practices)
8. [Running Tests](#running-tests)
9. [Coverage Reports](#coverage-reports)
10. [CI/CD Integration](#cicd-integration)
11. [Debugging Failed Tests](#debugging-failed-tests)

---

## Testing Strategy Overview

### Test Pyramid

The project follows the standard test pyramid with an emphasis on E2E tests for critical user journeys:

```
          /\
         /  \      E2E Tests (23 files)
        /    \     - Critical user flows
       /------\    - Full browser automation
      /        \   
     /          \  Integration Tests (0 files - Future)
    /            \ - API + Database
   /--------------\- Multi-component interactions
  /                \
 /                  \ Unit Tests (0 files - Future)
/--------------------\ - Functions, components
                      - Validations, utilities
```

**Current Focus**: E2E tests (100% of test suite)  
**Test Distribution**:
- E2E: 23 test files, ~300+ test cases
- Unit: 0 (to be added)
- Integration: 0 (to be added)

### Testing Philosophy

1. **User-Centric**: Tests mimic real user behavior
2. **Isolation**: Each test is independent and self-contained
3. **Repeatability**: Tests can run multiple times with same results
4. **Fast Feedback**: Tests fail quickly on errors
5. **Comprehensive**: Cover happy paths and edge cases

### Test Coverage Goals

| Module | Target Coverage | Priority |
|--------|----------------|----------|
| Server Actions | 90% | Critical |
| Validations (Zod) | 100% | Critical |
| E2E User Flows | 100% | High |
| UI Components | 80% | Medium |
| Utility Functions | 95% | High |

---

## Testing Stack

### Testing Tools

| Tool | Version | Purpose | Configuration File |
|------|---------|---------|-------------------|
| **Vitest** | 4.0.17 | Unit & Integration testing | `vitest.config.ts` |
| **Playwright** | 1.57.0 | E2E browser testing | `playwright.config.ts` |
| **React Testing Library** | 16.3.1 | Component testing | Configured in Vitest |
| **MSW** | 2.12.7 | API mocking | `__tests__/mocks/` |
| **@faker-js/faker** | 10.2.0 | Test data generation | Used in fixtures |

### Support Libraries

| Library | Purpose |
|---------|---------|
| `@testing-library/jest-dom` | Custom Jest matchers for DOM |
| `@testing-library/user-event` | Simulate user interactions |
| `@vitest/coverage-v8` | Code coverage reporting |
| `@vitest/ui` | Interactive test UI |
| `vitest-mock-extended` | Advanced mocking |
| `bcryptjs` | Password hashing in tests |

---

## Test Directory Structure

### Complete Tree

```
__tests__/
├── e2e/                                # End-to-end tests (Playwright)
│   ├── admin-approval.spec.ts          # User approval workflow
│   ├── admin-dashboard.spec.ts         # Admin dashboard functionality
│   ├── admin-event-management.spec.ts  # Event CRUD operations
│   ├── admin-events.spec.ts            # Event management tests
│   ├── admin-notices.spec.ts           # Notice management tests
│   ├── admin-user-management.spec.ts   # User management tests
│   ├── admin-users.spec.ts             # User administration
│   ├── dashboard.spec.ts               # User dashboard
│   ├── demo.spec.ts                    # Demo/smoke tests
│   ├── event-management.spec.ts        # User event viewing
│   ├── event-registration.spec.ts      # Individual event registration
│   ├── event-team-registration.spec.ts # Team event registration
│   ├── foundation.spec.ts              # Database & environment tests
│   ├── landing.spec.ts                 # Public landing page
│   ├── login.spec.ts                   # Login flow
│   ├── neighbor-directory.spec.ts      # Neighbor search
│   ├── notice-board.spec.ts            # Notice viewing
│   ├── profile.spec.ts                 # User profile management
│   ├── public-events.spec.ts           # Public event display
│   ├── public-notices.spec.ts          # Public notice display
│   ├── registration.spec.ts            # User registration
│   ├── user-journey.spec.ts            # Complete new user flow
│   └── vehicle-management.spec.ts      # Vehicle CRUD
│       Total: 23 test files
│
├── unit/                               # Unit tests (Future)
│   ├── api/
│   ├── components/
│   ├── foundation/
│   └── lib/
│
├── integration/                        # Integration tests (Future)
│
├── fixtures/                          # Test data fixtures
│   └── users.ts                       # User test data
│
├── helpers/                           # Test utilities
│   └── test-utils.tsx                 # Custom render functions
│
├── mocks/                             # Mock implementations
│   ├── handlers.ts                    # MSW request handlers
│   ├── server.ts                      # MSW server setup
│   └── prisma.ts                      # Prisma mock
│
└── setup/                             # Global test setup
    ├── vitest.setup.ts                # Vitest global config
    ├── playwright.global-setup.ts     # Playwright setup
    ├── playwright.global-teardown.ts  # Playwright teardown
    └── prisma-mock.ts                 # Prisma mock setup
```

### File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| E2E Tests | `*.spec.ts` | `login.spec.ts` |
| Unit Tests | `*.test.ts` | `auth.test.ts` |
| Fixtures | `*.ts` | `users.ts` |
| Mocks | `*.ts` | `handlers.ts` |

---

## Unit Testing with Vitest

### Configuration

**File**: `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: [
      "./__tests__/setup/vitest.setup.ts",
      "./__tests__/setup/prisma-mock.ts"
    ],
    globals: true,
    include: [
      "__tests__/unit/**/*.{test,spec}.{ts,tsx}",
      "__tests__/integration/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: [
      "node_modules",
      "__tests__/e2e/**/*",
      "__tests__/fixtures/**/*",
      "__tests__/mocks/**/*",
      "__tests__/helpers/**/*",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      thresholds: {
        global: {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tests": path.resolve(__dirname, "./__tests__"),
    },
  },
});
```

### Global Setup

**File**: `__tests__/setup/vitest.setup.ts`

Key setups:
1. **MSW Server**: Mock API requests
2. **Next.js Mocks**: Router, navigation
3. **NextAuth Mocks**: Authentication
4. **Browser APIs**: matchMedia, IntersectionObserver, ResizeObserver

```typescript
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll, vi } from "vitest";
import { server } from "../mocks/server";

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

// Reset handlers and cleanup after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Clean up after all tests
afterAll(() => server.close());

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
```

### Unit Test Examples (Future)

#### Testing a Server Action

```typescript
// __tests__/unit/lib/actions/event.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerForEvent } from "@/lib/actions/event";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

vi.mock("@/lib/db");
vi.mock("@/auth");

describe("registerForEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register user for individual event", async () => {
    // Arrange
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", email: "test@test.com" },
    });

    vi.mocked(prisma.event.findFirst).mockResolvedValue({
      id: "event-1",
      registrationRequired: true,
      published: true,
      participationType: "INDIVIDUAL",
      _count: { registrations: 0 },
    });

    vi.mocked(prisma.eventRegistration.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.eventRegistration.create).mockResolvedValue({
      id: "reg-1",
      eventId: "event-1",
      userId: "user-1",
    });

    // Act
    const result = await registerForEvent({ eventId: "event-1" });

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(prisma.eventRegistration.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        eventId: "event-1",
        userId: "user-1",
      }),
    });
  });

  it("should fail if user not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await registerForEvent({ eventId: "event-1" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should fail if event is full", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1" },
    });

    vi.mocked(prisma.event.findFirst).mockResolvedValue({
      id: "event-1",
      registrationRequired: true,
      published: true,
      maxParticipants: 10,
      _count: { registrations: 10 },
    });

    const result = await registerForEvent({ eventId: "event-1" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("This event is full");
  });
});
```

#### Testing a Validation Schema

```typescript
// __tests__/unit/lib/validations/auth.test.ts
import { describe, it, expect } from "vitest";
import { LoginSchema, RegisterSchema } from "@/lib/validations/auth";

describe("LoginSchema", () => {
  it("should validate correct login data", () => {
    const data = {
      email: "test@example.com",
      password: "password123",
    };

    const result = LoginSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should fail with invalid email", () => {
    const data = {
      email: "invalid-email",
      password: "password123",
    };

    const result = LoginSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid email address");
    }
  });

  it("should fail with short password", () => {
    const data = {
      email: "test@example.com",
      password: "123",
    };

    const result = LoginSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
```

---

## E2E Testing with Playwright

### Configuration

**File**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./__tests__/e2e",
  testMatch: "**/*.{test,spec}.{ts,tsx}",
  
  // Run tests sequentially for database consistency
  fullyParallel: false,
  workers: 1,
  
  retries: process.env.CI ? 2 : 1,
  
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "playwright-report/results.json" }],
  ],
  
  use: {
    baseURL: "http://localhost:3000",
    trace: "on",
    screenshot: "only-on-failure",
    video: "on",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  
  timeout: 60000,
  
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  
  globalSetup: "./__tests__/setup/playwright.global-setup.ts",
  globalTeardown: "./__tests__/setup/playwright.global-teardown.ts",
});
```

### E2E Test Structure

Every E2E test follows this pattern:

```typescript
import { test, expect } from "@playwright/test";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

const PREFIX = "E2E_MYTEST_";  // Unique prefix for this test

test.describe("Feature Name", () => {
  // Setup test data
  test.beforeAll(async () => {
    // 1. Cleanup existing test data
    await cleanupTestData();
    
    // 2. Create fresh test data
    await seedTestData();
  });
  
  // Cleanup after tests
  test.afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });
  
  test("TEST-001: Test description", async ({ page }) => {
    // Test implementation
  });
});
```

### Example E2E Test

**File**: `__tests__/e2e/login.spec.ts`

```typescript
import { test, expect } from "@playwright/test";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

const PREFIX = "LOGIN_E2E_";
const TEST_EMAIL = PREFIX + "user@test.com";
const TEST_PASSWORD = "Password123!";

test.describe("Phase 2: Authentication - Login Tests", () => {
  let testUser: any;
  let building: any;

  test.beforeAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
    await prisma.building.deleteMany({ where: { buildingCode: "LOGIN_B1" } });

    // Create building
    building = await prisma.building.create({
      data: {
        name: PREFIX + "Building",
        buildingCode: "LOGIN_B1",
        isActiveForRegistration: true,
      },
    });

    // Create approved user
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12);
    testUser = await prisma.user.create({
      data: {
        name: PREFIX + "Test User",
        email: TEST_EMAIL,
        passwordHash: hashedPassword,
        role: "OWNER",
        status: "APPROVED",  // Key: Must be approved
        userType: "OWNER",
        buildingId: building.id,
      },
    });
  });

  test.afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
    await prisma.building.deleteMany({ where: { buildingCode: "LOGIN_B1" } });
    await prisma.$disconnect();
  });

  test("LOGIN-001: Valid credentials - Login successful", async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");

    // Fill in credentials
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);

    // Submit form
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    await expect(page).toHaveURL(/.*dashboard/);

    // Verify user is logged in (check for user name or dashboard elements)
    await expect(page.locator(`text=${PREFIX}Test User`)).toBeVisible();
  });

  test("LOGIN-002: Invalid password - Error shown", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', "WrongPassword");

    await page.click('button[type="submit"]');

    // Should stay on login page
    await expect(page).toHaveURL(/.*login/);

    // Error message should be visible
    await expect(page.locator("text=Invalid credentials")).toBeVisible();
  });

  test("LOGIN-004: Pending user - Cannot login", async ({ page }) => {
    // Create pending user
    const pendingEmail = PREFIX + "pending@test.com";
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12);
    
    await prisma.user.create({
      data: {
        name: PREFIX + "Pending User",
        email: pendingEmail,
        passwordHash: hashedPassword,
        role: "PUBLIC",
        status: "PENDING",  // Pending status
        userType: "OWNER",
        buildingId: building.id,
      },
    });

    await page.goto("/login");
    await page.fill('input[name="email"]', pendingEmail);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Should show pending approval message
    await expect(page.locator("text=Account pending approval")).toBeVisible();

    // Cleanup
    await prisma.user.deleteMany({ where: { email: pendingEmail } });
  });
});
```

### Test Organization by Phase

Tests are organized according to the TEST_PLAN.md phases:

| Phase | Files | Test Count | Status |
|-------|-------|-----------|--------|
| Phase 1: Foundation | 1 file | 3 tests | ✅ Complete |
| Phase 2: Auth & User Management | 4 files | ~40 tests | ✅ Complete |
| Phase 3: Public Pages | 3 files | ~25 tests | ✅ Complete |
| Phase 4: User Features | 6 files | ~80 tests | ✅ Complete |
| Phase 5: Admin Portal | 5 files | ~100 tests | ✅ Complete |
| Phase 6: Future Features | 4 files | ~50 tests | ⏳ Planned |

**Total**: 23 files, ~300 test cases implemented

---

## Test Data Management

### Data Isolation Strategy

Every test suite uses **unique prefixes** to avoid conflicts:

```typescript
// Example prefixes from different test files:
const PREFIX = "REG_E2E_";          // registration.spec.ts
const PREFIX = "LOGIN_E2E_";        // login.spec.ts
const PREFIX = "E2E_AUSR_";         // admin-users.spec.ts
const PREFIX = "E2E_DASHBOARD_";    // dashboard.spec.ts
```

### Building & Flat Creation Pattern

```typescript
// Always create buildings with unique codes
const building = await prisma.building.create({
  data: {
    name: PREFIX + "Building",
    buildingCode: PREFIX + "B1",  // Unique!
    isActiveForRegistration: true,  // REQUIRED for registration tests
    totalFloors: 5,
  },
});

// Create flat linked to building
const flat = await prisma.flat.create({
  data: {
    flatNumber: PREFIX + "101",
    floorNumber: 1,
    buildingId: building.id,
    bhkType: "2BHK",
  },
});
```

### User Creation Pattern

```typescript
const hashedPassword = await bcrypt.hash("Password123!", 12);

const user = await prisma.user.create({
  data: {
    name: PREFIX + "Test User",
    email: PREFIX + "user@test.com",
    passwordHash: hashedPassword,
    role: "OWNER",  // or ADMIN, TENANT
    status: "APPROVED",  // PENDING, SUSPENDED, REJECTED
    userType: "OWNER",
    buildingId: building.id,
    flatId: flat.id,  // Optional
    phoneNumber: "+919999999999",
  },
});
```

### Event & Notice Creation

```typescript
// Event
const event = await prisma.event.create({
  data: {
    title: PREFIX + "Test Event",
    description: "Test event description",
    eventType: "SPORTS",
    startDate: new Date("2026-02-01"),
    endDate: new Date("2026-02-02"),
    venue: "Sports Ground",
    registrationRequired: true,
    registrationStartDate: new Date(),
    registrationEndDate: new Date("2026-01-31"),
    participationType: "TEAM",
    maxParticipants: 50,
    published: true,
    createdBy: adminUser.id,
  },
});

// Notice
const notice = await prisma.notice.create({
  data: {
    title: PREFIX + "Test Notice",
    content: "This is test content.",
    noticeType: "URGENT",
    visibility: "PUBLIC",
    published: true,
    publishedAt: new Date(),
    createdBy: adminUser.id,
  },
});
```

### Cleanup Order (Critical!)

**Must follow this order to respect foreign keys**:

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

  // 4. Events (references users)
  await prisma.event.deleteMany({
    where: { title: { startsWith: PREFIX } },
  });

  // 5. Notices (references users)
  await prisma.notice.deleteMany({
    where: { title: { startsWith: PREFIX } },
  });

  // 6. Clear self-references in users
  await prisma.user.updateMany({
    where: { approvedBy: { not: null }, email: { startsWith: PREFIX } },
    data: { approvedBy: null },
  });

  // 7. Users
  await prisma.user.deleteMany({
    where: { email: { startsWith: PREFIX } },
  });

  // 8. Flats (references buildings)
  await prisma.flat.deleteMany({
    where: { flatNumber: { startsWith: PREFIX } },
  });

  // 9. Buildings (no dependencies)
  await prisma.building.deleteMany({
    where: { buildingCode: { startsWith: PREFIX } },
  });
}
```

### Test Fixtures

**File**: `__tests__/fixtures/users.ts`

```typescript
import { User } from "@prisma/client";

export const mockAdminUser: User = {
  id: "admin-id",
  name: "Admin User",
  email: "admin@test.com",
  passwordHash: "hashed-password",
  phoneNumber: "1234567890",
  role: "ADMIN",
  status: "APPROVED",
  userType: "OWNER",
  buildingId: "building-a",
  flatId: "flat-101",
  profileImageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  approvedBy: null,
  approvedAt: new Date(),
  isProfilePublic: true,
};

export const mockOwnerUser: User = {
  // ... similar structure
};
```

---

## Testing Patterns & Best Practices

### 1. Test Isolation

✅ **Do**:
```typescript
test.beforeAll(async () => {
  await cleanupTestData();  // Always cleanup first
  await seedTestData();
});

test.afterAll(async () => {
  await cleanupTestData();  // Always cleanup after
  await prisma.$disconnect();
});
```

❌ **Don't**:
```typescript
// Relying on external data
test("should find user", async () => {
  const user = await prisma.user.findFirst(); // ❌ Assumes data exists
});
```

### 2. Unique Test Data

✅ **Do**:
```typescript
const PREFIX = "E2E_MYTEST_";
const email = PREFIX + "user@test.com";
const buildingCode = PREFIX + "B1";
```

❌ **Don't**:
```typescript
const email = "test@test.com";  // ❌ Will conflict with other tests
```

### 3. Explicit Waits

✅ **Do**:
```typescript
await page.click('button[type="submit"]');
await page.waitForURL("**/dashboard", { timeout: 10000 });
await expect(page).toHaveURL(/.*dashboard/);
```

❌ **Don't**:
```typescript
await page.click('button[type="submit"]');
// ❌ Hope it navigated
```

### 4. Descriptive Test Names

✅ **Do**:
```typescript
test("LOGIN-001: Valid credentials - Redirect to dashboard", async ({ page }) => {});
```

❌ **Don't**:
```typescript
test("login works", async ({ page }) => {});
```

### 5. Page Object Pattern (Advanced)

```typescript
// __tests__/helpers/pages/LoginPage.ts
class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async expectError(message: string) {
    await expect(this.page.locator(`text=${message}`)).toBeVisible();
  }
}

// Usage in test
test("login with invalid password", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("test@test.com", "wrong");
  await loginPage.expectError("Invalid credentials");
});
```

---

## Running Tests

### Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test __tests__/e2e/login.spec.ts

# Run tests matching pattern
npx playwright test -g "LOGIN"

# Run with UI mode (interactive)
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode (pause on failure)
npx playwright test --debug

# Run unit tests (Vitest)
npm run test:unit

# Run unit tests in watch mode
npm run test

# Run with coverage
npm run test:coverage

# View coverage report
npx vitest --coverage
```

### Environment Setup

**Test Database**:
```env
# .env.test
DATABASE_URL=postgresql://user:pass@localhost:5432/test_db
NEXTAUTH_SECRET=test-secret
NEXTAUTH_URL=http://localhost:3000
```

**Start Test Server**:
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run tests
npm run test:e2e
```

---

## Coverage Reports

### Vitest Coverage

**Generate Report**:
```bash
npm run test:coverage
```

**Output**:
```
coverage/
├── index.html          # Interactive HTML report
├── lcov.info          # LCOV format (for CI)
├── coverage-final.json # Raw coverage data
└── ...
```

**View Report**:
```bash
# Open in browser
open coverage/index.html
```

### Coverage Thresholds

```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
}
```

If coverage falls below threshold, the build will fail.

### Playwright Test Report

**Generate Report**:
```bash
npx playwright test --reporter=html
```

**View Report**:
```bash
npx playwright show-report
```

**Report Contents**:
- Test results summary
- Screenshots of failures
- Video recordings
- Trace files for debugging

---

## CI/CD Integration

### GitHub Actions Workflow

**File**: `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db
      
      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db
      
      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db
          NEXTAUTH_SECRET: test-secret
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db
          NEXTAUTH_SECRET: test-secret
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Running Tests in CI

1. **On Pull Request**: All tests run
2. **On Merge to Main**: Full test suite + deployment
3. **Scheduled**: Nightly full test run

---

## Debugging Failed Tests

### Playwright Debugging Tools

#### 1. HTML Report

```bash
npx playwright show-report
```

Shows:
- Test results
- Error messages
- Screenshots
- Videos
- Network logs

#### 2. Trace Viewer

```bash
# Generate trace (auto-enabled in config)
npx playwright test --trace on

# View trace
npx playwright show-trace playwright-results/trace.zip
```

Trace viewer provides:
- Step-by-step timeline
- Network requests
- DOM snapshots
- Console logs
- Screenshots at each step

#### 3. Debug Mode

```bash
npx playwright test --debug
```

Opens Playwright Inspector:
- Step through test line by line
- Pause and resume execution
- Inspect elements
- Try locators

#### 4. Headed Mode

```bash
npx playwright test --headed
```

See the browser as tests run.

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Timeout error | Element not found | Check selector, increase timeout |
| Building not in dropdown | `isActiveForRegistration: false` | Set to `true` in seed |
| Login fails after registration | Status is PENDING | Set status to APPROVED |
| Unique constraint error | Data not cleaned up | Check cleanup order |
| Flaky test | Race condition | Add explicit waits |
| Database connection error | Wrong connection string | Check .env.test |

### Debug Checklist

When a test fails:

1. ✅ Check the error message
2. ✅ View the screenshot (playwright-results/)
3. ✅ Watch the video recording
4. ✅ Open the trace viewer
5. ✅ Verify test data exists (use Prisma Studio)
6. ✅ Check database cleanup
7. ✅ Re-run test in headed mode
8. ✅ Add console.log for debugging
9. ✅ Check for unique prefix conflicts

### Prisma Studio (Database Inspection)

```bash
npx prisma studio
```

Opens GUI to:
- View all database records
- Verify test data
- Manually clean up data

---

## Test Maintenance

### Adding New Tests

1. **Create Test File**:
   ```bash
   touch __tests__/e2e/my-feature.spec.ts
   ```

2. **Define Unique Prefix**:
   ```typescript
   const PREFIX = "E2E_MYFEATURE_";
   ```

3. **Implement beforeAll/afterAll**:
   ```typescript
   test.beforeAll(async () => {
     await cleanupTestData();
     await seedTestData();
   });
   
   test.afterAll(async () => {
     await cleanupTestData();
     await prisma.$disconnect();
   });
   ```

4. **Write Test Cases**:
   Follow naming: `FEATURE-001: Description`

5. **Run and Verify**:
   ```bash
   npx playwright test my-feature.spec.ts
   ```

### Updating Existing Tests

1. Update test according to new behavior
2. Update seed data if schema changed
3. Run test to verify
4. Update documentation if test ID changes

### Test Review Checklist

Before committing:
- [ ] Test has unique PREFIX
- [ ] beforeAll cleans and seeds data
- [ ] afterAll cleans data
- [ ] All assertions use await
- [ ] Test names follow convention
- [ ] No hardcoded waits (use waitFor)
- [ ] Test passes locally
- [ ] Cleanup order is correct

---

## Summary

### Current Status

- **Total E2E Tests**: 23 files, ~300 test cases
- **Coverage**: 100% of critical user journeys
- **Test Execution Time**: ~15-20 minutes (full suite)
- **Pass Rate**: 95%+ (target: 100%)

### Testing Strengths

✅ Comprehensive E2E coverage  
✅ Isolated test data (unique prefixes)  
✅ Proper cleanup strategies  
✅ Video/trace/screenshot debugging  
✅ CI/CD integration ready  
✅ Well-documented patterns

### Future Improvements

- [ ] Add unit tests for server actions (target: 50 files)
- [ ] Add integration tests for API routes
- [ ] Increase code coverage to 85%
- [ ] Add visual regression tests
- [ ] Performance testing (Lighthouse CI)
- [ ] Accessibility testing (axe-core)
- [ ] Load testing (k6)

---

**Document Version**: 1.0  
**Test Framework Version**: Playwright 1.57.0 + Vitest 4.0.17  
**Last Test Run**: January 18, 2026  
**Next Review**: February 2026
