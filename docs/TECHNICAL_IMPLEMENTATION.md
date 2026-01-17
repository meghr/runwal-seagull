# Runwal Seagull - Technical Implementation & Architecture

**Version**: 1.0  
**Last Updated**: January 18, 2026  
**Document Type**: Technical Architecture Document

---

## 📋 Table of Contents

1. [Technology Stack](#technology-stack)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure)
4. [Database Design](#database-design)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Design & Server Actions](#api-design--server-actions)
7. [Component Architecture](#component-architecture)
8. [State Management](#state-management)
9. [File Upload Strategy](#file-upload-strategy)
10. [Deployment Architecture](#deployment-architecture)
11. [Development Workflow](#development-workflow)
12. [Code Standards & Conventions](#code-standards--conventions)

---

## Technology Stack

### Core Framework

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Next.js** | 16.1.1 | Full-stack React framework | Server components, App Router, built-in API routes, optimal performance |
| **React** | 19.2.3 | UI library | Component-based architecture, virtual DOM, rich ecosystem |
| **TypeScript** | 5.x | Programming language | Type safety, better IDE support, fewer runtime errors |

### Styling & UI

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Tailwind CSS** | 4.x | Utility-first CSS framework | Rapid development, consistent design, small bundle size |
| **Radix UI** | Latest | Headless UI components | Accessibility, unstyled primitives, keyboard navigation |
| **Lucide React** | 0.562.0 | Icon library | Modern icons, tree-shakeable, React optimized |

### Database & ORM

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **PostgreSQL** | 15+ | Relational database | ACID compliance, complex queries, scalability |
| **Prisma** | 7.2.0 | ORM & Query Builder | Type-safe queries, migrations, great DX |
| **Supabase** | - | Database hosting | Free tier, connection pooling, backups |

### Authentication

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **NextAuth.js** | v5 beta | Authentication | Session management, providers, secure |
| **bcryptjs** | 3.0.3 | Password hashing | Industry standard, configurable rounds |

### File Management

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Cloudinary** | - | Image upload & CDN | Free tier, transformations, CDN delivery |
| **next-cloudinary** | 6.17.5 | Cloudinary React integration | Optimized images, upload widget |

### Testing

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Vitest** | 4.0.17 | Unit & Integration testing | Fast, Vite-powered, Jest-compatible API |
| **Playwright** | 1.57.0 | E2E testing | Cross-browser, reliable, debugging tools |
| **React Testing Library** | 16.3.1 | Component testing | User-centric, best practices |
| **MSW** | 2.12.7 | API mocking | Service worker-based, realistic |

### Development Tools

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **ESLint** | 9.x | Code linting | Enforce code quality, catch errors |
| **Prettier** | 3.7.4 | Code formatting | Consistent style, auto-format |
| **TypeScript ESLint** | Latest | TypeScript linting | Type-aware rules |

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Browser   │  │   Mobile    │  │  Tablet     │        │
│  │   (Chrome,  │  │  (Safari)   │  │  (iPad)     │        │
│  │   Firefox)  │  │             │  │             │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└─────────┼────────────────┼────────────────┼────────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
                    HTTPS (TLS 1.3)
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                   APPLICATION TIER                          │
│                  (Vercel Edge Network)                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │             Next.js App Router                     │    │
│  │  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │ Server       │  │ Client       │               │    │
│  │  │ Components   │  │ Components   │               │    │
│  │  └──────┬───────┘  └──────┬───────┘               │    │
│  │         │                 │                        │    │
│  │  ┌──────┴─────────────────┴───────┐               │    │
│  │  │     Server Actions API         │               │    │
│  │  │  (Form Actions, Data Fetching) │               │    │
│  │  └──────┬─────────────────────────┘               │    │
│  └─────────┼────────────────────────────────────────┘     │
│            │                                               │
│  ┌─────────┼────────────────────────────────────────┐     │
│  │         │    Middleware Layer                    │     │
│  │  ┌──────┴───────┐  ┌─────────────┐              │     │
│  │  │ Auth         │  │ CORS        │              │     │
│  │  │ Middleware   │  │ Rate Limit  │              │     │
│  │  └──────────────┘  └─────────────┘              │     │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────────┼──────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
┌─────────┴────┐  ┌───────┴──────┐  ┌────┴─────────┐
│   DATABASE   │  │  FILE STORE  │  │    EMAIL     │
│  PostgreSQL  │  │  Cloudinary  │  │   Resend     │
│  (Supabase)  │  │     (CDN)    │  │   (Future)   │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Request Flow

```
User Browser
    │
    ▼
[1] Next.js Router (App Router)
    │
    ▼
[2] Middleware (auth.ts)
    │
    ├─ Unauthenticated → Public Pages
    │
    └─ Authenticated → Check Session
                │
                ├─ Valid Session → Continue
                │
                └─ Invalid → Redirect to Login
    ▼
[3] Page Component (Server Component)
    │
    ├─ Static Data → Generated at build
    │
    └─ Dynamic Data → Server Actions
                │
                ▼
[4] Server Action (src/lib/actions/*.ts)
    │
    ├─ Validate Input (Zod)
    │
    ├─ Check Authorization
    │
    └─ Database Operation (Prisma)
                │
                ▼
[5] Prisma Client
    │
    ├─ Type-safe query
    │
    └─ Execute on PostgreSQL
                │
                ▼
[6] Return Response
    │
    ├─ Success → Revalidate Cache
    │
    └─ Error → Return Error Object
    ▼
[7] Render Updated UI
```

---

## Project Structure

### Directory Tree

```
runwal-seagull/
├── .agent/                      # AI agent configurations
│   ├── skills/                 # Skill definitions
│   │   ├── TESTING.MD         # Testing skill documentation
│   │   └── end-2-end-testing/ # E2E testing skill
│   └── workflows/             # Deployment workflows
│
├── __tests__/                  # All test files
│   ├── e2e/                   # End-to-end tests
│   │   ├── admin-users.spec.ts
│   │   ├── landing.spec.ts
│   │   ├── login.spec.ts
│   │   └── ... (23 test files)
│   │
│   ├── unit/                  # Unit tests
│   │   ├── api/
│   │   ├── components/
│   │   ├── foundation/
│   │   └── lib/
│   │
│   ├── integration/           # Integration tests
│   │
│   ├── fixtures/              # Test data fixtures
│   │   └── users.ts
│   │
│   ├── helpers/               # Test utilities
│   │   └── test-utils.tsx
│   │
│   ├── mocks/                 # Mock implementations
│   │   ├── handlers.ts        # MSW handlers
│   │   ├── server.ts          # MSW server
│   │   └── prisma.ts
│   │
│   └── setup/                 # Test configuration
│       ├── vitest.setup.ts
│       ├── playwright.global-setup.ts
│       └── prisma-mock.ts
│
├── docs/                       # Documentation (this folder)
│
├── node_modules/              # Dependencies
│
├── prisma/                    # Database schema
│   ├── schema.prisma         # Prisma schema
│   ├── migrations/           # Migration history
│   └── seed.ts               # Database seeding
│
├── public/                    # Static assets
│   ├── images/
│   └── favicon.ico
│
├── scripts/                   # Utility scripts
│   ├── nuke-test-data.ts    # Clean test data
│   └── check_notices.ts      # Data verification
│
├── src/                       # Source code
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/          # Auth routes group
│   │   │   ├── login/
│   │   │   └── register/
│   │   │
│   │   ├── admin/           # Admin portal
│   │   │   ├── buildings/
│   │   │   ├── events/
│   │   │   ├── flats/
│   │   │   ├── notices/
│   │   │   ├── users/
│   │   │   ├── page.tsx     # Admin dashboard
│   │   │   └── layout.tsx   # Admin layout
│   │   │
│   │   ├── dashboard/       # User dashboard
│   │   │   ├── events/
│   │   │   ├── neighbors/
│   │   │   ├── notices/
│   │   │   ├── profile/
│   │   │   ├── vehicles/
│   │   │   └── page.tsx
│   │   │
│   │   ├── api/             # API routes (future)
│   │   │
│   │   ├── page.tsx         # Landing page
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   │
│   ├── components/          # React components
│   │   ├── admin/          # Admin components
│   │   │   ├── AdminEventForm.tsx
│   │   │   ├── AdminNoticeForm.tsx
│   │   │   ├── UserManagementTable.tsx
│   │   │   └── ...
│   │   │
│   │   ├── dashboard/      # User components
│   │   │   ├── EventCard.tsx
│   │   │   ├── NoticeCard.tsx
│   │   │   ├── DashboardStats.tsx
│   │   │   └── ...
│   │   │
│   │   ├── forms/          # Form components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/         # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ...
│   │   │
│   │   ├── public/         # Public page components
│   │   │   ├── Hero.tsx
│   │   │   ├── PublicNotices.tsx
│   │   │   ├── PublicEvents.tsx
│   │   │   └── ...
│   │   │
│   │   └── ui/             # Reusable UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       └── ... (20+ components)
│   │
│   ├── lib/                # Utilities & logic
│   │   ├── actions/       # Server actions
│   │   │   ├── admin-dashboard.ts
│   │   │   ├── admin-event.ts
│   │   │   ├── admin-notice.ts
│   │   │   ├── admin-user.ts
│   │   │   ├── auth.ts
│   │   │   ├── building.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── event.ts
│   │   │   ├── flat.ts
│   │   │   ├── neighbor.ts
│   │   │   ├── notice.ts
│   │   │   ├── user.ts
│   │   │   └── vehicle.ts    (15 files total)
│   │   │
│   │   ├── auth/          # Authentication utilities
│   │   │
│   │   ├── db/            # Database utilities
│   │   │   └── db.ts      # Prisma client instance
│   │   │
│   │   ├── utils/         # Helper functions
│   │   │
│   │   ├── validations/   # Zod schemas
│   │   │   ├── auth.ts
│   │   │   ├── event.ts
│   │   │   ├── notice.ts
│   │   │   └── ...
│   │   │
│   │   └── utils.ts       # Utility functions (cn, etc.)
│   │
│   ├── types/             # TypeScript type definitions
│   │   └── next-auth.d.ts
│   │
│   ├── hooks/             # Custom React hooks
│   │
│   ├── auth.config.ts     # NextAuth configuration
│   ├── auth.ts            # NextAuth setup
│   └── middleware.ts      # Route middleware
│
├── .env                    # Environment variables (git-ignored)
├── .env.example           # Environment template
├── .env.local             # Local development
├── .env.test              # Test environment
│
├── .gitignore             # Git ignore rules
├── .prettierrc            # Prettier config
├── eslint.config.mjs      # ESLint config
│
├── components.json        # shadcn/ui config
├── next.config.ts         # Next.js config
├── playwright.config.ts   # Playwright config
├── postcss.config.mjs     # PostCSS config
├── tailwind.config.ts     # Tailwind config (future)
├── tsconfig.json          # TypeScript config
├── vitest.config.ts       # Vitest config
│
├── package.json           # Node dependencies
├── package-lock.json      # Locked dependencies
│
├── README.md              # Project README
├── TEST_PLAN.md           # Comprehensive test plan
└── DEPLOYMENT_PLAN.md     # Deployment guide
```

### Key Directories Explained

| Directory | Purpose | File Count |
|-----------|---------|------------|
| `src/app` | Next.js pages (App Router) | ~50 |
| `src/components` | React components | ~80 |
| `src/lib/actions` | Server actions (API layer) | 15 |
| `src/lib/validations` | Zod validation schemas | ~10 |
| `__tests__/e2e` | E2E test specs | 23 |
| `prisma/migrations` | Database migrations | ~20 |

---

## Database Design

### Schema Overview

The database consists of **14 interconnected tables** designed with proper normalization and foreign key relationships.

### Entity Relationship Diagram

```
┌──────────────┐
│   User       │
│──────────────│
│ id (PK)      │◀──────────┬───────────────┐
│ email        │           │               │
│ passwordHash │           │               │
│ name         │           │               │
│ role         │           │               │
│ status       │           │               │
│ buildingId(FK)│──┐       │               │
│ flatId (FK)  │──┼─┐     │               │
│ approvedBy(FK)│──┼─┼─────┘               │
└──────┬───────┘  │ │                      │
       │          │ │                      │
       │  ┌───────┘ │                      │
       │  │  ┌──────┘                      │
       │  │  │                             │
       │  ▼  ▼                             │
       │ ┌──────────────┐                 │
       │ │  Building    │                 │
       │ │──────────────│                 │
       │ │ id (PK)      │                 │
       │ │ name         │                 │
       │ │ buildingCode │                 │
       │ └──────┬───────┘                 │
       │        │                         │
       │        ▼                         │
       │ ┌──────────────┐                 │
       │ │    Flat      │                 │
       │ │──────────────│                 │
       │ │ id (PK)      │                 │
       └─│ buildingId(FK)│                 │
         │ flatNumber   │                 │
         │ ownerId (FK) │─────────────────┘
         │ tenantId (FK)│
         └──────────────┘

┌──────────────┐          ┌──────────────────┐
│   Notice     │          │     Event        │
│──────────────│          │──────────────────│
│ id (PK)      │          │ id (PK)          │
│ title        │          │ title            │
│ content      │          │ description      │
│ noticeType   │          │ eventType        │
│ visibility   │          │ startDate        │
│ published    │          │ endDate          │
│ createdBy(FK)│──┐       │ registrationDates│
└──────────────┘  │       │ maxParticipants  │
                  │       │ createdBy (FK)   │──┐
                  │       └─────┬────────────┘  │
                  │             │               │
                  │             ▼               │
                  │       ┌──────────────────┐  │
                  │       │EventRegistration │  │
                  │       │──────────────────│  │
                  │       │ id (PK)          │  │
                  │       │ eventId (FK)     │──┘
                  │       │ userId (FK)      │──┐
                  │       │ teamMembers      │  │
                  │       │ status           │  │
                  │       └──────────────────┘  │
                  │                             │
                  │       ┌──────────────────┐  │
                  └──────▶│      User        │◀─┘
                          └──────────────────┘

┌──────────────┐          ┌──────────────────┐
│   Vehicle    │          │  MarketplaceAd   │
│──────────────│          │──────────────────│
│ id (PK)      │          │ id (PK)          │
│ userId (FK)  │──┐       │ userId (FK)      │──┐
│ vehicleNumber│  │       │ category         │  │
│ vehicleType  │  │       │ title            │  │
│ brand        │  │       │ price            │  │
└──────────────┘  │       │ status           │  │
                  │       └──────────────────┘  │
                  │                             │
                  │       ┌──────────────────┐  │
                  │       │   Complaint      │  │
                  │       │──────────────────│  │
                  │       │ id (PK)          │  │
                  │       │ userId (FK)      │──┤
                  │       │ category         │  │
                  │       │ status           │  │
                  │       │ priority         │  │
                  │       │ assignedTo (FK)  │──┤
                  │       └─────┬────────────┘  │
                  │             │               │
                  │             ▼               │
                  │       ┌──────────────────┐  │
                  │       │ComplaintComment  │  │
                  │       │──────────────────│  │
                  │       │ id (PK)          │  │
                  │       │ complaintId (FK) │──┘
                  │       │ userId (FK)      │──┐
                  │       └──────────────────┘  │
                  │                             │
                  │       ┌──────────────────┐  │
                  └──────▶│      User        │◀─┘
                          └──────────────────┘
```

### Key Tables

#### 1. User Table

```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  phone_number VARCHAR(15),
  role ENUM('PUBLIC', 'OWNER', 'TENANT', 'ADMIN'),
  status ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'),
  building_id VARCHAR REFERENCES buildings(id),
  flat_id VARCHAR REFERENCES flats(id),
  user_type ENUM('OWNER', 'TENANT'),
  profile_image_url TEXT,
  is_profile_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  approved_by VARCHAR REFERENCES users(id),
  approved_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_building ON users(building_id);
```

**Design Decisions**:
- **UUID Primary Keys**: Better for distributed systems, security
- **Self-referencing** `approvedBy`: Track which admin approved
- **Composite Role**: `role` + `userType` provides flexibility
- **Status Enum**: Clear lifecycle states
- **Profile Privacy**: `isProfilePublic` toggle for directory

#### 2. Event & EventRegistration Tables

```sql
CREATE TABLE events (
  id VARCHAR PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_type ENUM('FESTIVAL', 'SPORTS', 'CULTURAL', 'MEETING', 'SOCIAL', 'OTHER'),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  venue VARCHAR(200),
  registration_required BOOLEAN DEFAULT false,
  registration_start_date TIMESTAMP,
  registration_end_date TIMESTAMP,
  participation_type ENUM('INDIVIDUAL', 'TEAM'),
  max_participants INTEGER,
  published BOOLEAN DEFAULT false,
  image_url TEXT,
  created_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  
  CONSTRAINT check_dates CHECK (end_date >= start_date)
);

CREATE TABLE event_registrations (
  id VARCHAR PRIMARY KEY,
  event_id VARCHAR REFERENCES events(id) ON DELETE CASCADE,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  team_members JSONB,  -- Array of team member objects
  additional_notes TEXT,
  registration_status ENUM('REGISTERED', 'WAITLIST', 'CANCELLED'),
  registered_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(event_id, user_id)  -- One registration per user per event
);
```

**Design Decisions**:
- **Cascade Delete**: Deleting event removes registrations
- **JSONB for team_members**: Flexible structure, PostgreSQL indexing
- **Unique Constraint**: Prevent duplicate registrations
- **Date Validation**: Check constraint ensures logical dates

#### 3. Notice Table

```sql
CREATE TABLE notices (
  id VARCHAR PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  notice_type ENUM('GENERAL', 'URGENT', 'MAINTENANCE', 'EVENT'),
  visibility ENUM('PUBLIC', 'REGISTERED', 'ADMIN') DEFAULT 'PUBLIC',
  published BOOLEAN DEFAULT false,
  attachment_urls JSONB,  -- Array of attachment objects
  created_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

CREATE INDEX idx_notices_visibility ON notices(visibility, published);
CREATE INDEX idx_notices_created_at ON notices(created_at DESC);
```

**Design Decisions**:
- **Three-tier visibility**: Granular access control
- **JSONB attachments**: Multiple files per notice
- **Draft/Publish**: `published` flag for workflow
- **Composite Index**: Optimize common query (visibility + published)

### Database Relationships

| From Table | To Table | Relationship | Cascade |
|------------|----------|--------------|---------|
| User | Building | Many-to-One | RESTRICT |
| User | Flat | Many-to-One | RESTRICT |
| User | User (approver) | Many-to-One | SET NULL |
| Flat | Building | Many-to-One | RESTRICT |
| Flat | User (owner) | Many-to-One | SET NULL |
| Event | User (creator) | Many-to-One | RESTRICT |
| EventRegistration | Event | Many-to-One | CASCADE |
| EventRegistration | User | Many-to-One | CASCADE |
| Notice | User (creator) | Many-to-One | RESTRICT |
| Vehicle | User | Many-to-One | CASCADE |

---

## Authentication & Authorization

### NextAuth.js v5 Configuration

**File**: `src/auth.ts`

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/db";
import { LoginSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // 1. Validate input
        const validatedFields = LoginSchema.safeParse(credentials);
        if (!validatedFields.success) return null;

        const { email, password } = validatedFields.data;

        // 2. Fetch user
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) return null;

        // 3. Verify status
        if (user.status !== "APPROVED") {
          throw new Error(
            user.status === "PENDING" 
              ? "Account pending approval" 
              : "Account suspended"
          );
        }

        // 4. Verify password
        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordsMatch) return null;

        // 5. Return user for session
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          buildingId: user.buildingId,
          flatId: user.flatId,
        };
      },
    }),
  ],
});
```

### Auth Configuration

**File**: `src/auth.config.ts`

```typescript
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      
      if (isOnDashboard || isOnAdmin) {
        if (isLoggedIn) {
          // Check admin access
          if (isOnAdmin && auth.user.role !== "ADMIN") {
            return Response.redirect(new URL("/dashboard", nextUrl));
          }
          return true;
        }
        return false; // Redirect to login
      }
      return true; // Public pages
    },
    
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.buildingId = user.buildingId;
        token.flatId = user.flatId;
      }
      return token;
    },
    
    session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.buildingId = token.buildingId;
        session.user.flatId = token.flatId;
      }
      return session;
    },
  },
  providers: [], // Providers added in auth.ts
};
```

### Middleware Protection

**File**: `src/middleware.ts`

```typescript
import { auth } from "@/auth";

