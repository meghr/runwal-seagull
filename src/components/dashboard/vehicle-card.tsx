"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteVehicle } from "@/lib/actions/vehicle";
import { Car, Bike, CircleParking, Palette, Pencil, Trash2, Loader2 } from "lucide-react";

interface VehicleCardProps {
    vehicle: {
        id: string;
        vehicleNumber: string;
        vehicleType: string;
        brand: string | null;
        model: string | null;
        color: string | null;
        parkingSlot: string | null;
    };
    onEdit: () => void;
    onDelete: () => void;
}

const vehicleTypeIcons: Record<string, React.ReactNode> = {
    CAR: <Car className="h-6 w-6" />,
    BIKE: <Bike className="h-6 w-6" />,
    SCOOTER: <Bike className="h-6 w-6" />,
    OTHER: <Car className="h-6 w-6" />,
};

const vehicleTypeColors: Record<string, string> = {
    CAR: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    BIKE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    SCOOTER: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    OTHER: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this vehicle?")) return;

        setDeleting(true);
        const result = await deleteVehicle(vehicle.id);
        if (result.success) {
            onDelete();
        }
        setDeleting(false);
    };

    return (
        <div className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 hover:border-white/20 transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${vehicleTypeColors[vehicle.vehicleType]?.split(" ")[0] || "bg-slate-500/10"}`}>
                    <div className={vehicleTypeColors[vehicle.vehicleType]?.split(" ").slice(1).join(" ") || "text-slate-400"}>
                        {vehicleTypeIcons[vehicle.vehicleType] || vehicleTypeIcons.OTHER}
                    </div>
                </div>
                <Badge variant="outline" className={vehicleTypeColors[vehicle.vehicleType]}>
                    {vehicle.vehicleType}
                </Badge>
            </div>

            {/* Vehicle Number */}
            <h3 className="text-xl font-bold text-white mb-4 tracking-wider">
                {vehicle.vehicleNumber}
            </h3>

            {/* Details */}
            <div className="space-y-2 text-sm text-slate-400 mb-4">
                {(vehicle.brand || vehicle.model) && (
                    <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-sky-400 shrink-0" />
                        <span>
                            {[vehicle.brand, vehicle.model].filter(Boolean).join(" ")}
                        </span>
                    </div>
                )}
                {vehicle.color && (
                    <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-pink-400 shrink-0" />
                        <span>{vehicle.color}</span>
                    </div>
                )}
                {vehicle.parkingSlot && (
                    <div className="flex items-center gap-2">
                        <CircleParking className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Slot: {vehicle.parkingSlot}</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-white/10">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    className="flex-1 border-white/10 text-white hover:bg-white/10"
                >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                    {deleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
