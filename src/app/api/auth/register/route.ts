import { NextResponse } from "next/server";
import { RegisterSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedFields = RegisterSchema.safeParse(body);

        if (!validatedFields.success) {
            return NextResponse.json(
                { error: "Invalid fields", details: validatedFields.error.flatten() },
                { status: 400 }
            );
        }

        const { name, email, phoneNumber, password, buildingId, flatNumber, userType, profileImageUrl } = validatedFields.data;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists with this email" },
                { status: 409 }
            );
        }

        // Find or create flat
        let flat = await prisma.flat.findFirst({
            where: {
                buildingId,
                flatNumber,
            },
        });

        if (!flat) {
            // Create flat if it doesn't exist
            // We assume floor is the first two digits for 4-digit numbers (e.g. 1101 -> Floor 11)
            const floorNumber = parseInt(flatNumber.substring(0, 2));
            flat = await prisma.flat.create({
                data: {
                    buildingId,
                    flatNumber,
                    floorNumber,
                },
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                phoneNumber,
                passwordHash: hashedPassword,
                buildingId,
                flatId: flat.id,
                userType,
                profileImageUrl,
                role: "PUBLIC",
                status: "PENDING",
            },
        });

        // TODO: Send email notification

        return NextResponse.json(
            { message: "Registration successful. Please wait for admin approval.", userId: newUser.id },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
