---
description: Runwal Seagull Project - Development Guide and Reference
---

# Runwal Seagull Project Skill

This skill provides context and guidelines for working on the Runwal Seagull Society Management Portal project.

## Project Overview

**Name**: Runwal Seagull Society Management Portal  
**Type**: Full-stack web application  
**Purpose**: Comprehensive society management platform for residential communities  
**Tech Stack**: Next.js 16 + React 19 + TypeScript + PostgreSQL + Prisma

## Quick Reference

### Technology Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5.x
- **UI**: React 19.2.3
- **Styling**: Tailwind CSS 4.x
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 7.2.0
- **Auth**: NextAuth.js v5
- **File Upload**: Cloudinary
- **Testing**: Vitest 4.0.17 + Playwright 1.57.0

### Project Structure

```
src/
├── app/                  # Pages (App Router)
│   ├── admin/           # Admin portal
│   ├── dashboard/       # User dashboard
│   ├── login/           # Authentication
│   └── page.tsx         # Landing page
├── components/          # React components
│   ├── admin/          # Admin components
│   ├── dashboard/      # User components
│   ├── ui/             # Reusable UI (shadcn/ui)
│   └── forms/          # Form components
├── lib/                # Core logic
│   ├── actions/        # Server actions (API layer)
│   ├── validations/    # Zod schemas
│   └── db/             # Database utilities
└── types/              # TypeScript types
```

### Database Schema (14 Tables)

1. **User** - Authentication, profile, roles
2. **Building** - Society buildings
3. **Flat** - Individual units
4. **Notice** - Announcements
5. **Event** - Community events
6. **EventRegistration** - Event sign-ups
7. **Vehicle** - Vehicle registry
8. **MarketplaceAd** - Buy/sell listings
9. **Complaint** - Issue tracking
10. **ComplaintComment** - Complaint discussions
11. **ComplaintStatusHistory** - Audit trail
12. **YellowPage** - Service directory
13. **YellowPageReview** - Service ratings
14. **ActivityLog** - System audit logs

## Development Guidelines

### Adding New Features

#### 1. Database Changes

```bash
# Create migration
npx prisma migrate dev --name add_feature_name

# Generate Prisma client
npx prisma generate

# View database
npx prisma studio
```

#### 2. Server Actions (API Layer)

Create in `src/lib/actions/`:

```typescript
"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function myServerAction(data: MyInput) {
  try {
    // 1. Authenticate
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Validate input (Zod)
    const validated = MySchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: "Invalid input" };
    }

    // 3. Authorization check
    if (session.user.role !== "ADMIN") {
      return { success: false, error: "Forbidden" };
    }

    // 4. Database operation
    const result = await prisma.myTable.create({
      data: validated.data,
    });

    // 5. Revalidate affected paths
    revalidatePath("/dashboard");

    return { success: true, data: result };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: "Operation failed" };
  }
}
```

#### 3. Validation Schemas

Create in `src/lib/validations/`:

```typescript
import { z } from "zod";

export const MySchema = z.object({
  field1: z.string().min(1, "Required"),
  field2: z.number().positive(),
  field3: z.enum(["OPTION1", "OPTION2"]),
});

export type MyInput = z.infer<typeof MySchema>;
```

#### 4. Components

```typescript
"use client";  // If interactive

import { useState } from "react";
import { myServerAction } from "@/lib/actions/my-action";
import { Button } from "@/components/ui/button";

export function MyComponent() {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    const result = await myServerAction(data);
    setLoading(false);

    if (result.success) {
      // Handle success
    } else {
      // Handle error
    }
  };

  return (
    <div>
      <Button onClick={handleAction} disabled={loading}>
        {loading ? "Loading..." : "Submit"}
      </Button>
    </div>
  );
}
```

#### 5. Pages (App Router)

```typescript
// Server Component (default)
import { auth } from "@/auth";
import { getMyData } from "@/lib/actions/my-action";

export default async function MyPage() {
  const session = await auth();
  const data = await getMyData();

  return (
    <div>
      <h1>My Page</h1>
      {/* Render data */}
    </div>
  );
}
```

### User Roles & Permissions

| Role | Access Level | Permissions |
|------|--------------|-------------|
| **PUBLIC** | Unauthenticated | - View landing page<br>- View public notices/events<br>- Register account |
| **OWNER** | Registered user | - All PUBLIC permissions<br>- View registered content<br>- Register for events<br>- Manage vehicles<br>- Access neighbor directory |
| **TENANT** | Registered user | - Same as OWNER role |
| **ADMIN** | Administrator | - All user permissions<br>- Approve/reject users<br>- Create/manage notices<br>- Create/manage events<br>- Manage all data |

### Authentication Flow

1. User submits email/password
2. NextAuth validates via `src/auth.ts`
3. Password checked with bcrypt
4. User status verified (must be APPROVED)
5. Session created with user metadata
6. Redirect to dashboard or show error

**Protection**:
- Middleware: `src/middleware.ts` (route-level)
- Server Components: `auth()` check
- Server Actions: Session validation

### Common Patterns

#### Fetching Data (Server Component)

```typescript
import { prisma } from "@/lib/db";

export default async function Page() {
  const notices = await prisma.notice.findMany({
    where: { published: true, visibility: "PUBLIC" },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return <NoticeList notices={notices} />;
}
```

#### Form with Server Action

