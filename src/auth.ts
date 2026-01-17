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
                console.log("[AuthDebug] Authorize called with:", credentials);
                const validatedFields = LoginSchema.safeParse(credentials);

                console.log("[AuthDebug] Validation success:", validatedFields.success);
                if (!validatedFields.success) {
                    console.log("[AuthDebug] Validation errors:", validatedFields.error);
                }

                if (validatedFields.success) {
                    const { email, password } = validatedFields.data;

                    const user = await prisma.user.findUnique({
                        where: { email },
                    });

                    if (!user || !user.passwordHash) return null;

                    // Enforce Admin Approval
                    if (user.status !== "APPROVED") {
                        throw new Error(user.status === "PENDING" ? "Account pending approval" : "Account suspended");
                    }

                    console.log("[AuthDebug] Input:", password);
                    console.log("[AuthDebug] Hash:", user.passwordHash);

                    const passwordsMatch = await bcrypt.compare(
                        password,
                        user.passwordHash
                    );
                    console.log("[AuthDebug] Match:", passwordsMatch);

                    if (passwordsMatch) {
                        // Return user object compatible with NextAuth User type
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            buildingId: user.buildingId,
                            flatId: user.flatId,
                        };
                    }
                }

                return null;
            },
        }),
    ],
});
