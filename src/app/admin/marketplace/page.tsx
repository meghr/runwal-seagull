import { Loader2 } from "lucide-react";

export default function AdminMarketplacePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Marketplace Moderation</h2>
            <p className="text-slate-400 max-w-md">
                This module is currently under development. It will be part of Task 5.5.
            </p>
        </div>
    );
}
