import { getAllFlatsWithDetails } from "@/lib/actions/flat";
import { FlatsClient } from "./flats-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function FlatsPage() {
    const result = await getAllFlatsWithDetails();

    if (!result.success) {
        return (
            <div className="min-h-screen bg-slate-950 text-white p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400">
                        Error loading flats: {result.error}
                    </div>
                </div>
            </div>
        );
    }

    const flats = result.data || [];

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">
                            Flats Management
                        </h1>
                        <p className="text-slate-400 mt-1">
                            {flats.length} {flats.length === 1 ? "flat" : "flats"} in total
                        </p>
                    </div>
                    <Link href="/admin">
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                            Back to Admin
                        </Button>
                    </Link>
                </div>

                <FlatsClient flats={flats} />
            </div>
        </div>
    );
}
