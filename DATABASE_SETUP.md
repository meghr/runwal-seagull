# Database Setup Guide

## Step 1: Create Supabase Project

1. **Go to Supabase**: Visit [https://supabase.com](https://supabase.com)
2. **Sign up/Login**: Create account or login
3. **Create New Project**:
   - Click "New Project"
   - Choose organization (or create one)
   - Project Name: `runwal-seagull-db` (or your choice)
   - Database Password: **Create a strong password and SAVE IT**
   - Region: Choose closest to your location (e.g., Mumbai for India)
   - Click "Create new project"
   - Wait 2-3 minutes for project creation

## Step 2: Get Database Connection String

1. Once project is created, go to **Settings** (gear icon in sidebar)
2. Click **Database** from the left menu
3. Scroll to **Connection string** section
4. Select **URI** tab
5. Copy the connection string - it looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
6. **Important**: Replace `[YOUR-PASSWORD]` with the password you created in Step 1

## Step 3: Configure Local Environment

1. Create `.env.local` file in the project root (copy from .env.example):
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and update `DATABASE_URL` with your Supabase connection string

3. Example `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres.abcdefg123:YourStrongPassword123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

## Step 4: Run Database Migration

This will create all 14 tables in your Supabase database:

```bash
npx prisma migrate dev --name init
```

This command will:
- Create all tables (users, buildings, flats, events, etc.)
- Generate Prisma Client for type-safe queries
- Apply the migration to your database

## Step 5: Seed Initial Data

Install bcryptjs for password hashing:

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

Run the seed script to create sample data:

```bash
npx prisma db seed
```

This will create:
- 2 Buildings (Building A & B)
- 10 sample flats in Building A
- 1 Admin user
- 1 Owner user (linked to Flat 101)

## Initial Login Credentials

After seeding, you can use these credentials:

### Admin User
- **Email**: `admin@runwalseagull.com`
- **Password**: `admin123`
- **Role**: ADMIN

### Owner User
- **Email**: `owner@example.com`
- **Password**: `owner123`
- **Role**: OWNER
- **Flat**: Building A - 101

⚠️ **IMPORTANT**: Change these passwords before deploying to production!

## Step 6: Verify Database

Open Prisma Studio to view your database:

```bash
npx prisma studio
```

This will open a browser window where you can:
- View all tables
- See the seeded data
- Manually add/edit records (useful for testing)

## Troubleshooting

### Connection Error
If you get connection errors:
1. Check your DATABASE_URL is correct
2. Ensure password has no special characters that need encoding
3. Check your internet connection
4. Verify Supabase project is active

### Migration Errors
If migration fails:
1. Check schema.prisma for syntax errors
2. Ensure DATABASE_URL is set correctly
3. Try: `npx prisma migrate reset` (⚠️ This deletes all data!)

### Prisma Client Errors
If you see "Prisma Client not generated":
```bash
npx prisma generate
```

## Useful Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (Database GUI)
npx prisma studio

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Apply migrations in production
npx prisma migrate deploy

# Reset database (⚠️ Deletes all data)
npx prisma migrate reset

# Format schema file
npx prisma format

# Validate schema
npx prisma validate
```

## Next Steps

After database setup is complete:
- ✅ Proceed to Task 1.3: Authentication System
- ✅ Set up NextAuth.js for user login
- ✅ Build registration and login pages

## Database Schema Summary

Your database now has 14 tables:
1. **users** - All system users
2. **buildings** - Society buildings
3. **flats** - Flat units in buildings
4. **notices** - Society notices/announcements
5. **events** - Events with registration
6. **event_registrations** - Event registration records
7. **vehicles** - Resident vehicle information
8. **marketplace_ads** - Buy/sell marketplace
9. **complaints** - Complaint management
10. **complaint_comments** - Comments on complaints
11. **complaint_status_history** - Complaint status tracking
12. **yellow_pages** - Service directory
13. **yellow_pages_reviews** - Service reviews
14. **activity_logs** - System activity tracking

All with proper relationships, indexes, and constraints! 🎉
