"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn("credentials", {
            ...Object.fromEntries(formData),
            redirectTo: "/dashboard",
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials.";
                case "CallbackRouteError":
                    const cause = error.cause as any;
                    if (cause?.err?.message) return cause.err.message;
                    return "Something went wrong.";
                default:
                    return "Something went wrong.";
            }
        }

        // Don't catch redirects
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }

        console.error("Detailed Login Error:", error);
        return (error as Error).message || "Unknown error";
    }
}

export async function logout() {
    await signOut({ redirectTo: "/login" });
}
