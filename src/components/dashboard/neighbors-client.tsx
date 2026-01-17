"use client";

import { useState, useEffect } from "react";
import { NeighborFilters } from "@/components/dashboard/neighbor-filters";
import { NeighborCard } from "@/components/dashboard/neighbor-card";
import { getBuildingsForDirectory, getNeighbors } from "@/lib/actions/neighbor";
import { Users, Loader2, Building2 } from "lucide-react";

export function NeighborsClient() {
    const [buildings, setBuildings] = useState<any[]>([]);
    const [neighbors, setNeighbors] = useState<any[]>([]);
    const [groupedNeighbors, setGroupedNeighbors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // Filter states
    const [selectedBuilding, setSelectedBuilding] = useState("ALL");
    const [selectedUserType, setSelectedUserType] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Fetch buildings on mount
    useEffect(() => {
        const fetchBuildings = async () => {
            const result = await getBuildingsForDirectory();
            if (result.success && result.data) {
                setBuildings(result.data);
            }
        };
        fetchBuildings();
    }, []);

    // Fetch neighbors based on filters
    const fetchNeighbors = async () => {
        setLoading(true);
        const result = await getNeighbors({
            buildingId: selectedBuilding === "ALL" ? undefined : selectedBuilding,
            userType: selectedUserType as "ALL" | "OWNER" | "TENANT",
            search: searchQuery || undefined,
        });

        if (result.success && result.data) {
            setNeighbors(result.data.neighbors);
            setGroupedNeighbors(result.data.groupedByBuilding);
            setTotalCount(result.data.totalCount);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNeighbors();
    }, [selectedBuilding, selectedUserType]);

    const handleSearch = () => {
        fetchNeighbors();
    };

    // Handle Enter key in search
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                fetchNeighbors();
            }
        };
        return () => { };
    }, [searchQuery]);

    return (
        <div className="space-y-6">
            {/* Filters */}
            <NeighborFilters
                buildings={buildings}
                selectedBuilding={selectedBuilding}
                onBuildingChange={setSelectedBuilding}
                selectedUserType={selectedUserType}
                onUserTypeChange={setSelectedUserType}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearch={handleSearch}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {/* Results Count */}
            {!loading && (
                <div className="text-sm text-slate-400">
                    {totalCount} {totalCount === 1 ? "resident" : "residents"} found
                    {searchQuery && ` for "${searchQuery}"`}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                </div>
            )}

            {/* Building-wise View */}
            {!loading && selectedBuilding === "ALL" && groupedNeighbors.length > 0 && (
                <div className="space-y-8">
                    {groupedNeighbors.map((group: any, index: number) => (
                        <div key={index}>
                            {/* Building Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-purple-500/10">
                                    <Building2 className="h-5 w-5 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">
                                        {group.building?.name || "Unassigned"}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        {group.residents.length} {group.residents.length === 1 ? "resident" : "residents"}
                                    </p>
                                </div>
                            </div>

                            {/* Neighbors Grid/List */}
                            {viewMode === "grid" ? (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {group.residents.map((neighbor: any) => (
                                        <NeighborCard
                                            key={neighbor.id}
                                            neighbor={neighbor}
                                            viewMode={viewMode}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {group.residents.map((neighbor: any) => (
                                        <NeighborCard
                                            key={neighbor.id}
                                            neighbor={neighbor}
                                            viewMode={viewMode}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Single Building View */}
            {!loading && selectedBuilding !== "ALL" && neighbors.length > 0 && (
                <>
                    {viewMode === "grid" ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {neighbors.map((neighbor) => (
                                <NeighborCard
                                    key={neighbor.id}
                                    neighbor={neighbor}
                                    viewMode={viewMode}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {neighbors.map((neighbor) => (
                                <NeighborCard
                                    key={neighbor.id}
                                    neighbor={neighbor}
                                    viewMode={viewMode}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!loading && totalCount === 0 && (
                <div className="text-center py-20">
                    <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        No residents found
                    </h3>
                    <p className="text-slate-400">
                        {searchQuery
                            ? `No residents match your search "${searchQuery}"`
                            : selectedBuilding !== "ALL"
                                ? "No residents in this building yet"
                                : "No approved residents in the society yet"}
                    </p>
                </div>
            )}
        </div>
    );
}
