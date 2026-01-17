"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Car,
    Bike,
    Phone,
    Mail,
    Building2,
    Home,
    Palette,
    CircleParking,
    User,
} from "lucide-react";

interface VehicleSearchResultProps {
    vehicle: {
        id: string;
        vehicleNumber: string;
        vehicleType: string;
        brand: string | null;
        model: string | null;
        color: string | null;
        parkingSlot: string | null;
        user: {
            id: string;
            name: string;
            email: string;
            phoneNumber: string | null;
            profileImageUrl: string | null;
            userType: string | null;
            building: {
                id: string;
                name: string;
            } | null;
            flat: {
                id: string;
                flatNumber: string;
            } | null;
        };
    };
}

const vehicleTypeColors: Record<string, string> = {
    CAR: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    BIKE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    SCOOTER: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    OTHER: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export function VehicleSearchResult({ vehicle }: VehicleSearchResultProps) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            {/* Vehicle Info Header */}
            <div className="p-5 border-b border-white/10 bg-gradient-to-r from-sky-500/5 to-purple-500/5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${vehicleTypeColors[vehicle.vehicleType]?.split(" ")[0] || "bg-slate-500/10"}`}>
                            {vehicle.vehicleType === "CAR" ? (
                                <Car className="h-6 w-6 text-blue-400" />
                            ) : (
                                <Bike className="h-6 w-6 text-emerald-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-wider">
                                {vehicle.vehicleNumber}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                {vehicle.brand && vehicle.model && (
                                    <span>{vehicle.brand} {vehicle.model}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <Badge variant="outline" className={vehicleTypeColors[vehicle.vehicleType]}>
                        {vehicle.vehicleType}
                    </Badge>
                </div>

                {/* Vehicle Details */}
                <div className="flex gap-4 text-sm text-slate-400">
                    {vehicle.color && (
                        <span className="flex items-center gap-1.5">
                            <Palette className="h-4 w-4 text-pink-400" />
                            {vehicle.color}
                        </span>
                    )}
                    {vehicle.parkingSlot && (
                        <span className="flex items-center gap-1.5">
                            <CircleParking className="h-4 w-4 text-emerald-400" />
                            Slot: {vehicle.parkingSlot}
                        </span>
                    )}
                </div>
            </div>

            {/* Owner Info */}
            <div className="p-5">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Owner Details</h4>

                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    {vehicle.user.profileImageUrl ? (
                        <img
                            src={vehicle.user.profileImageUrl}
                            alt={vehicle.user.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white/10"
                        />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center border-2 border-white/10">
                            <User className="h-7 w-7 text-white" />
                        </div>
                    )}

                    {/* Details */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                                {vehicle.user.name}
                            </h3>
                            {vehicle.user.userType && (
                                <Badge
                                    variant="outline"
                                    className={
                                        vehicle.user.userType === "OWNER"
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                                    }
                                >
                                    {vehicle.user.userType}
                                </Badge>
                            )}
                        </div>

                        <div className="space-y-1.5 text-sm text-slate-400">
                            {vehicle.user.building && vehicle.user.flat && (
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-purple-400" />
                                    <span>
                                        {vehicle.user.building.name} - Flat {vehicle.user.flat.flatNumber}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-sky-400" />
                                <span>{vehicle.user.email}</span>
                            </div>
                            {vehicle.user.phoneNumber && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-emerald-400" />
                                    <span>{vehicle.user.phoneNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Call Button */}
                    {vehicle.user.phoneNumber && (
                        <a href={`tel:${vehicle.user.phoneNumber}`}>
                            <Button className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30">
                                <Phone className="h-4 w-4 mr-2" />
                                Call Owner
                            </Button>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
