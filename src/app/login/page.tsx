"use client";

import { useActionState } from "react";
import Link from "next/link";
import { authenticate } from "@/lib/actions/auth"; // Server Action
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
    const [errorMessage, formAction, isPending] = useActionState(
        authenticate,
        undefined,
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl shadow-2xl border border-white/10">
                <div className="p-8">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
                        <p className="mt-2 text-slate-400">Sign in to your account</p>
                    </div>

                    {errorMessage && (
                        <div className="mb-6 rounded-md bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
                            {errorMessage}
                        </div>
                    )}

                    <form action={formAction} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-slate-200">Email Address</Label>
                            <Input
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                required
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-200">Password</Label>
                            <Input
                                name="password"
                                type="password"
                                placeholder="******"
                                required
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-lg py-6 shadow-lg shadow-sky-500/20"
                        >
                            {isPending ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-400">
                        Don't have an account?{" "}
                        <Link href="/register" className="font-medium text-sky-400 hover:text-sky-300">
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
