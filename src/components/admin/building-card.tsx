"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Edit, Trash2 } from "lucide-react";

interface BuildingCardProps {
    building: {
        id: string;
        name: string;
        buildingCode: string;
        totalFloors: number | null;
        totalFlats: number;
        occupiedFlats: number;
        vacantFlats: number;
        occupancyRate: number;
        isActiveForRegistration: boolean;
    };
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export function BuildingCard({ building, onEdit, onDelete }: BuildingCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all hover:bg-white/10 hover:border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-sky-500/10 p-2.5">
                            <Building2 className="h-5 w-5 text-sky-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">{building.name}</h3>
                            <p className="text-sm text-slate-400">Code: {building.buildingCode}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary">
                            {building.totalFloors ? `${building.totalFloors} Floors` : "N/A"}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={building.isActiveForRegistration
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            }
                        >
                            {building.isActiveForRegistration ? "Registration Active" : "Registration Hidden"}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-slate-900/50 p-3">
                        <p className="text-xs text-slate-500">Total Flats</p>
                        <p className="text-lg font-bold text-white">{building.totalFlats}</p>
                    </div>
                    <div className="rounded-lg bg-green-500/10 p-3">
                        <p className="text-xs text-green-400/70">Occupied</p>
                        <p className="text-lg font-bold text-green-400">{building.occupiedFlats}</p>
                    </div>
                    <div className="rounded-lg bg-orange-500/10 p-3">
                        <p className="text-xs text-orange-400/70">Vacant</p>
                        <p className="text-lg font-bold text-orange-400">{building.vacantFlats}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Occupancy Rate</span>
                        <span className="font-semibold text-white">{building.occupancyRate}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all"
                            style={{ width: `${building.occupancyRate}%` }}
                        />
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <Link href={`/admin/buildings/${building.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full border-white/10 text-white hover:bg-white/5">
                            View Details
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(building.id)}
                        className="text-slate-300 hover:text-white hover:bg-white/5"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(building.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
