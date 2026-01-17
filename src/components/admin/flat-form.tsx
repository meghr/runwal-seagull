"use client";

import { useState, useTransition, useEffect } from "react";
import { createFlat, updateFlat } from "@/lib/actions/flat";
import { getBuildings } from "@/lib/actions/master-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface FlatFormProps {
    flat?: {
        id: string;
        buildingId: string;
        flatNumber: string;
        floorNumber: number | null;
        bhkType: string | null;
    };
    defaultBuildingId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function FlatForm({ flat, defaultBuildingId, onSuccess, onCancel }: FlatFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState({ type: "", text: "" });
    const [buildings, setBuildings] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        buildingId: flat?.buildingId || defaultBuildingId || "",
        flatNumber: flat?.flatNumber || "",
        floorNumber: flat?.floorNumber?.toString() || "",
        bhkType: flat?.bhkType || "",
    });

    useEffect(() => {
        async function loadBuildings() {
            const data = await getBuildings();
            setBuildings(data);
        }
        loadBuildings();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMsg({ type: "", text: "" });

        if (!formData.buildingId) {
            setMsg({ type: "error", text: "Please select a building" });
            return;
        }

        startTransition(async () => {
            const data = {
                buildingId: formData.buildingId,
                flatNumber: formData.flatNumber,
                floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : null,
                bhkType: formData.bhkType || null,
            };

            const res = flat
                ? await updateFlat(flat.id, { flatNumber: data.flatNumber, floorNumber: data.floorNumber, bhkType: data.bhkType })
                : await createFlat(data);

            if (res.success) {
                setMsg({ type: "success", text: res.message || "Flat saved successfully" });
                router.refresh();
                if (onSuccess) setTimeout(onSuccess, 500);
            } else {
                setMsg({ type: "error", text: res.error || "Failed to save flat" });
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label className="text-slate-300">Building *</Label>
                <select
                    value={formData.buildingId}
                    onChange={(e) => setFormData(p => ({ ...p, buildingId: e.target.value }))}
                    required
                    disabled={!!flat}
                    className="w-full rounded-md border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:opacity-50"
                >
                    <option value="">Select a building</option>
                    {buildings.map((building) => (
                        <option key={building.id} value={building.id}>
                            {building.name} ({building.buildingCode})
                        </option>
                    ))}
                </select>
                {flat && <p className="text-xs text-slate-500">Building cannot be changed</p>}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                    <Label className="text-slate-300">Flat Number *</Label>
                    <Input
                        value={formData.flatNumber}
                        onChange={(e) => setFormData(p => ({ ...p, flatNumber: e.target.value }))}
                        placeholder="e.g., 101, A-201"
                        required
                        className="bg-slate-900/50 border-white/10 text-white"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-300">Floor Number</Label>
                    <Input
                        type="number"
                        value={formData.floorNumber}
                        onChange={(e) => setFormData(p => ({ ...p, floorNumber: e.target.value }))}
                        placeholder="e.g., 1, 10"
                        min="-5"
                        max="200"
                        className="bg-slate-900/50 border-white/10 text-white"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-300">BHK Type</Label>
                    <Input
                        value={formData.bhkType}
                        onChange={(e) => setFormData(p => ({ ...p, bhkType: e.target.value }))}
                        placeholder="e.g., 2BHK, 3BHK"
                        className="bg-slate-900/50 border-white/10 text-white"
                    />
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
                    {isPending ? "Saving..." : flat ? "Update Flat" : "Create Flat"}
                </Button>
            </div>
        </form>
    );
}
