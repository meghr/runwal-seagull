import { getAllBuildingsWithStats } from "@/lib/actions/building";
import { BuildingsClient } from "./buildings-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function BuildingsPage() {
    const result = await getAllBuildingsWithStats();

    if (!result.success) {
        return (
            <div className="min-h-screen bg-slate-950 text-white p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400">
                        Error loading buildings: {result.error}
                    </div>
                </div>
            </div>
        );
    }

    const buildings = result.data || [];

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">
                            Buildings Management
                        </h1>
                        <p className="text-slate-400 mt-1">
                            {buildings.length} {buildings.length === 1 ? "building" : "buildings"} in total
                        </p>
                    </div>
                    <Link href="/admin">
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                            Back to Admin
                        </Button>
                    </Link>
                </div>

                <BuildingsClient buildings={buildings} />
            </div>
        </div>
    );
}
