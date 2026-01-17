"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBuildings } from "@/lib/actions/master-data";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Building {
    id: string;
    name: string;
    buildingCode: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Form State
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        userType: "OWNER", // Default
        buildingId: "",
        flatNumber: "",
        profileImageUrl: "",
    });

    // Data State
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Fetch Buildings on Mount
    useEffect(() => {
        const fetchBuildings = async () => {
            const data = await getBuildings();
            setBuildings(data);
        };
        fetchBuildings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (url: string) => {
        setFormData((prev) => ({ ...prev, profileImageUrl: url }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        startTransition(async () => {
            try {
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || "Something went wrong");
                } else {
                    setSuccess(data.message);
                    // Redirect to pending approval page
                    setTimeout(() => router.push("/pending-approval"), 2000);
                }
            } catch (err) {
                setError("Network error occurred");
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl shadow-2xl border border-white/10">
                <div className="p-8">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Join Runwal Seagull</h1>
                        <p className="mt-2 text-slate-400">Create your account to access the community portal</p>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-md bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 rounded-md bg-green-500/10 p-4 text-sm text-green-400 border border-green-500/20">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* User Type Selection */}
                        <div className="grid grid-cols-2 gap-4 rounded-lg bg-white/5 p-1">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, userType: "OWNER" }))}
                                className={cn(
                                    "rounded-md py-2 text-sm font-medium transition-all duration-200",
                                    formData.userType === "OWNER"
                                        ? "bg-sky-500 text-white shadow-lg"
                                        : "text-slate-400 hover:text-white"
                                )}
                            >
                                Owner
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, userType: "TENANT" }))}
                                className={cn(
                                    "rounded-md py-2 text-sm font-medium transition-all duration-200",
                                    formData.userType === "TENANT"
                                        ? "bg-sky-500 text-white shadow-lg"
                                        : "text-slate-400 hover:text-white"
                                )}
                            >
                                Tenant
                            </button>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Personal Info */}
                            <div className="space-y-2">
                                <Label className="text-slate-200">Full Name</Label>
                                <Input
                                    name="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-200">Email Address</Label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-200">Mobile Number</Label>
                                <Input
                                    name="phoneNumber"
                                    type="tel"
                                    placeholder="Enter 10 digit number"
                                    value={formData.phoneNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setFormData(prev => ({ ...prev, phoneNumber: value }));
                                    }}
                                    required
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>

                            {/* Property Info */}
                            <div className="space-y-2">
                                <Label className="text-slate-200">Building</Label>
                                <select
                                    name="buildingId"
                                    value={formData.buildingId}
                                    onChange={handleChange}
                                    required
                                    className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                >
                                    <option value="" className="bg-slate-800 text-slate-400">Select Building Code</option>
                                    {buildings.map((b) => (
                                        <option key={b.id} value={b.id} className="bg-slate-800">
                                            {b.buildingCode}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-200">Flat Number</Label>
                                <Input
                                    name="flatNumber"
                                    placeholder="e.g. 1101"
                                    value={formData.flatNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                        setFormData(prev => ({ ...prev, flatNumber: value }));
                                    }}
                                    required
                                    disabled={!formData.buildingId}
                                    className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                                />
                                <p className="text-[10px] text-slate-500">Must be a 4-digit number</p>
                            </div>
                        </div>

                        {/* Profile Picture */}
                        <div className="space-y-2">
                            <Label className="text-slate-200">Profile Picture (Optional)</Label>
                            <FileUpload
                                value={formData.profileImageUrl}
                                onChange={handleImageUpload}
                                endpoint="image"
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-slate-200">Password</Label>
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="******"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-200">Confirm Password</Label>
                                <Input
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="******"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-lg py-6 shadow-lg shadow-sky-500/20"
                        >
                            {isPending ? "Creating Account..." : "Register"}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-400">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-sky-400 hover:text-sky-300">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
