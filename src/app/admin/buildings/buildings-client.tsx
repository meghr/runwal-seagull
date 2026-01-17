"use client";

import { useState } from "react";
import { BuildingCard } from "@/components/admin/building-card";
import { BuildingForm } from "@/components/admin/building-form";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { deleteBuilding } from "@/lib/actions/building";

interface BuildingsClientProps {
    buildings: any[];
}

export function BuildingsClient({ buildings }: BuildingsClientProps) {
    const [showForm, setShowForm] = useState(false);
    const [editingBuilding, setEditingBuilding] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredBuildings = buildings.filter(building =>
        building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        building.buildingCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this building? This action cannot be undone.")) {
            return;
        }

        const result = await deleteBuilding(id);
        if (result.success) {
            window.location.reload();
        } else {
            alert(result.error);
        }
    };

    const handleEdit = (id: string) => {
        const building = buildings.find(b => b.id === id);
        if (building) {
            setEditingBuilding(building);
            setShowForm(true);
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingBuilding(null);
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search buildings by name or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-slate-900/50 border-white/10 text-white"
                    />
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="bg-sky-500 hover:bg-sky-600 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Building
                </Button>
            </div>

            {showForm && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {editingBuilding ? "Edit Building" : "Create New Building"}
                    </h2>
                    <BuildingForm building={editingBuilding} onSuccess={handleFormClose} onCancel={handleFormClose} />
                </div>
            )}

            {filteredBuildings.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-white/10 bg-white/5">
                    <p className="text-slate-400">
                        {searchQuery ? "No buildings found matching your search." : "No buildings yet. Create one to get started!"}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBuildings.map((building) => (
                        <BuildingCard key={building.id} building={building} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </>
    );
}
