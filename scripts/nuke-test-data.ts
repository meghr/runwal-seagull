
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config(); // fallback to .env

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment variables.');
    process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PROTECTED_EMAILS = ['admin@runwalseagull.com'];

async function nukeEverything() {
    console.log('🚀 Starting TOTAL cleanup of database (keeping only protected admins)...');

    try {
        // 1. Find all users except protected ones
        const usersToDelete = await prisma.user.findMany({
            where: {
                email: { notIn: PROTECTED_EMAILS }
            }
        });

        console.log(`👤 Found ${usersToDelete.length} users to delete.`);

        for (const user of usersToDelete) {
            console.log(`  Deleting user: ${user.email}`);
            // Delete dependent records first to avoid FK errors
            try {
                await prisma.activityLog.deleteMany({ where: { userId: user.id } });
                await prisma.eventRegistration.deleteMany({ where: { userId: user.id } });
                await prisma.vehicle.deleteMany({ where: { userId: user.id } });
                await prisma.complaintComment.deleteMany({ where: { userId: user.id } });
                await prisma.complaintStatusHistory.deleteMany({ where: { changedBy: user.id } });
                await prisma.complaint.deleteMany({ where: { userId: user.id } });
                await prisma.marketplaceAd.deleteMany({ where: { userId: user.id } });
                await prisma.notice.deleteMany({ where: { createdBy: user.id } });
                await prisma.event.deleteMany({ where: { createdBy: user.id } });
                await prisma.yellowPageReview.deleteMany({ where: { userId: user.id } });
                await prisma.yellowPage.deleteMany({ where: { submittedBy: user.id } });

                // Nullify approvedBy refs for other users
                await prisma.user.updateMany({
                    where: { approvedBy: user.id },
                    data: { approvedBy: null }
                });

                // Clear ownership/tenancy links in flats
                await prisma.flat.updateMany({
                    where: { ownerId: user.id },
                    data: { ownerId: null }
                });
                await prisma.flat.updateMany({
                    where: { currentTenantId: user.id },
                    data: { currentTenantId: null }
                });

                await prisma.user.delete({ where: { id: user.id } });
            } catch (err: any) {
                console.warn(`  ⚠️ Could not completely delete user ${user.email}:`, err.message);
            }
        }

        // 2. Clear all remaining notices/events not tied to deleted users
        await prisma.notice.deleteMany({});
        await prisma.event.deleteMany({});
        console.log('📢 Cleared all notices and events.');

        // 3. Delete all Flats and Buildings
        // Flats first due to FK
        await prisma.flat.deleteMany({});
        console.log('🏠 Deleted all flats.');

        await prisma.building.deleteMany({});
        console.log('🏢 Deleted all buildings.');

        console.log('\n✨ Database is now clean (except for protected admins).');
        console.log('💡 Note: If you need the seed data back, run: npx prisma db seed');

    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

nukeEverything();
