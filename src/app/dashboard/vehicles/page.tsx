"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/dashboard/vehicle-card";
import { VehicleForm } from "@/components/dashboard/vehicle-form";
import { getMyVehicles } from "@/lib/actions/vehicle";
import { ArrowLeft, Car, Plus, Loader2, Search } from "lucide-react";

export default function MyVehiclesPage() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<any>(null);

    const fetchVehicles = async () => {
        setLoading(true);
        const result = await getMyVehicles();
        if (result.success && result.data) {
            setVehicles(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleEdit = (vehicle: any) => {
        setEditingVehicle(vehicle);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingVehicle(null);
    };

    const handleFormSuccess = () => {
        fetchVehicles();
        handleFormClose();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span className="text-sm">Back to Dashboard</span>
                            </Link>
                            <div className="h-6 w-px bg-white/10" />
                            <div className="flex items-center gap-2">
                                <Car className="h-5 w-5 text-sky-400" />
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">
                                    My Vehicles
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard/vehicles/search"
                                className="text-sm text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
                            >
                                <Search className="h-4 w-4" />
                                Search Vehicle
                            </Link>
                            <Button
                                onClick={() => setIsFormOpen(true)}
                                className="bg-sky-500 hover:bg-sky-600 text-white"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Vehicle
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                    </div>
                )}

                {/* Vehicles Grid */}
                {!loading && vehicles.length > 0 && (
                    <>
                        <div className="text-sm text-slate-400 mb-4">
                            {vehicles.length} {vehicles.length === 1 ? "vehicle" : "vehicles"} registered
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {vehicles.map((vehicle) => (
                                <VehicleCard
                                    key={vehicle.id}
                                    vehicle={vehicle}
                                    onEdit={() => handleEdit(vehicle)}
                                    onDelete={fetchVehicles}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Empty State */}
                {!loading && vehicles.length === 0 && (
                    <div className="text-center py-20">
                        <Car className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                            No vehicles registered
                        </h3>
                        <p className="text-slate-400 mb-6">
                            Add your vehicles to help neighbors find you if your car is blocking someone.
                        </p>
                        <Button
                            onClick={() => setIsFormOpen(true)}
                            className="bg-sky-500 hover:bg-sky-600 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Vehicle
                        </Button>
                    </div>
                )}
            </main>

            {/* Vehicle Form Modal */}
            <VehicleForm
                isOpen={isFormOpen}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
                vehicle={editingVehicle}
            />
        </div>
    );
}
