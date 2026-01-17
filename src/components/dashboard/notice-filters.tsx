"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NoticeFiltersProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    counts?: {
        all: number;
        general: number;
        urgent: number;
        maintenance: number;
        event: number;
    };
}

const filters = [
    { value: "ALL", label: "All Notices", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
    { value: "GENERAL", label: "General", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { value: "URGENT", label: "Urgent", color: "bg-red-500/10 text-red-400 border-red-500/20" },
    { value: "MAINTENANCE", label: "Maintenance", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
    { value: "EVENT", label: "Events", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
];

export function NoticeFilters({ activeFilter, onFilterChange, counts }: NoticeFiltersProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
                const isActive = activeFilter === filter.value;
                const count = counts ? counts[filter.value.toLowerCase() as keyof typeof counts] : null;

                return (
                    <Button
                        key={filter.value}
                        variant={isActive ? "default" : "outline"}
                        className={`
              ${isActive
                                ? 'bg-sky-500 hover:bg-sky-600 text-white border-sky-500'
                                : `${filter.color} hover:bg-white/10`
                            }
              transition-all
            `}
                        onClick={() => onFilterChange(filter.value)}
                    >
                        {filter.label}
                        {count !== null && count > 0 && (
                            <Badge
                                variant="secondary"
                                className="ml-2 bg-white/20 text-white border-0"
                            >
                                {count}
                            </Badge>
                        )}
                    </Button>
                );
            })}
        </div>
    );
}
