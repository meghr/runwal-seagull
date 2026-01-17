"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VehicleSearchResult } from "@/components/dashboard/vehicle-search-result";
import { searchVehicle } from "@/lib/actions/vehicle";
import { ArrowLeft, Search, Car, Loader2, SearchX } from "lucide-react";

export default function VehicleSearchPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchQuery.trim()) {
            setError("Please enter a vehicle number to search");
            return;
        }

        if (searchQuery.trim().length < 2) {
            setError("Please enter at least 2 characters");
            return;
        }

        setLoading(true);
        setError(null);
        setSearched(true);

        const result = await searchVehicle(searchQuery);

        if (result.success) {
            setResults(result.data || []);
        } else {
            setError(result.error || "Search failed");
            setResults([]);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/vehicles"
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span className="text-sm">My Vehicles</span>
                            </Link>
                            <div className="h-6 w-px bg-white/10" />
                            <div className="flex items-center gap-2">
                                <Search className="h-5 w-5 text-sky-400" />
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">
                                    Search Vehicle
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Section */}
                <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10">
                    <h2 className="text-lg font-semibold text-white mb-2">
                        Find Vehicle Owner
                    </h2>
                    <p className="text-slate-400 text-sm mb-4">
                        Enter a vehicle number to find the owner's contact information.
                        Useful when a vehicle is blocking your way!
                    </p>

                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1 relative">
                            <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Enter vehicle number (e.g., MH01AB1234)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                                className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-slate-500 uppercase text-lg tracking-wider"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-sky-500 hover:bg-sky-600 text-white px-6"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Search className="h-5 w-5 mr-2" />
                                    Search
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                    </div>
                )}

                {/* Search Results */}
                {!loading && results.length > 0 && (
                    <div className="space-y-4">
                        <div className="text-sm text-slate-400">
                            {results.length} {results.length === 1 ? "result" : "results"} found for "{searchQuery}"
                        </div>
                        {results.map((vehicle) => (
                            <VehicleSearchResult key={vehicle.id} vehicle={vehicle} />
                        ))}
                    </div>
                )}

                {/* No Results */}
                {!loading && searched && results.length === 0 && !error && (
                    <div className="text-center py-16">
                        <SearchX className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                            No vehicles found
                        </h3>
                        <p className="text-slate-400">
                            No vehicles matching "{searchQuery}" were found in our records.
                            <br />
                            The vehicle may not be registered in our society.
                        </p>
                    </div>
                )}

                {/* Initial State */}
                {!searched && !loading && (
                    <div className="text-center py-16">
                        <Car className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                            Search for a vehicle
                        </h3>
                        <p className="text-slate-400">
                            Enter a vehicle number above to find the owner's contact details.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
