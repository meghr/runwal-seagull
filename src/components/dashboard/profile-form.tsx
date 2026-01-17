"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/user";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
    user: {
        name: string;
        email: string;
        phoneNumber: string | null;
        profileImageUrl: string | null;
        isProfilePublic: boolean;
        role: string;
        building: { name: string; buildingCode: string } | null;
        flat: { flatNumber: string } | null;
    };
}

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState({ type: "", text: "" });

    const [formData, setFormData] = useState({
        name: user.name,
        phoneNumber: user.phoneNumber || "",
        profileImageUrl: user.profileImageUrl || "",
        isProfilePublic: user.isProfilePublic,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMsg({ type: "", text: "" });

        startTransition(async () => {
            const res = await updateProfile(formData);
            if (res.success) {
                setMsg({ type: "success", text: "Profile updated successfully" });
                router.refresh();
            } else {
                setMsg({ type: "error", text: res.error || "Failed to update" });
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white/5 p-6 rounded-xl border border-white/10">

            {/* Profile Image */}
            <div className="flex flex-col items-center sm:flex-row gap-6">
                <div className="shrink-0">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-700 bg-slate-800">
                        {formData.profileImageUrl ? (
                            <img src={formData.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-4xl font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-1 space-y-2 w-full">
                    <Label className="text-slate-300">Profile Picture</Label>
                    <FileUpload
                        value={formData.profileImageUrl}
                        onChange={(url) => setFormData(p => ({ ...p, profileImageUrl: url }))}
                        endpoint="image"
                    />
                    <p className="text-xs text-slate-500">Supported formats: JPG, PNG, WebP (Max 5MB)</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label className="text-slate-300">Full Name</Label>
                    <Input
                        value={formData.name}
                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                        className="bg-slate-900/50 border-white/10 text-white"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-300">Phone Number</Label>
                    <Input
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData(p => ({ ...p, phoneNumber: e.target.value }))}
                        placeholder="+91..."
                        className="bg-slate-900/50 border-white/10 text-white"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-300">Email Address</Label>
                    <Input
                        value={user.email}
                        disabled
                        className="bg-slate-900/20 border-white/5 text-slate-500 cursor-not-allowed"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-300">Role</Label>
                    <div className="px-3 py-2 rounded-md border border-white/5 bg-slate-900/20 text-slate-400 text-sm">
                        {user.role}
                    </div>
                </div>
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="font-medium text-white flex items-center gap-2">
                    Privacy Settings
                </h3>
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div>
                        <p className="font-medium text-slate-200">Show profile in Neighbor Directory</p>
                        <p className="text-sm text-slate-500 text-balance">When enabled, other residents can find you and see your contact details in the society directory.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isProfilePublic}
                            onChange={(e) => setFormData(p => ({ ...p, isProfilePublic: e.target.checked }))}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                    </label>
                </div>
            </div>

            {/* Residence Info */}
            <div className="rounded-lg bg-sky-500/5 p-4 border border-sky-500/10">
                <h3 className="font-medium text-sky-400 mb-2">My Residence</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-slate-500 block">Building</span>
                        <span className="text-slate-200">{user.building?.name || "Not Assigned"}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block">Flat Number</span>
                        <span className="text-slate-200">{user.flat?.flatNumber || "Not Assigned"}</span>
                    </div>
                </div>
            </div>

            {msg.text && (
                <div className={`p-4 rounded-md text-sm ${msg.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                    {msg.text}
                </div>
            )}

            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-sky-500 hover:bg-sky-600 text-white min-w-[120px]"
                >
                    {isPending ? "Saving..." : "Save Changes"}
                </Button>
            </div>

        </form>
    );
}
