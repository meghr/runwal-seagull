import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isOnAdmin = nextUrl.pathname.startsWith("/admin");

            // Admin route protection
            if (isOnAdmin) {
                if (isLoggedIn && auth?.user?.role === "ADMIN") return true;
                return false; // Redirect unauthenticated or non-admin users
            }

            // Protected dashboard routes
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }

            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.buildingId = user.buildingId;
                token.flatId = user.flatId;
            }
            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
                session.user.buildingId = token.buildingId as string;
                session.user.flatId = token.flatId as string;
            }
            return session;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