```typescript
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createNotice } from "@/lib/actions/admin-notice";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>Submit</button>;
}

export function MyForm() {
  const [state, action] = useFormState(createNotice, null);

  return (
    <form action={action}>
      <input name="title" required />
      <SubmitButton />
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
```

#### File Upload (Cloudinary)

```typescript
"use client";

import { CldUploadWidget } from "next-cloudinary";

export function ImageUpload({ onUpload }) {
  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      onSuccess={(result) => {
        onUpload(result.info.secure_url);
      }}
    >
      {({ open }) => <button onClick={open}>Upload</button>}
    </CldUploadWidget>
  );
}
```

## Environment Variables

Required variables (copy from `.env.example`):

```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Development Workflow

### Starting Development

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start dev server
npm run dev  # http://localhost:3000
```

### Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run test:e2e` | Run E2E tests |
| `npx prisma studio` | Database GUI |

### Code Standards

#### File Naming
- Components: `PascalCase.tsx`
- Server Actions: `kebab-case.ts`
- Pages: `lowercase/page.tsx`

#### Component Structure
```typescript
// 1. Imports
import { FC } from "react";

// 2. Types
interface MyProps {
  title: string;
}

// 3. Component
export const MyComponent: FC<MyProps> = ({ title }) => {
  return <div>{title}</div>;
};
```

#### Styling
- Use Tailwind utility classes
- Mobile-first responsive (`sm:`, `md:`, `lg:`)
- Reuse UI components from `src/components/ui/`

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check TypeScript errors, run `npm run build` |
| Database error | Verify `DATABASE_URL`, run `npx prisma migrate dev` |
| Auth not working | Check `NEXTAUTH_SECRET` and `NEXTAUTH_URL` |
| File upload fails | Verify Cloudinary credentials |
| Tests failing | Check test data cleanup, see TESTING.MD skill |

### Debug Tools

```bash
# View database
npx prisma studio

# Check migrations
npx prisma migrate status

# Reset database (CAUTION: Deletes all data)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

## Key Files Reference

### Configuration
- `next.config.ts` - Next.js configuration
- `prisma/schema.prisma` - Database schema
- `tsconfig.json` - TypeScript config
- `tailwind.config.ts` - Tailwind config (future)
- `.env.local` - Environment variables

### Authentication
- `src/auth.ts` - NextAuth setup
- `src/auth.config.ts` - Auth configuration
- `src/middleware.ts` - Route protection

### Database
- `src/lib/db/db.ts` - Prisma client instance
- `prisma/seed.ts` - Database seeding

### Validation
- `src/lib/validations/auth.ts` - Auth schemas
- `src/lib/validations/event.ts` - Event schemas
- `src/lib/validations/notice.ts` - Notice schemas

## Project Status & Features

### Completed Features ✅

**Phase 1**: Foundation
- Database schema (14 tables)
- Prisma setup
- Authentication system

**Phase 2**: Authentication & User Management
- User registration
- Login/logout
- Admin approval workflow
- User profile management

**Phase 3**: Public Pages
- Landing page
- Public notices
- Public events display

**Phase 4**: User Features
- User dashboard
- Notice board (registered users)
- Event browsing and registration (individual + team)
- Neighbor directory
- Vehicle management

**Phase 5**: Admin Portal
- Admin dashboard
- Notice management (CRUD)
- Event management (CRUD)
- User management (approval, suspension, roles)
- Event registration tracking
- Data export (CSV)

### Future Features 🚧

- Complaint management system
- Marketplace (buy/sell)
- Yellow Pages (service directory)
- Email notifications
- SMS alerts
- Payment integration
- Document library
- Mobile app

## Best Practices

### Security
- ✅ Never expose API keys in client components
- ✅ Always validate user input (Zod)
- ✅ Check authorization in server actions
- ✅ Use parameterized queries (Prisma handles this)
- ✅ Hash passwords with bcrypt (12 rounds)

### Performance
- ✅ Use Server Components by default
- ✅ Add "use client" only when needed (interactivity)
- ✅ Implement pagination for large lists
- ✅ Use `revalidatePath()` after mutations
- ✅ Optimize images with Cloudinary

### Code Quality
- ✅ Use TypeScript strictly (no `any`)
- ✅ Follow naming conventions
- ✅ Write descriptive commit messages
- ✅ Add comments for complex logic
- ✅ Keep components small and focused

## Resources

### Documentation
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- NextAuth: https://next-auth.js.org
- Tailwind: https://tailwindcss.com/docs
- Playwright: https://playwright.dev

### Project Docs
- `docs/PRODUCT_SPECIFICATIONS.md` - Feature specifications
- `docs/TECHNICAL_IMPLEMENTATION.md` - Architecture details
- `docs/TESTING_FRAMEWORK.md` - Testing guide
- `TEST_PLAN.md` - Comprehensive test plan
- `DEPLOYMENT_PLAN.md` - Deployment guide

## Quick Start Checklist

When working on a new feature:

1. [ ] Review product specs in `docs/PRODUCT_SPECIFICATIONS.md`
2. [ ] Check if database schema needs updates
3. [ ] Create migration if needed (`npx prisma migrate dev`)
4. [ ] Write validation schema (Zod)
5. [ ] Implement server action
6. [ ] Create components
7. [ ] Add page/route
8. [ ] Write tests (see TESTING.MD skill)
9. [ ] Test manually in browser
10. [ ] Run linter (`npm run lint`)
11. [ ] Commit with descriptive message

---

**Skill Version**: 1.0  
**Last Updated**: January 18, 2026  
**Maintained By**: Development Team