export default auth((req) => {
  // Middleware logic runs via authConfig.callbacks.authorized
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### Authorization Patterns

#### 1. Route-level Protection

```typescript
// Automatic via middleware
// Protected routes: /dashboard/*, /admin/*
```

#### 2. Component-level Protection

```typescript
import { auth } from "@/auth";

export default async function ProtectedPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }
  
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  
  return <AdminContent />;
}
```

#### 3. Server Action Protection

```typescript
export async function deleteNotice(id: string) {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  
  if (session.user.role !== "ADMIN") {
    return { success: false, error: "Forbidden" };
  }
  
  // Proceed with deletion
  await prisma.notice.delete({ where: { id } });
  return { success: true };
}
```

---

## API Design & Server Actions

### Server Actions Pattern

All API logic is implemented using **Next.js Server Actions** instead of traditional REST API routes. This provides:
- Type-safe function calls
- Automatic serialization
- Direct database access
- No API route boilerplate

### File Organization

```
src/lib/actions/
├── admin-dashboard.ts    # Admin dashboard stats
├── admin-event.ts        # Admin event CRUD
├── admin-notice.ts       # Admin notice CRUD
├── admin-user.ts         # User management
├── auth.ts               # Authentication actions
├── building.ts           # Building operations
├── dashboard.ts          # User dashboard data
├── event.ts              # User event operations
├── flat.ts               # Flat operations
├── neighbor.ts           # Neighbor directory
├── notice.ts             # User notice viewing
├── user.ts               # User profile operations
└── vehicle.ts            # Vehicle CRUD
```

### Server Action Example

**File**: `src/lib/actions/event.ts`

```typescript
"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Register user for an event
 * @param data Event registration data
 * @returns Success response with registration details
 */
export async function registerForEvent(data: {
  eventId: string;
  teamMembers?: { name: string; email?: string; phone?: string }[];
  additionalNotes?: string;
}) {
  try {
    // 1. Authenticate
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const { eventId, teamMembers, additionalNotes } = data;

    // 2. Fetch event with validation
    const event = await prisma.event.findFirst({
      where: { id: eventId, published: true },
      include: { _count: { select: { registrations: true } } },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    // 3. Business logic validation
    if (!event.registrationRequired) {
      return { success: false, error: "This event does not require registration" };
    }

    const now = new Date();
    if (event.registrationStartDate && now < new Date(event.registrationStartDate)) {
      return { success: false, error: "Registration has not started yet" };
    }

    if (event.registrationEndDate && now > new Date(event.registrationEndDate)) {
      return { success: false, error: "Registration has closed" };
    }

    if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
      return { success: false, error: "This event is full" };
    }

    // 4. Check duplicate
    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: { eventId, userId: session.user.id },
    });

    if (existingRegistration) {
      return { success: false, error: "You are already registered for this event" };
    }

    // 5. Team event validation
    if (event.participationType === "TEAM" && (!teamMembers || teamMembers.length === 0)) {
      return { success: false, error: "Team members are required for this event" };
    }

    // 6. Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        userId: session.user.id,
        teamMembers: teamMembers || undefined,
        additionalNotes: additionalNotes || null,
        registrationStatus: "REGISTERED",
      },
      include: {
        event: {
          select: { title: true, startDate: true, venue: true },
        },
      },
    });

    // 7. Revalidate affected pages
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/events");
    revalidatePath("/dashboard/events/my-registrations");

    return {
      success: true,
      data: registration,
      message: `Successfully registered for ${event.title}!`,
    };
  } catch (error) {
    console.error("Error registering for event:", error);
    return { success: false, error: "Failed to register for event" };
  }
}
```

### Response Pattern

All server actions follow this consistent response pattern:

```typescript
type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
```

### Validation with Zod

**File**: `src/lib/validations/event.ts`

```typescript
import { z } from "zod";

export const EventRegistrationSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  teamMembers: z
    .array(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email").optional(),
        phone: z.string().min(10, "Phone must be at least 10 digits").optional(),
      })
    )
    .optional(),
  additionalNotes: z.string().max(500, "Notes too long").optional(),
});

export type EventRegistrationInput = z.infer<typeof EventRegistrationSchema>;
```

### Cache Revalidation Strategy

| Action | Revalidate Paths |
|--------|------------------|
| Create Notice | `/dashboard`, `/`, `/dashboard/notices` |
| Create Event | `/dashboard`, `/`, `/dashboard/events` |
| Event Registration | `/dashboard`, `/dashboard/events`, `/dashboard/events/my-registrations` |
| Approve User | `/admin/users`, `/admin` |
| Update Profile | `/dashboard/profile`, `/dashboard` |

---

## Component Architecture

### Component Hierarchy

```
App
├── Layout (Root)
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── UserMenu
│   │
│   ├── Body
│   │   ├── Public Pages
│   │   │   ├── LandingPage
│   │   │   │   ├── Hero
│   │   │   │   ├── Stats
│   │   │   │   ├── PublicNotices
│   │   │   │   ├── PublicEvents
│   │   │   │   └── Footer
│   │   │   │
│   │   │   ├── LoginPage
│   │   │   │   └── LoginForm
│   │   │   │
│   │   │   └── RegisterPage
│   │   │       └── RegisterForm
│   │   │
│   │   ├── Dashboard (User)
│   │   │   ├── DashboardLayout
│   │   │   │   ├── Sidebar
│   │   │   │   └── Content
│   │   │   │
│   │   │   ├── DashboardPage
│   │   │   │   ├── WelcomeCard
│   │   │   │   ├── QuickStats
│   │   │   │   ├── RecentNotices
│   │   │   │   └── UpcomingEvents
│   │   │   │
│   │   │   ├── EventsPage
│   │   │   │   ├── EventFilters
│   │   │   │   ├── EventList
│   │   │   │   │   └── EventCard
│   │   │   │   └── Pagination
│   │   │   │
│   │   │   ├── NoticesPage
│   │   │   │   ├── NoticeFilters
│   │   │   │   ├── NoticeList
│   │   │   │   │   └── NoticeCard
│   │   │   │   └── NoticeDetailModal
│   │   │   │
│   │   │   └── ... (other pages)
│   │   │
│   │   └── Admin
│   │       ├── AdminLayout
│   │       │   ├── AdminSidebar
│   │       │   └── Content
│   │       │
│   │       ├── AdminDashboard
│   │       │   ├── StatsOverview
│   │       │   ├── PendingApprovals
│   │       │   └── ActivityFeed
│   │       │
│   │       ├── UserManagement
│   │       │   ├── UserFilters
│   │       │   ├── UserTable
│   │       │   ├── UserDetailModal
│   │       │   └── UserActions
│   │       │
│   │       └── ... (other admin pages)
│   │
│   └── Footer
│
└── Providers
    ├── SessionProvider
    └── ToastProvider
```

### Component Patterns

#### 1. Server Components (Default)

```typescript
// src/app/dashboard/page.tsx
import { auth } from "@/auth";
import { getDashboardData } from "@/lib/actions/dashboard";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";

export default async function DashboardPage() {
  const session = await auth();
  const dashboardData = await getDashboardData();

  return (
    <div className="container mx-auto py-8">
      <WelcomeCard user={session.user} />
      {/* ... more components */}
    </div>
  );
}
```

#### 2. Client Components (Interactive)

```typescript
"use client";

import { useState } from "react";
import { registerForEvent } from "@/lib/actions/event";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function EventRegistrationButton({ eventId }: { eventId: string; }) {
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    const result = await registerForEvent({ eventId });
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Button onClick={handleRegister} disabled={loading}>
      {loading ? "Registering..." : "Register"}
    </Button>
  );
}
```

#### 3. Form Components with Server Actions

```typescript
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createNotice } from "@/lib/actions/admin-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>
    {pending ? "Creating..." : "Create Notice"}
  </Button>;
}

export function CreateNoticeForm() {
  const [state, formAction] = useFormState(createNotice, null);

  return (
    <form action={formAction} className="space-y-4">
      <Input name="title" placeholder="Notice Title" required />
      <textarea name="content" placeholder="Notice Content" required />
      {/* ... more fields */}
      <SubmitButton />
      {state?.error && <p className="text-red-500">{state.error}</p>}
    </form>
  );
}
```

### Reusable UI Components (shadcn/ui based)

Located in `src/components/ui/`:

- `button.tsx` - Button with variants (default, outline, ghost, destructive)
- `card.tsx` - Card container with header/content/footer
- `dialog.tsx` - Modal dialog
- `input.tsx` - Form input
- `select.tsx` - Dropdown select (Radix UI)
- `table.tsx` - Data table
- `badge.tsx` - Status badges
- `avatar.tsx` - User avatar
- ... (20+ components)

All components use **Tailwind CSS** for styling and follow consistent patterns.

---

## State Management

### Approach

The application uses **Server-Driven State** with minimal client-side state:

1. **Server State**: Managed by Next.js (Server Components + Server Actions)
2. **Form State**: React 19 `useFormState` and `useFormStatus`
3. **UI State**: Local `useState` for interactive components
4. **URL State**: Search params for filters, pagination

### No Global State Library

- **Why**: Server Components provide built-in data fetching
- **Benefits**: Less complexity, better performance, automatic caching
- **Trade-off**: More network requests (mitigated by Next.js caching)

### Data Flow

```
User Action → Server Action → Database → Revalidate → Re-render
```

Example:
```
Click "Approve User" → approveUser() → Prisma Update → 
Revalidate /admin/users → Page Re-fetches → Updated UI
```

---

## File Upload Strategy

### Cloudinary Integration

**Service**: Cloudinary  
**Free Tier**: 25GB storage, 25K transformations/month

### Upload Flow

```
User Selects File 
    ↓
Client-side Upload Widget (next-cloudinary)
    ↓
Direct Upload to Cloudinary (bypassing server)
    ↓
Cloudinary Returns Image URL
    ↓
Client Saves URL in Form
    ↓
Server Action Stores URL in Database
```

### Implementation

```typescript
"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";

export function ImageUploader({ onUpload }: { onUpload: (url: string) => void }) {
  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      onSuccess={(result, { widget }) => {
        if (typeof result.info === "object") {
          onUpload(result.info.secure_url);
        }
        widget.close();
      }}
    >
      {({ open }) => (
        <button onClick={() => open()}>
          Upload Image
        </button>
      )}
    </CldUploadWidget>
  );
}
```

### Configuration

**Environment Variables**:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=runwal-seagull
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=society_uploads
CLOUDINARY_API_KEY=***
CLOUDINARY_API_SECRET=***
```

**Cloudinary Settings**:
- Unsigned upload preset (for client-side uploads)
- Folder: `runwal-seagull/`
- Allowed formats: `jpg, png, pdf, webp`
- Max file size: 10MB

---

## Deployment Architecture

### Production Stack

| Component | Service | Tier | Cost |
|-----------|---------|------|------|
| **Hosting** | Vercel | Hobby | Free |
| **Database** | Supabase PostgreSQL | Free | $0 |
| **File Storage** | Cloudinary | Free | $0 |
| **Domain** | Custom (optional) | - | ~$10/year |
| **Email** | Resend (future) | Free | $0 |

### Vercel Configuration

**Build Settings**:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

**Environment Variables** (Production):
```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://runwal-seagull.vercel.app
NEXTAUTH_SECRET=<generated-secret>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Database Migrations

**Development**:
```bash
npx prisma migrate dev --name migration_name
```

**Production**:
```bash
npx prisma migrate deploy
```

Migrations are auto-run on Vercel deploy via build script.

### CI/CD Pipeline

**Workflow**: GitHub Actions → Vercel

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run build
```

Auto-deployment:
- Push to `main` → Deploy to production
- Push to `develop` → Deploy to preview
- Pull requests → Deploy to preview URLs

---

## Development Workflow

### Local Development Setup

1. **Clone Repository**:
   ```bash
   git clone <repo-url>
   cd runwal-seagull
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Setup Environment**:
   ```bash
   cp .env.example .env.local
   # Fill in database URL, Cloudinary, etc.
   ```

4. **Database Setup**:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### Development Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run all Vitest tests (watch mode) |
| `npm run test:unit` | Run unit tests once |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:coverage` | Generate coverage report |

### Git Workflow

**Branches**:
- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

**Commit Convention**:
```
feat: Add user profile editing
fix: Resolve login redirect issue
docs: Update README
test: Add event registration tests
chore: Update dependencies
```

---

## Code Standards & Conventions

### TypeScript

- **Strict Mode**: Enabled
- **No `any`**: Use proper types
- **Interfaces over Types**: For object shapes
- **Enums**: For fixed sets of values

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase.tsx | `UserCard.tsx` |
| Pages | lowercase/page.tsx | `dashboard/page.tsx` |
| Server Actions | kebab-case.ts | `admin-user.ts` |
| Utils | kebab-case.ts | `date-utils.ts` |
| Types | kebab-case.ts | `user-types.ts` |

### Component Structure

```typescript
// 1. Imports (grouped)
import { type FC } from "react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

// 2. Types/Interfaces
interface UserCardProps {
  userId: string;
  showActions?: boolean;
}

// 3. Component
export const UserCard: FC<UserCardProps> = ({ userId, showActions = true }) => {
  // Component logic
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
};

// 4. Export default (if needed)
export default UserCard;
```

### CSS/Tailwind

- **Utility Classes**: Use Tailwind utilities
- **Custom Components**: Only when necessary
- **Responsive**: Mobile-first (`sm:`, `md:`, `lg:`)
- **Dark Mode**: Not implemented (future)

Example:
```tsx
<div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
  <h1 className="text-2xl font-bold text-gray-900 mb-4">Title</h1>
  <Card className="shadow-md">
    {/* Content */}
  </Card>
</div>
```

### Error Handling

**Server Actions**:
```typescript
try {
  const result = await prisma.user.create({ ... });
  return { success: true, data: result };
} catch (error) {
  console.error("Error creating user:", error);
  return { success: false, error: "Failed to create user" };
}
```

**Client Components**:
```typescript
const handleSubmit = async () => {
  const result = await createUser(data);
  if (result.success) {
    toast.success("User created!");
  } else {
    toast.error(result.error || "Something went wrong");
  }
};
```

---

## Performance Optimization

### Next.js Optimizations

1. **Static Generation**: Landing page pre-rendered
2. **Server Components**: Default, reduces JS bundle
3. **Image Optimization**: `next/image` component
4. **Code Splitting**: Automatic per route
5. **Lazy Loading**: Dynamic imports for heavy components

### Database Optimizations

1. **Indexes**: On frequently queried columns
2. **Connection Pooling**: Supabase connection pooler
3. **Pagination**: Limit results (default 20 per page)
4. **Select Specific Fields**: Avoid `select *`

### Caching Strategy

| Cache Type | Implementation | Duration |
|------------|----------------|----------|
| Static Pages | ISG (Incremental Static Generation) | 60s revalidate |
| Dynamic Pages | Server Components | Per-request |
| API Responses | `revalidatePath()` after mutations | Manual |
| Images | Cloudinary CDN | Permanent |

---

## Security Best Practices

### Authentication
- ✅ Bcrypt password hashing (12 rounds)
- ✅ HTTP-only cookies for sessions
- ✅ CSRF protection (NextAuth built-in)
- ✅ Session expiry (7 days default)

### Authorization
- ✅ Server-side permission checks
- ✅ Route middleware protection
- ✅ Role-based access control (RBAC)

### Data Protection
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection (React sanitization)
- ✅ File upload validation (Cloudinary)
- ✅ Environment variable security

### Future Security Enhancements
- [ ] Rate limiting (API routes)
- [ ] 2FA authentication
- [ ] Audit logging (admin actions)
- [ ] Data encryption at rest
- [ ] GDPR compliance

---

## Monitoring & Logging

### Current Implementation

**Server Logs**:
```typescript
console.log("Info message");
console.error("Error:", error);
```

**Vercel Logs**:
- Real-time function logs
- Build logs
- Error tracking

### Future Enhancements

- **Sentry**: Error tracking and performance monitoring
- **Vercel Analytics**: User behavior insights
- **Database Monitoring**: Supabase dashboard

---

## Conclusion

The Runwal Seagull Society Management Portal is built with modern web technologies emphasizing:
- **Type Safety**: TypeScript + Prisma
- **Performance**: Server Components + Edge deployment
- **Developer Experience**: Hot reload, type inference, auto-formatting
- **Scalability**: Serverless architecture + connection pooling
- **Maintainability**: Clean code structure + comprehensive tests

**Tech Stack Summary**:
- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **Backend**: Next.js Server Actions + Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Auth**: NextAuth.js v5
- **Testing**: Vitest + Playwright + React Testing Library
- **Deployment**: Vercel + Cloudinary
- **Total Lines of Code**: ~15,000+ lines

---

**Document Version**: 1.0  
**Last Reviewed**: January 18, 2026  
**Next Review**: February 2026
