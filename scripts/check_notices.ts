
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkBuildings() {
    const buildings = await prisma.building.findMany({
        select: {
            id: true,
            name: true,
            buildingCode: true
        }
    });
    console.log('Total buildings:', buildings.length);
    console.log('Buildings:', JSON.stringify(buildings, null, 2));

    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true
        }
    });
    console.log('Total users:', users.length);
    console.log('Users:', JSON.stringify(users, null, 2));
}

checkBuildings()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
