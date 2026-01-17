import { UserRole } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            role: string;
            buildingId?: string | null;
            flatId?: string | null;
            id: string;
        } & DefaultSession["user"];
    }

    interface User {
        role: string;
        buildingId?: string | null;
        flatId?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string;
        buildingId?: string | null;
        flatId?: string | null;
        id: string;
    }
}
