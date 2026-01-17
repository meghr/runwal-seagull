# Runwal Seagull - Comprehensive Test Plan

**Version**: 1.0  
**Created**: January 14, 2026  
**Target Code Coverage**: 85%  

---

## 📋 Table of Contents

1. [Test Framework Setup](#1-test-framework-setup)
2. [Test Categories & Strategy](#2-test-categories--strategy)
3. [Test Data Management](#3-test-data-management)
4. [Phase-wise Test Scenarios](#4-phase-wise-test-scenarios)
5. [End-to-End Test Flows](#5-end-to-end-test-flows)
6. [Code Coverage Requirements](#6-code-coverage-requirements)
7. [Test Execution Plan](#7-test-execution-plan)

---

## 1. Test Framework Setup

### 1.1 Testing Stack

| Tool | Purpose | Version |
|------|---------|---------|
| **Vitest** | Unit & Integration Testing | Latest |
| **React Testing Library** | Component Testing | Latest |
| **Playwright** | E2E Browser Testing | Latest |
| **MSW (Mock Service Worker)** | API Mocking | Latest |
| **Prisma Test Environment** | Database Testing with Isolation | - |
| **@faker-js/faker** | Test Data Generation | Latest |
| **c8 / istanbul** | Code Coverage Reporting | Latest |

### 1.2 Directory Structure

```
runwal-seagull/
├── __tests__/
│   ├── unit/                         # Unit tests
│   │   ├── lib/
│   │   │   ├── actions/              # Server action tests
│   │   │   ├── validations/          # Zod schema tests
│   │   │   └── utils/                # Utility function tests
│   │   └── components/               # Component unit tests
│   │
│   ├── integration/                  # Integration tests
│   │   ├── api/                      # API endpoint tests
│   │   ├── database/                 # Database operation tests
│   │   └── auth/                     # Authentication flow tests
│   │
│   ├── e2e/                          # End-to-end tests
│   │   ├── flows/                    # User journey tests
│   │   ├── pages/                    # Page-level tests
│   │   └── admin/                    # Admin flow tests
│   │
│   ├── fixtures/                     # Test fixtures & data
│   │   ├── users.ts
│   │   ├── buildings.ts
│   │   ├── events.ts
│   │   ├── notices.ts
│   │   └── index.ts
│   │
│   ├── mocks/                        # Mock implementations
│   │   ├── handlers.ts               # MSW handlers
│   │   ├── prisma.ts                 # Prisma mock
│   │   └── auth.ts                   # Auth mock
│   │
│   ├── helpers/                      # Test utilities
│   │   ├── test-utils.tsx            # Custom render with providers
│   │   ├── db-utils.ts               # Database helpers
│   │   └── auth-utils.ts             # Auth helpers
│   │
│   └── setup/
│       ├── vitest.setup.ts           # Vitest global setup
│       ├── playwright.setup.ts       # Playwright setup
│       └── test-database.ts          # Test DB setup/teardown
│
├── vitest.config.ts
├── playwright.config.ts
└── coverage/                         # Generated coverage reports
```

### 1.3 Configuration Files Required

1. `vitest.config.ts` - Unit/Integration test configuration
2. `playwright.config.ts` - E2E test configuration
3. `vitest.setup.ts` - Global test setup
4. `.env.test` - Test environment variables

---

## 2. Test Categories & Strategy

### 2.1 Test Pyramid

```
         /\
        /  \     E2E Tests (10%)
       /----\    - Critical user journeys
      /      \   - Happy path flows
     /--------\  
    /          \ Integration Tests (30%)
   /            \- API endpoints
  /--------------\- Database operations
 /                \- Auth flows
/------------------\
        Unit Tests (60%)
        - Server actions
        - Components
        - Utilities
        - Validations
```

### 2.2 Testing Levels

| Level | Scope | Tools | Isolation |
|-------|-------|-------|-----------|
| **Unit** | Functions, Components | Vitest, RTL | Mocked dependencies |
| **Integration** | Multi-component, API | Vitest, Prisma | Test database |
| **E2E** | Full user flows | Playwright | Staging environment |

### 2.3 Test Naming Convention

```
describe('[Module] - [Feature]', () => {
  describe('[Scenario]', () => {
    it('should [expected behavior] when [condition]', () => {})
  })
})
```

---

## 3. Test Data Management

### 3.1 Test Data Strategy

| Strategy | Use Case | Implementation |
|----------|----------|----------------|
| **Fixtures** | Static reference data | JSON/TS files in `fixtures/` |
| **Factories** | Dynamic test data | Factory functions with Faker |
| **Seeds** | Database seeding | Prisma seed scripts |
| **Cleanup** | Post-test cleanup | Transaction rollback / deleteMany |

### 3.2 Test Database Isolation

```typescript
// Strategy: Transaction-based isolation
// Each test runs in a transaction that is rolled back after completion

beforeEach(async () => {
  // Start transaction
  await prisma.$executeRaw`BEGIN`;
});

afterEach(async () => {
  // Rollback transaction
  await prisma.$executeRaw`ROLLBACK`;
});
```

### 3.3 Test Data Fixtures

#### 3.3.1 Users Fixture

| User Type | Email | Password | Role | Status | Building | Flat |
|-----------|-------|----------|------|--------|----------|------|
| Admin User | admin@test.com | Test@123 | ADMIN | APPROVED | A | 101 |
| Owner User | owner@test.com | Test@123 | OWNER | APPROVED | A | 102 |
| Tenant User | tenant@test.com | Test@123 | TENANT | APPROVED | B | 201 |
| Pending User | pending@test.com | Test@123 | PUBLIC | PENDING | A | 103 |
| Suspended User | suspended@test.com | Test@123 | OWNER | SUSPENDED | B | 202 |
| Rejected User | rejected@test.com | Test@123 | PUBLIC | REJECTED | - | - |

#### 3.3.2 Buildings Fixture

| Building Name | Code | Total Floors | Description |
|---------------|------|--------------|-------------|
| Building A | A | 10 | Test Building A |
| Building B | B | 8 | Test Building B |
| Building C | C | 12 | Test Building C |

#### 3.3.3 Flats Fixture

| Building | Flat Number | Floor | BHK Type | Owner | Tenant |
|----------|-------------|-------|----------|-------|--------|
| A | 101 | 1 | 2BHK | Admin User | - |
| A | 102 | 1 | 3BHK | Owner User | - |
| A | 103 | 1 | 2BHK | - | - |
| B | 201 | 2 | 2BHK | - | Tenant User |
| B | 202 | 2 | 3BHK | Suspended User | - |

#### 3.3.4 Events Fixture

| Event | Type | Status | Registration | Max | Start Date |
|-------|------|--------|--------------|-----|------------|
| Diwali Celebration | FESTIVAL | Published | Open | 100 | Future |
| Cricket Tournament | SPORTS | Published | Closed | 50 | Past |
| AGM Meeting | MEETING | Draft | Not Started | - | Future |
| Holi Event | FESTIVAL | Published | Not Started | 200 | Future |
| Yoga Camp | SOCIAL | Published | Open | 30 | Future |

#### 3.3.5 Notices Fixture

| Notice | Type | Visibility | Published |
|--------|------|------------|-----------|
| Maintenance Notice | MAINTENANCE | PUBLIC | Yes |
| Urgent Water Supply | URGENT | PUBLIC | Yes |
| AGM Announcement | GENERAL | REGISTERED | Yes |
| Draft Notice | GENERAL | REGISTERED | No |
| Admin Only Notice | GENERAL | ADMIN | Yes |

#### 3.3.6 Vehicles Fixture

| User | Vehicle Number | Type | Brand | Color |
|------|----------------|------|-------|-------|
| Owner User | MH01AB1234 | CAR | Honda | White |
| Owner User | MH01CD5678 | BIKE | Royal Enfield | Black |
| Tenant User | MH02EF9012 | SCOOTER | Honda | Blue |

### 3.4 Data Cleanup Strategy

```typescript
// Cleanup order (respecting foreign key constraints)
async function cleanupTestData() {
  await prisma.activityLog.deleteMany({ where: { /* test data filter */ } });
  await prisma.eventRegistration.deleteMany({ where: { /* test data filter */ } });
  await prisma.vehicle.deleteMany({ where: { /* test data filter */ } });
  await prisma.event.deleteMany({ where: { /* test data filter */ } });
  await prisma.notice.deleteMany({ where: { /* test data filter */ } });
  await prisma.user.deleteMany({ where: { email: { contains: '@test.com' } } });
  await prisma.flat.deleteMany({ where: { /* test data filter */ } });
  await prisma.building.deleteMany({ where: { buildingCode: { in: ['A', 'B', 'C'] } } });
}
```

---

## 4. Phase-wise Test Scenarios

### 4.1 Phase 1: Foundation & Infrastructure

#### 4.1.1 Database Connection Tests

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| DB-001 | Connection establishment | Connect to database | Connection successful |
| DB-002 | Schema validation | Run Prisma validation | No schema errors |
| DB-003 | Migration status | Check migration history | All migrations applied |

#### 4.1.2 Environment Configuration Tests

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| ENV-001 | Required env vars present | Check all required vars | All present |
| ENV-002 | Database URL valid | Parse DATABASE_URL | Valid connection string |
| ENV-003 | Auth secret configured | Check NEXTAUTH_SECRET | Present and valid length |

---

### 4.2 Phase 2: Authentication & User Management

#### 4.2.1 User Registration Tests

| Test ID | Scenario | Preconditions | Steps | Expected Result | Cleanup |
|---------|----------|---------------|-------|-----------------|---------|
| REG-001 | Successful registration | Buildings exist | Fill valid form, submit | User created with PENDING status | Delete user |
| REG-002 | Duplicate email | Existing user | Register with same email | Error: Email exists | None |
| REG-003 | Invalid email format | None | Enter invalid email | Validation error | None |
| REG-004 | Password too weak | None | Enter weak password | Validation error | None |
| REG-005 | Missing required fields | None | Submit empty form | Validation errors | None |
| REG-006 | Building selection | Buildings exist | Select building | Flats dropdown populated | None |
| REG-007 | Flat selection | Building selected | Select flat | Flat assigned to form | None |
| REG-008 | User type selection | None | Select Owner/Tenant | Type saved correctly | Delete user |

#### 4.2.2 Login Tests

| Test ID | Scenario | Preconditions | Steps | Expected Result | Cleanup |
|---------|----------|---------------|-------|-----------------|---------|
| LOGIN-001 | Valid credentials | Approved user exists | Enter valid creds | Login successful, redirect to dashboard | None |
| LOGIN-002 | Invalid password | User exists | Enter wrong password | Error: Invalid credentials | None |
| LOGIN-003 | Non-existent user | None | Enter unknown email | Error: User not found | None |
| LOGIN-004 | Pending user login | Pending user exists | Attempt login | Error: Account pending approval | None |
| LOGIN-005 | Suspended user login | Suspended user exists | Attempt login | Error: Account suspended | None |
| LOGIN-006 | Session persistence | Logged in user | Refresh page | Session maintained | None |
| LOGIN-007 | Logout | Logged in user | Click logout | Session cleared, redirected | None |

#### 4.2.3 Admin Approval Tests

| Test ID | Scenario | Preconditions | Steps | Expected Result | Cleanup |
|---------|----------|---------------|-------|-----------------|---------|
| APPR-001 | View pending users | Pending users exist | Navigate to admin users | List shows pending users | None |
| APPR-002 | Approve user | Pending user exists | Click approve | Status → APPROVED | Reset status |
| APPR-003 | Reject user | Pending user exists | Click reject | Status → REJECTED | Reset status |
| APPR-004 | Non-admin access | Regular user logged in | Navigate to /admin | Redirect to dashboard | None |
| APPR-005 | Approval with reason | Pending user exists | Approve with note | User approved, log created | Reset status |

#### 4.2.4 Profile Management Tests 

| Test ID | Scenario | Preconditions | Steps | Expected Result | Cleanup |
|---------|----------|---------------|-------|-----------------|---------|
| PROF-001 | View profile | User logged in | Navigate to profile | Profile data displayed | None |
| PROF-002 | Update name | User logged in | Change name, save | Name updated | Revert |
| PROF-003 | Update phone | User logged in | Change phone, save | Phone updated | Revert |
| PROF-004 | Upload profile image | User logged in | Upload image | Image URL saved | Remove image |
| PROF-005 | Invalid phone format | User logged in | Enter invalid phone | Validation error | None |
| PROF-006 | Empty name | User logged in | Clear name, save | Validation error | None |

---

### 4.3 Phase 3: Public Pages

#### 4.3.1 Landing Page Tests

| Test ID | Scenario | Preconditions | Steps | Expected Result |
|---------|----------|---------------|-------|-----------------|
| LAND-001 | Page loads | None | Navigate to / | Hero section visible |
| LAND-002 | Public notices display | Published notices exist | Check notices section | Notices shown |
| LAND-003 | Public events display | Published events exist | Check events section | Events shown |
| LAND-004 | Register CTA | Not logged in | Click Register | Navigate to /register |
| LAND-005 | Login CTA | Not logged in | Click Login | Navigate to /login |
| LAND-006 | Responsive layout | None | Resize to mobile | Layout adapts |

#### 4.3.2 Public Notices Tests

| Test ID | Scenario | Preconditions | Steps | Expected Result |
|---------|----------|---------------|-------|-----------------|
| PNOT-001 | Only PUBLIC visible | Mixed visibility notices | View notices | Only PUBLIC shown |
| PNOT-002 | Only published visible | Draft notices exist | View notices | Drafts not shown |
| PNOT-003 | Notice type badges | Different types exist | View notices | Correct color badges |
| PNOT-004 | Notice detail view | Notice exists | Click notice | Modal/detail opens |

#### 4.3.3 Public Events Tests

| Test ID | Scenario | Preconditions | Steps | Expected Result |
|---------|----------|---------------|-------|-----------------|
| PEVT-001 | Upcoming events shown | Future events exist | View events | Only future shown |
| PEVT-002 | Past events hidden | Past events exist | View events | Past events hidden |
| PEVT-003 | Event type icons | Different types exist | View events | Correct icons shown |
| PEVT-004 | Login to register CTA | Not logged in | View event | Shows "Login to Register" |

---

### 4.4 Phase 4: Registered User Features

#### 4.4.1 User Dashboard Tests

| Test ID | Scenario | Preconditions | Steps | Expected Result | Cleanup |
|---------|----------|---------------|-------|-----------------|---------|
| DASH-001 | Dashboard loads | User logged in | Navigate to /dashboard | Dashboard displays | None |
| DASH-002 | Welcome message | User logged in | View dashboard | Shows user's name | None |
| DASH-003 | Quick stats | Events/notices exist | View dashboard | Stats displayed | None |
| DASH-004 | Recent notices widget | Notices exist | View dashboard | Recent notices shown | None |
| DASH-005 | Upcoming events widget | Events exist | View dashboard | Events shown | None |
| DASH-006 | Unapproved user redirect | Pending user | Navigate to /dashboard | Redirect to pending page | None |

#### 4.4.2 Notice Board Tests

| Test ID | Scenario | Preconditions | Steps | Expected Result | Cleanup |
|---------|----------|---------------|-------|-----------------|---------|
| NOT-001 | View all notices | User logged in | Navigate to /notices | All REGISTERED+ visible | None |
| NOT-002 | Filter by type | Different types exist | Select type filter | Filtered results | None |
| NOT-003 | Search notices | Notices exist | Enter search term | Matching results | None |
| NOT-004 | Notice detail | Notice exists | Click notice | Detail page opens | None |
| NOT-005 | Attachment download | Notice with attachment | Click attachment | Download starts | None |
| NOT-006 | Pagination | >10 notices exist | Navigate pages | Correct pagination | None |

#### 4.4.3 Event Management Tests

| Test ID | Scenario | Preconditions | Steps | Expected Result | Cleanup |
|---------|----------|---------------|-------|-----------------|---------|
| EVT-001 | View all events | User logged in | Navigate to /events | Events list displayed | None |
| EVT-002 | Filter upcoming | Events exist | Filter by Upcoming | Only upcoming shown | None |
| EVT-003 | Filter past | Events exist | Filter by Past | Only past shown | None |
| EVT-004 | Registration open | Open event exists | View event | Register button active | None |
| EVT-005 | Registration closed | Closed event exists | View event | Register button disabled | None |
| EVT-006 | Individual registration | Individual event | Register | Registration created | Delete registration |
| EVT-007 | Team registration | Team event | Add members, register | Registration with team | Delete registration |
| EVT-008 | Max participants reached | Full event | Try to register | Error: Event full | None |
| EVT-009 | Duplicate registration | Already registered | Try again | Error: Already registered | None |
| EVT-010 | Cancel registration | Has registration | Cancel registration | Registration cancelled | Delete registration |
| EVT-011 | View my events | Has registrations | Navigate to My Events | Registrations shown | None |
| EVT-012 | Registration countdown | Event with dates | View event | Countdown displayed | None |

#### 4.4.4 Neighbor Directory Tests

| Test ID | Scenario | Preconditions | Steps | Expected Result | Cleanup |
|---------|----------|---------------|-------|-----------------|---------|
| NBR-001 | View directory | User logged in | Navigate to /neighbors | Directory loads | None |
| NBR-002 | Search by building | Users in building | Select building | Building users shown | None |
| NBR-003 | Search by flat | User in flat | Enter flat number | User found | None |
| NBR-004 | Privacy respected | User hidden profile | Search user | Not displayed | None |
| NBR-005 | Contact details shown | User visible | View user | Contact info shown | None |
| NBR-006 | Owner/Tenant badge | Both types exist | View directory | Correct badges | None |

#### 4.4.5 Vehicle Management Tests

| Test ID | Scenario | Preconditions | Steps | Expected Result | Cleanup |
|---------|----------|---------------|-------|-----------------|---------|
| VEH-001 | Search vehicle | Vehicles exist | Enter vehicle number | Owner details shown | None |
| VEH-002 | Vehicle not found | None | Enter unknown number | Not found message | None |
| VEH-003 | View my vehicles | User has vehicles | Navigate to My Vehicles | Vehicles listed | None |
| VEH-004 | Add vehicle | User logged in | Fill form, submit | Vehicle created | Delete vehicle |
| VEH-005 | Duplicate vehicle | Vehicle exists | Add same number | Error: Already exists | None |
| VEH-006 | Edit vehicle | Vehicle exists | Edit and save | Vehicle updated | Revert |
| VEH-007 | Delete vehicle | Vehicle exists | Click delete | Vehicle removed | Restore |
| VEH-008 | Invalid vehicle number | None | Enter invalid format | Validation error | None |

---

### 4.5 Phase 5: Admin Portal

#### 4.5.1 Admin Dashboard Tests

| Test ID | Scenario | Preconditions | Steps | Expected Result | Cleanup |
|---------|----------|---------------|-------|-----------------|---------|
| ADSH-001 | Dashboard loads | Admin logged in | Navigate to /admin | Dashboard displays | None |
| ADSH-002 | Stats accurate | Data exists | View stats | Correct counts | None |
| ADSH-003 | Recent registrations | Pending users exist | View widget | Users listed | None |
| ADSH-004 | Quick actions work | Admin logged in | Click Create Notice | Navigate to form | None |
| ADSH-005 | Activity feed | Activity exists | View feed | Recent activities | None |
| ADSH-006 | Non-admin denied | Regular user | Navigate to /admin | Access denied | None |

#### 4.5.2 Notice Management Tests (Admin)

| Test ID | Scenario | Preconditions | Steps | Expected Result | Cleanup |
|---------|----------|---------------|-------|-----------------|---------|
| ANOT-001 | View all notices | Admin logged in | Navigate to notices | All notices shown | None |
| ANOT-002 | Create notice | Admin logged in | Fill form, submit | Notice created | Delete notice |
| ANOT-003 | Rich text editor | Admin logged in | Format text | Formatting saved | Delete notice |
| ANOT-004 | Upload attachment | Admin logged in | Upload file | File attached | Delete notice |
| ANOT-005 | Save as draft | Admin logged in | Click Save Draft | Notice unpublished | Delete notice |
| ANOT-006 | Publish notice | Admin logged in | Click Publish | Notice published | Delete notice |
| ANOT-007 | Edit notice | Notice exists | Edit and save | Notice updated | Revert |
| ANOT-008 | Delete notice | Notice exists | Click delete | Notice removed | Restore |
| ANOT-009 | Set visibility | Admin logged in | Select visibility | Correct visibility | Delete notice |
| ANOT-010 | Set notice type | Admin logged in | Select type | Correct type | Delete notice |

#### 4.5.3 Event Management Tests (Admin)

| Test ID | Scenario | Preconditions | Steps | Expected Result | Cleanup |
|---------|----------|---------------|-------|-----------------|---------|
| AEVT-001 | View all events | Admin logged in | Navigate to events | All events shown | None |
| AEVT-002 | Create event | Admin logged in | Fill form, submit | Event created | Delete event |
| AEVT-003 | Set event dates | Admin logged in | Set start/end | Dates saved | Delete event |
| AEVT-004 | Set registration dates | Admin logged in | Set reg dates | Dates saved | Delete event |
| AEVT-005 | Set participation type | Admin logged in | Select Individual/Team | Type saved | Delete event |
| AEVT-006 | Set max participants | Admin logged in | Enter limit | Limit saved | Delete event |
| AEVT-007 | Upload event image | Admin logged in | Upload image | Image saved | Delete event |
| AEVT-008 | Save as draft | Admin logged in | Click Save Draft | Event unpublished | Delete event |
| AEVT-009 | Publish event | Admin logged in | Click Publish | Event published | Delete event |
| AEVT-010 | View registrations | Event with regs | Click View Regs | Registrations shown | None |
| AEVT-011 | Search registrations | Registrations exist | Search by name | Filtered results | None |
| AEVT-012 | Export CSV | Registrations exist | Click Export | CSV downloaded | None |
| AEVT-013 | Close registration | Open event | Click Close Reg | Registration closed | Revert |
| AEVT-014 | Cancel event | Published event | Cancel with reason | Event cancelled | Revert |
| AEVT-015 | Edit with registrations | Event with regs | Try to edit | Warning shown | None |
| AEVT-016 | Delete without regs | Event no regs | Click delete | Event deleted | Restore |
| AEVT-017 | Delete with regs | Event with regs | Click delete | Error: Has registrations | None |

#### 4.5.4 User Management Tests (Admin)

| Test ID | Scenario | Preconditions | Steps | Expected Result | Cleanup |
|---------|----------|---------------|-------|-----------------|---------|
| AUSR-001 | View all users | Admin logged in | Navigate to users | All users shown | None |
| AUSR-002 | Filter by role | Users exist | Select role filter | Filtered results | None |
| AUSR-003 | Filter by status | Users exist | Select status filter | Filtered results | None |
| AUSR-004 | Filter by building | Users exist | Select building | Filtered results | None |
| AUSR-005 | Search by name | Users exist | Enter name | Matching users | None |
| AUSR-006 | Search by email | Users exist | Enter email | Matching users | None |
| AUSR-007 | Search by flat | Users exist | Enter flat number | Matching users | None |
| AUSR-008 | View user details | User exists | Click View | Modal opens | None |
| AUSR-009 | Approve pending | Pending user | Click Approve | User approved | Revert |
| AUSR-010 | Suspend user | Approved user | Click Suspend | User suspended | Revert |
| AUSR-011 | Reactivate user | Suspended user | Click Reactivate | User approved | Revert |
| AUSR-012 | Make admin | Approved user | Click Make Admin | Role → ADMIN | Revert |
| AUSR-013 | Remove admin | Admin user | Click Remove Admin | Role reverted | Revert |
| AUSR-014 | Reset password | User exists | Click Reset | Temp password generated | None |
| AUSR-015 | View activity logs | User exists | Open Activity tab | Logs displayed | None |
| AUSR-016 | Export CSV | Users exist | Click Export | CSV downloaded | None |
| AUSR-017 | Self-suspend blocked | Admin logged in | Try to suspend self | Error: Cannot self-suspend | None |
| AUSR-018 | Self-demote blocked | Admin logged in | Try to remove own admin | Error: Cannot self-demote | None |

---

## 5. End-to-End Test Flows

### 5.1 New User Journey

```
Flow: E2E-001 - Complete New User Registration to Dashboard Access

1. Navigate to landing page (/)
2. Click "Register" button
3. Fill registration form:
   - Name: "Test User"
   - Email: "newuser@test.com"
   - Password: "Test@12345"
   - Select Building: "Building A"
   - Select Flat: "104"
   - Select Type: "Owner"
4. Submit form
5. Verify redirect to pending approval page
6. [Admin] Login as admin
7. [Admin] Navigate to user management
8. [Admin] Find pending user
9. [Admin] Approve user
10. [User] Login as new user
11. Verify redirect to dashboard
12. Verify welcome message shows correct name
13. Navigate to profile
14. Verify profile information correct

Cleanup: Delete test user, reset flat assignment
```

### 5.2 Event Registration Flow

```
Flow: E2E-002 - Complete Event Registration (Individual)

1. Login as approved user
2. Navigate to events page
3. Select an event with open registration
4. Click "Register" button
5. Confirm registration
6. Verify success message
7. Navigate to "My Events"
8. Verify registration appears
9. Return to event page
10. Verify registration status updated
11. Verify registration count updated

Cleanup: Delete registration
```

```
Flow: E2E-003 - Complete Event Registration (Team)

1. Login as approved user
2. Navigate to events page
3. Select a team event with open registration
4. Click "Register" button
5. Add team member 1 (Name, Phone)
6. Add team member 2 (Name, Phone)
7. Submit registration
8. Verify success message
9. Navigate to "My Events"
10. Verify registration with team details
11. [Admin] View registration dashboard
12. [Admin] Verify team members listed
13. [Admin] Export CSV
14. Verify CSV contains team data

Cleanup: Delete registration
```

### 5.3 Admin Event Management Flow

```
Flow: E2E-004 - Admin Creates and Manages Event

1. Login as admin
2. Navigate to admin events
3. Click "Create Event"
4. Fill event form:
   - Title: "Test Event"
   - Type: SPORTS
   - Start Date: future date
   - End Date: future date
   - Venue: "Sports Ground"
   - Enable Registration: Yes
   - Registration Start: today
   - Registration End: future
   - Participation Type: Team
   - Max Participants: 10
5. Upload event image
6. Save as Draft
7. Verify event in drafts
8. Edit event
9. Publish event
10. Verify event visible in public
11. [User] Register for event
12. [Admin] View registration dashboard
13. [Admin] Search registrations
14. [Admin] Close registration
15. [User] Verify cannot register anymore
16. [Admin] Cancel event with reason
17. Verify event no longer visible

Cleanup: Delete event and registrations
```

### 5.4 Admin User Management Flow

```
Flow: E2E-005 - Admin User Lifecycle Management

1. Create test user via registration
2. Login as admin
3. Navigate to user management
4. Verify user in pending list
5. View user details
6. Approve user
7. Verify status changed
8. Change role to Admin
9. Verify role changed
10. Remove admin role
11. Verify role reverted
12. Suspend user
13. [User] Attempt login - should fail
14. [Admin] Reactivate user
15. [User] Login successfully
16. [Admin] Reset password
17. Copy temporary password
18. [User] Login with temp password

Cleanup: Delete test user
```

Need to start these test in next round 

### 5.5 Vehicle Search Flow

```
Flow: E2E-006 - Vehicle Registration and Search

1. Login as user
2. Navigate to My Vehicles
3. Add new vehicle:
   - Number: MH01TEST123
   - Type: CAR
   - Brand: Test Brand
   - Model: Test Model
   - Color: Red
4. Verify vehicle in list
5. Edit vehicle color to Blue
6. Verify update saved
7. Navigate to vehicle search
8. Search for MH01TEST123
9. Verify owner details shown
10. Delete vehicle
11. Search again
12. Verify "Not Found"

Cleanup: Ensure vehicle deleted
```

### 5.6 Notice Workflow Flow

```
Flow: E2E-007 - Notice Creation to Public Display

1. Login as admin
2. Navigate to admin notices
3. Click "Create Notice"
4. Fill notice form:
   - Title: "Test Notice"
   - Content: Rich text content
   - Type: URGENT
   - Visibility: PUBLIC
5. Upload attachment (PDF)
6. Save as Draft
7. Verify in draft list
8. Edit notice
9. Publish notice
10. Logout
11. Visit landing page (not logged in)
12. Verify notice visible
13. Click notice for details
14. Verify attachment downloadable
15. Login as regular user
16. Navigate to notice board
17. Verify notice visible with correct type badge

Cleanup: Delete notice
```

---

## 6. Code Coverage Requirements

### 6.1 Coverage Targets by Module

| Module | Target | Priority |
|--------|--------|----------|
| **Server Actions** | 90% | Critical |
| **API Routes** | 85% | High |
| **Utility Functions** | 95% | High |
| **Zod Validations** | 100% | Critical |
| **React Components** | 80% | Medium |
| **Hooks** | 85% | High |
| **Pages** | 75% | Medium |

### 6.2 Critical Paths (Must Have 95%+)

1. Authentication flow (login, logout, session)
2. User registration and approval
3. Event registration logic
4. Role-based access control
5. Data validation schemas

### 6.3 Coverage Report Configuration

```javascript
// vitest.config.ts coverage settings
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  exclude: [
    'node_modules/',
    '__tests__/',
    '*.config.*',
    'src/lib/db.ts', // Database connection
    'prisma/',
  ],
  thresholds: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    // Per-file thresholds for critical files
    'src/lib/actions/*.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
}
```

---

## 7. Test Execution Plan

### 7.1 Test Run Order

1. **Pre-flight checks**
   - Database connection test
   - Environment validation
   - Seed test data

2. **Unit Tests**
   - Server actions
   - Validations
   - Utilities
   - Components

3. **Integration Tests**
   - API endpoints
   - Database operations
   - Auth flows

4. **E2E Tests**
   - Critical user journeys
   - Admin workflows

5. **Cleanup**
   - Remove test data
   - Reset database state

### 7.2 CI/CD Pipeline Integration

```yaml
# GitHub Actions workflow
test:
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:15
      env:
        POSTGRES_DB: test_db
        POSTGRES_USER: test_user
        POSTGRES_PASSWORD: test_pass
  
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npx prisma migrate deploy
    - run: npm run test:unit
    - run: npm run test:integration
    - run: npm run test:e2e
    - run: npm run coverage:report
```

### 7.3 Test Scripts (package.json)

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --config vitest.unit.config.ts",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "db:test:setup": "dotenv -e .env.test -- prisma migrate deploy",
    "db:test:seed": "dotenv -e .env.test -- ts-node prisma/seed-test.ts",
    "db:test:reset": "dotenv -e .env.test -- prisma migrate reset --force"
  }
}
```

### 7.4 Execution Timeline

| Phase | Duration | Dependency |
|-------|----------|------------|
| Framework Setup | 2 hours | None |
| Unit Tests | 8 hours | Framework |
| Integration Tests | 6 hours | Unit done |
| E2E Tests | 6 hours | Integration done |
| Coverage Optimization | 4 hours | All tests done |
| **Total** | **26 hours** | |

---

## 📝 Notes & Considerations

1. **Test Isolation**: Each test should be independent and not rely on state from other tests.

2. **Parallel Execution**: Unit and integration tests can run in parallel; E2E tests should run sequentially.

3. **Flaky Test Handling**: Retry failed tests up to 2 times before marking as failed.

4. **Screenshot on Failure**: E2E tests should capture screenshots on failure for debugging.

5. **Test Data Naming**: All test emails should use `@test.com` domain for easy identification and cleanup.

6. **Environment Separation**: Never run tests against production database.

7. **Mock External Services**: Cloudinary/Uploadthing should be mocked in unit/integration tests.

8. **Auth Mocking Strategy**: Use NextAuth test utilities or custom mock providers.

---

## ✅ Checklist Before Implementation

- [ ] Review test plan with team
- [ ] Finalize test data fixtures
- [ ] Set up test database
- [ ] Install testing dependencies
- [ ] Configure CI/CD pipeline
- [ ] Create test helper utilities
- [ ] Implement fixture factories
- [ ] Begin unit test implementation

---

*This test plan should be reviewed and updated as new features are added or requirements change.*
