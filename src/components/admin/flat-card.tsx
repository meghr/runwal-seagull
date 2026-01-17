"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Edit, Trash2, UserPlus } from "lucide-react";

interface FlatCardProps {
    flat: {
        id: string;
        flatNumber: string;
        floorNumber: number | null;
        bhkType: string | null;
        building: { name: string; buildingCode: string };
        owner: { id: string; name: string; email: string } | null;
        currentTenant: { id: string; name: string; email: string } | null;
    };
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onAssign: (id: string) => void;
}

export function FlatCard({ flat, onEdit, onDelete, onAssign }: FlatCardProps) {
    const getOccupancyStatus = () => {
        if (flat.owner && flat.currentTenant) return { label: "Fully Occupied", variant: "default" as const };
        if (flat.owner || flat.currentTenant) return { label: "Partially Occupied", variant: "secondary" as const };
        return { label: "Vacant", variant: "outline" as const };
    };

    const status = getOccupancyStatus();

    return (
        <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-all hover:bg-white/10 hover:border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-indigo-500/10 p-2.5">
                            <Home className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Flat {flat.flatNumber}</h3>
                            <p className="text-sm text-slate-400">{flat.building.name}</p>
                        </div>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-slate-500">Floor</p>
                        <p className="font-medium text-white">{flat.floorNumber ?? "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Type</p>
                        <p className="font-medium text-white">{flat.bhkType || "N/A"}</p>
                    </div>
                </div>

                <div className="space-y-2 rounded-lg bg-slate-900/50 p-3">
                    <div>
                        <p className="text-xs text-slate-500">Owner</p>
                        {flat.owner ? (
                            <p className="text-sm font-medium text-white">{flat.owner.name}</p>
                        ) : (
                            <p className="text-sm text-slate-600">Not assigned</p>
                        )}
                    </div>
                    <div className="border-t border-white/5 pt-2">
                        <p className="text-xs text-slate-500">Tenant</p>
                        {flat.currentTenant ? (
                            <p className="text-sm font-medium text-white">{flat.currentTenant.name}</p>
                        ) : (
                            <p className="text-sm text-slate-600">Not assigned</p>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAssign(flat.id)}
                        className="flex-1 border-white/10 text-white hover:bg-white/5"
                    >
                        <UserPlus className="mr-1 h-3.5 w-3.5" />
                        Assign
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(flat.id)} className="text-slate-300 hover:text-white hover:bg-white/5">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(flat.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
