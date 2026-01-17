import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Fetching buildings...')
    const buildings = await prisma.building.findMany()
    console.log('Buildings in DB:', JSON.stringify(buildings, null, 2))
}

main()
    .catch((e) => {
        console.error('Error detail:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
