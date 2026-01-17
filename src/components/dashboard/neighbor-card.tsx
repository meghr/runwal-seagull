"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateVCard } from "@/lib/actions/neighbor";
import {
    User,
    Phone,
    Mail,
    Building2,
    Home,
    Download,
    Loader2,
} from "lucide-react";

interface NeighborCardProps {
    neighbor: {
        id: string;
        name: string;
        email: string;
        phoneNumber: string | null;
        userType: string | null;
        profileImageUrl: string | null;
        building: {
            id: string;
            name: string;
            buildingCode: string;
        } | null;
        flat: {
            id: string;
            flatNumber: string;
            floorNumber: number | null;
        } | null;
    };
    viewMode: "grid" | "list";
}

export function NeighborCard({ neighbor, viewMode }: NeighborCardProps) {
    const [downloading, setDownloading] = useState(false);

    const handleDownloadVCard = async () => {
        setDownloading(true);
        const result = await generateVCard(neighbor.id);

        if (result.success && result.data) {
            // Create and download vCard file
            const blob = new Blob([result.data.vCard], { type: "text/vcard" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = result.data.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        setDownloading(false);
    };

    if (viewMode === "list") {
        return (
            <div className="flex items-center gap-4 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                {/* Avatar */}
                <div className="shrink-0">
                    {neighbor.profileImageUrl ? (
                        <img
                            src={neighbor.profileImageUrl}
                            alt={neighbor.name}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white truncate">{neighbor.name}</h3>
                        <Badge
                            variant="outline"
                            className={
                                neighbor.userType === "OWNER"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                            }
                        >
                            {neighbor.userType}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        {neighbor.building && neighbor.flat && (
                            <span className="flex items-center gap-1">
                                <Home className="h-3.5 w-3.5" />
                                {neighbor.building.name} - {neighbor.flat.flatNumber}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {neighbor.email}
                        </span>
                        {neighbor.phoneNumber && (
                            <span className="flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" />
                                {neighbor.phoneNumber}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownloadVCard}
                        disabled={downloading}
                        className="text-sky-400 hover:text-sky-300 hover:bg-sky-500/10"
                    >
                        {downloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Download className="h-4 w-4 mr-1" />
                                vCard
                            </>
                        )}
                    </Button>
                </div>
            </div>
        );
    }

    // Grid view
    return (
        <div className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 hover:border-white/20 transition-all">
            {/* Header with Avatar and Badge */}
            <div className="flex items-start justify-between mb-4">
                {neighbor.profileImageUrl ? (
                    <img
                        src={neighbor.profileImageUrl}
                        alt={neighbor.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center border-2 border-white/10">
                        <User className="h-8 w-8 text-white" />
                    </div>
                )}
                <Badge
                    variant="outline"
                    className={
                        neighbor.userType === "OWNER"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                    }
                >
                    {neighbor.userType}
                </Badge>
            </div>

            {/* Name */}
            <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-sky-400 transition-colors">
                {neighbor.name}
            </h3>

            {/* Details */}
            <div className="space-y-2 text-sm text-slate-400 mb-4">
                {neighbor.building && neighbor.flat && (
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-purple-400 shrink-0" />
                        <span className="truncate">
                            {neighbor.building.name} - Flat {neighbor.flat.flatNumber}
                        </span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-sky-400 shrink-0" />
                    <span className="truncate">{neighbor.email}</span>
                </div>
                {neighbor.phoneNumber && (
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>{neighbor.phoneNumber}</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {neighbor.phoneNumber && (
                    <a
                        href={`tel:${neighbor.phoneNumber}`}
                        className="flex-1"
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-white/10 text-white hover:bg-white/10"
                        >
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                        </Button>
                    </a>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadVCard}
                    disabled={downloading}
                    className="flex-1 border-sky-500/30 text-sky-400 hover:bg-sky-500/10"
                >
                    {downloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Download className="h-4 w-4 mr-1" />
                            Save
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
