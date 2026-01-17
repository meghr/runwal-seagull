"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { addVehicle, updateVehicle } from "@/lib/actions/vehicle";
import { Loader2, Car, Bike, CircleParking } from "lucide-react";

interface VehicleFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    vehicle?: {
        id: string;
        vehicleNumber: string;
        vehicleType: string;
        brand: string | null;
        model: string | null;
        color: string | null;
        parkingSlot: string | null;
    } | null;
}

export function VehicleForm({ isOpen, onClose, onSuccess, vehicle }: VehicleFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        vehicleNumber: vehicle?.vehicleNumber || "",
        vehicleType: vehicle?.vehicleType || "CAR",
        brand: vehicle?.brand || "",
        model: vehicle?.model || "",
        color: vehicle?.color || "",
        parkingSlot: vehicle?.parkingSlot || "",
    });

    // Sync form data when vehicle prop changes
    useEffect(() => {
        if (vehicle) {
            setFormData({
                vehicleNumber: vehicle.vehicleNumber || "",
                vehicleType: vehicle.vehicleType || "CAR",
                brand: vehicle.brand || "",
                model: vehicle.model || "",
                color: vehicle.color || "",
                parkingSlot: vehicle.parkingSlot || "",
            });
        } else {
            setFormData({
                vehicleNumber: "",
                vehicleType: "CAR",
                brand: "",
                model: "",
                color: "",
                parkingSlot: "",
            });
        }
    }, [vehicle]);

    const isEditing = !!vehicle;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.vehicleNumber.trim()) {
            setError("Vehicle number is required");
            setLoading(false);
            return;
        }

        let result;
        if (isEditing) {
            result = await updateVehicle(vehicle.id, {
                vehicleNumber: formData.vehicleNumber,
                vehicleType: formData.vehicleType as any,
                brand: formData.brand || undefined,
                model: formData.model || undefined,
                color: formData.color || undefined,
                parkingSlot: formData.parkingSlot || undefined,
            });
        } else {
            result = await addVehicle({
                vehicleNumber: formData.vehicleNumber,
                vehicleType: formData.vehicleType as any,
                brand: formData.brand || undefined,
                model: formData.model || undefined,
                color: formData.color || undefined,
                parkingSlot: formData.parkingSlot || undefined,
            });
        }

        if (result.success) {
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                vehicleNumber: "",
                vehicleType: "CAR",
                brand: "",
                model: "",
                color: "",
                parkingSlot: "",
            });
        } else {
            setError(result.error || "Operation failed");
        }
        setLoading(false);
    };

    const handleClose = () => {
        setError(null);
        if (!vehicle) {
            setFormData({
                vehicleNumber: "",
                vehicleType: "CAR",
                brand: "",
                model: "",
                color: "",
                parkingSlot: "",
            });
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] bg-slate-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        {isEditing ? "Edit Vehicle" : "Add New Vehicle"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {isEditing
                            ? "Update your vehicle information"
                            : "Register a new vehicle to your account"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Vehicle Number */}
                    <div className="space-y-2">
                        <Label htmlFor="vehicleNumber" className="text-white">
                            Vehicle Number <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="vehicleNumber"
                            placeholder="e.g., MH01AB1234"
                            value={formData.vehicleNumber}
                            onChange={(e) =>
                                setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })
                            }
                            className="bg-white/5 border-white/10 text-white uppercase"
                        />
                    </div>

                    {/* Vehicle Type */}
                    <div className="space-y-2">
                        <Label className="text-white">Vehicle Type</Label>
                        <Select
                            value={formData.vehicleType}
                            onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10">
                                <SelectItem value="CAR" className="text-white hover:bg-white/10">
                                    <div className="flex items-center gap-2">
                                        <Car className="h-4 w-4" />
                                        Car
                                    </div>
                                </SelectItem>
                                <SelectItem value="BIKE" className="text-white hover:bg-white/10">
                                    <div className="flex items-center gap-2">
                                        <Bike className="h-4 w-4" />
                                        Bike
                                    </div>
                                </SelectItem>
                                <SelectItem value="SCOOTER" className="text-white hover:bg-white/10">
                                    <div className="flex items-center gap-2">
                                        <Bike className="h-4 w-4" />
                                        Scooter
                                    </div>
                                </SelectItem>
                                <SelectItem value="OTHER" className="text-white hover:bg-white/10">
                                    Other
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Brand and Model */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="brand" className="text-white">Brand</Label>
                            <Input
                                id="brand"
                                placeholder="e.g., Honda"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model" className="text-white">Model</Label>
                            <Input
                                id="model"
                                placeholder="e.g., City"
                                value={formData.model}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    {/* Color and Parking Slot */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="color" className="text-white">Color</Label>
                            <Input
                                id="color"
                                placeholder="e.g., White"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="parkingSlot" className="text-white">Parking Slot</Label>
                            <Input
                                id="parkingSlot"
                                placeholder="e.g., A-101"
                                value={formData.parkingSlot}
                                onChange={(e) => setFormData({ ...formData, parkingSlot: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="border-white/10 text-white hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-sky-500 hover:bg-sky-600 text-white"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {isEditing ? "Updating..." : "Adding..."}
                                </>
                            ) : isEditing ? (
                                "Update Vehicle"
                            ) : (
                                "Add Vehicle"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
