"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, Building2, Users, LayoutGrid, List } from "lucide-react";

interface Building {
    id: string;
    name: string;
    buildingCode: string;
    _count: {
        users: number;
    };
}

interface NeighborFiltersProps {
    buildings: Building[];
    selectedBuilding: string;
    onBuildingChange: (buildingId: string) => void;
    selectedUserType: string;
    onUserTypeChange: (userType: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onSearch: () => void;
    viewMode: "grid" | "list";
    onViewModeChange: (mode: "grid" | "list") => void;
}

export function NeighborFilters({
    buildings,
    selectedBuilding,
    onBuildingChange,
    selectedUserType,
    onUserTypeChange,
    searchQuery,
    onSearchChange,
    onSearch,
    viewMode,
    onViewModeChange,
}: NeighborFiltersProps) {
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch();
    };

    return (
        <div className="space-y-4">
            {/* Filter Row */}
            <div className="flex flex-wrap gap-4">
                {/* Building Filter */}
                <div className="flex-1 min-w-[200px]">
                    <Select value={selectedBuilding} onValueChange={onBuildingChange}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <Building2 className="h-4 w-4 mr-2 text-slate-400" />
                            <SelectValue placeholder="All Buildings" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10">
                            <SelectItem value="ALL" className="text-white hover:bg-white/10">
                                All Buildings
                            </SelectItem>
                            {buildings.map((building) => (
                                <SelectItem
                                    key={building.id}
                                    value={building.id}
                                    className="text-white hover:bg-white/10"
                                >
                                    {building.name} ({building._count.users} residents)
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* User Type Filter */}
                <div className="min-w-[150px]">
                    <Select value={selectedUserType} onValueChange={onUserTypeChange}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <Users className="h-4 w-4 mr-2 text-slate-400" />
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10">
                            <SelectItem value="ALL" className="text-white hover:bg-white/10">
                                All Types
                            </SelectItem>
                            <SelectItem value="OWNER" className="text-white hover:bg-white/10">
                                Owners
                            </SelectItem>
                            <SelectItem value="TENANT" className="text-white hover:bg-white/10">
                                Tenants
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewModeChange("grid")}
                        className={`px-3 ${viewMode === "grid"
                                ? "bg-sky-500/20 text-sky-400"
                                : "text-slate-400 hover:text-white"
                            }`}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewModeChange("list")}
                        className={`px-3 ${viewMode === "list"
                                ? "bg-sky-500/20 text-sky-400"
                                : "text-slate-400 hover:text-white"
                            }`}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    type="text"
                    placeholder="Search by name, email, or flat number..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                />
            </form>
        </div>
    );
}
