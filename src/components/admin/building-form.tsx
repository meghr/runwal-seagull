"use client";

import { useState, useTransition } from "react";
import { createBuilding, updateBuilding } from "@/lib/actions/building";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface BuildingFormProps {
    building?: {
        id: string;
        name: string;
        buildingCode: string;
        totalFloors: number | null;
        description: string | null;
        isActiveForRegistration: boolean;
    };
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function BuildingForm({ building, onSuccess, onCancel }: BuildingFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState({ type: "", text: "" });

    const [formData, setFormData] = useState({
        name: building?.name || "",
        buildingCode: building?.buildingCode || "",
        totalFloors: building?.totalFloors?.toString() || "",
        description: building?.description || "",
        isActiveForRegistration: building?.isActiveForRegistration ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMsg({ type: "", text: "" });

        startTransition(async () => {
            const data = {
                name: formData.name,
                buildingCode: formData.buildingCode,
                totalFloors: formData.totalFloors ? parseInt(formData.totalFloors) : null,
                description: formData.description || null,
                isActiveForRegistration: formData.isActiveForRegistration,
            };

            const res = building
                ? await updateBuilding(building.id, data)
                : await createBuilding(data);

            if (res.success) {
                setMsg({ type: "success", text: res.message || "Building saved successfully" });
                router.refresh();
                if (onSuccess) setTimeout(onSuccess, 500);
            } else {
                setMsg({ type: "error", text: res.error || "Failed to save building" });
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label className="text-slate-300">Building Name *</Label>
                    <Input
                        value={formData.name}
                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="e.g., Building A"
                        required
                        className="bg-slate-900/50 border-white/10 text-white"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-300">Building Code *</Label>
                    <Input
                        value={formData.buildingCode}
                        onChange={(e) => setFormData(p => ({ ...p, buildingCode: e.target.value.toUpperCase() }))}
                        placeholder="e.g., A, B, C1"
                        required
                        className="bg-slate-900/50 border-white/10 text-white"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-300">Total Floors</Label>
                    <Input
                        type="number"
                        value={formData.totalFloors}
                        onChange={(e) => setFormData(p => ({ ...p, totalFloors: e.target.value }))}
                        placeholder="e.g., 20"
                        min="1"
                        max="200"
                        className="bg-slate-900/50 border-white/10 text-white"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-slate-300">Description</Label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="Additional information about the building..."
                    rows={3}
                    maxLength={1000}
                    className="w-full rounded-md border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                />
                <p className="text-xs text-slate-500">{formData.description.length}/1000 characters</p>
            </div>

            <div className="flex items-center space-x-2 bg-slate-900/50 border border-white/10 p-4 rounded-lg">
                <input
                    type="checkbox"
                    id="isActiveForRegistration"
                    checked={formData.isActiveForRegistration}
                    onChange={(e) => setFormData(p => ({ ...p, isActiveForRegistration: e.target.checked }))}
                    className="h-4 w-4 rounded border-white/10 bg-slate-800 text-sky-500 focus:ring-sky-500"
                />
                <div className="grid gap-1.5 leading-none">
                    <Label
                        htmlFor="isActiveForRegistration"
                        className="text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Active for Registration
                    </Label>
                    <p className="text-xs text-slate-400">
                        When enabled, this building will appear in the registration dropdown for new users.
                    </p>
                </div>
            </div>

            {msg.text && (
                <div className={`p-4 rounded-md text-sm ${msg.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                    {msg.text}
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isPending} className="border-white/10 text-white hover:bg-white/5">
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isPending} className="bg-sky-500 hover:bg-sky-600 text-white min-w-[120px]">
                    {isPending ? "Saving..." : building ? "Update Building" : "Create Building"}
                </Button>
            </div>
        </form>
    );
}
