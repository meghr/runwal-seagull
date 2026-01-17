"use client";

import { useState } from "react";
import { FlatCard } from "@/components/admin/flat-card";
import { FlatForm } from "@/components/admin/flat-form";
import { UserAssignmentModal } from "@/components/admin/user-assignment-modal";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { deleteFlat } from "@/lib/actions/flat";

interface FlatsClientProps {
    flats: any[];
}

export function FlatsClient({ flats }: FlatsClientProps) {
    const [showForm, setShowForm] = useState(false);
    const [editingFlat, setEditingFlat] = useState<any>(null);
    const [assigningFlatId, setAssigningFlatId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredFlats = flats.filter(flat =>
        flat.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flat.building.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this flat? This action cannot be undone.")) {
            return;
        }

        const result = await deleteFlat(id);
        if (result.success) {
            window.location.reload();
        } else {
            alert(result.error);
        }
    };

    const handleEdit = (id: string) => {
        const flat = flats.find(f => f.id === id);
        if (flat) {
            setEditingFlat(flat);
            setShowForm(true);
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingFlat(null);
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search flats by number or building..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-slate-900/50 border-white/10 text-white"
                    />
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="bg-sky-500 hover:bg-sky-600 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Flat
                </Button>
            </div>

            {showForm && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {editingFlat ? "Edit Flat" : "Create New Flat"}
                    </h2>
                    <FlatForm flat={editingFlat} onSuccess={handleFormClose} onCancel={handleFormClose} />
                </div>
            )}

            {filteredFlats.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-white/10 bg-white/5">
                    <p className="text-slate-400">
                        {searchQuery ? "No flats found matching your search." : "No flats yet. Create one to get started!"}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredFlats.map((flat) => (
                        <FlatCard
                            key={flat.id}
                            flat={flat}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onAssign={(id) => setAssigningFlatId(id)}
                        />
                    ))}
                </div>
            )}

            {assigningFlatId && (
                <UserAssignmentModal
                    flatId={assigningFlatId}
                    onClose={() => setAssigningFlatId(null)}
                />
            )}
        </>
    );
}
