import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
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
    console.log("🌱 Starting database seed...");

    // Create Buildings
    console.log("📦 Creating buildings...");
    const buildingA = await prisma.building.upsert({
        where: { buildingCode: "A" },
        update: {},
        create: {
            name: "Building A",
            buildingCode: "A",
            totalFloors: 10,
            description: "Main residential building",
        },
    });

    const buildingB = await prisma.building.upsert({
        where: { buildingCode: "B" },
        update: {},
        create: {
            name: "Building B",
            buildingCode: "B",
            totalFloors: 12,
            description: "Secondary residential building",
        },
    });

    console.log(`✅ Created buildings: ${buildingA.name}, ${buildingB.name}`);

    // Create sample flats
    console.log("🏠 Creating sample flats...");
    const flats = [];
    for (let floor = 1; floor <= 5; floor++) {
        for (const flatNum of ["01", "02"]) {
            flats.push({
                buildingId: buildingA.id,
                flatNumber: `${floor}${flatNum}`,
                floorNumber: floor,
                bhkType: "2BHK",
            });
        }
    }

    for (const flat of flats) {
        await prisma.flat.upsert({
            where: {
                buildingId_flatNumber: {
                    buildingId: flat.buildingId,
                    flatNumber: flat.flatNumber,
                },
            },
            update: {},
            create: flat,
        });
    }

    console.log(`✅ Created ${flats.length} sample flats in Building A`);

    // Create admin user
    console.log("👤 Creating admin user...");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const adminUser = await prisma.user.upsert({
        where: { email: "admin@runwalseagull.com" },
        update: {},
        create: {
            email: "admin@runwalseagull.com",
            passwordHash: hashedPassword,
            name: "Admin User",
            phoneNumber: "+919876543210",
            role: "ADMIN",
            status: "APPROVED",
            approvedAt: new Date(),
        },
    });

    console.log(`✅ Created admin user: ${adminUser.email}`);
    console.log(`   Password: admin123 (CHANGE THIS IN PRODUCTION!)`);

    // Create sample owner user
    console.log("👤 Creating sample owner user...");
    const ownerPassword = await bcrypt.hash("owner123", 10);

    const firstFlat = await prisma.flat.findFirst({
        where: { buildingId: buildingA.id, flatNumber: "101" },
    });

    if (firstFlat) {
        const ownerUser = await prisma.user.upsert({
            where: { email: "owner@example.com" },
            update: {},
            create: {
                email: "owner@example.com",
                passwordHash: ownerPassword,
                name: "John Doe",
                phoneNumber: "+919876543211",
                role: "OWNER",
                status: "APPROVED",
                userType: "OWNER",
                buildingId: buildingA.id,
                flatId: firstFlat.id,
                approvedBy: adminUser.id,
                approvedAt: new Date(),
            },
        });

        // Link flat to owner
        await prisma.flat.update({
            where: { id: firstFlat.id },
            data: { ownerId: ownerUser.id },
        });

        console.log(`✅ Created owner user: ${ownerUser.email}`);
        console.log(`   Password: owner123`);
        console.log(`   Flat: ${buildingA.name} - ${firstFlat.flatNumber}`);
    }

    console.log("\n🎉 Database seeding completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Error during seeding:");
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
