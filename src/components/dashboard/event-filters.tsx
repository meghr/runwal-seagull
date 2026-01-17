"use client";

import { Button } from "@/components/ui/button";

interface EventFiltersProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
}

const timeFilters = [
    { value: "UPCOMING", label: "Upcoming" },
    { value: "PAST", label: "Past Events" },
    { value: "ALL", label: "All Events" },
];

const typeFilters = [
    { value: "ALL", label: "All Types" },
    { value: "FESTIVAL", label: "Festival" },
    { value: "SPORTS", label: "Sports" },
    { value: "CULTURAL", label: "Cultural" },
    { value: "MEETING", label: "Meeting" },
    { value: "SOCIAL", label: "Social" },
    { value: "OTHER", label: "Other" },
];

export function EventFilters({ activeFilter, onFilterChange }: EventFiltersProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {timeFilters.map((filter) => {
                const isActive = activeFilter === filter.value;

                return (
                    <Button
                        key={filter.value}
                        variant={isActive ? "default" : "outline"}
                        className={`
              ${isActive
                                ? 'bg-sky-500 hover:bg-sky-600 text-white border-sky-500'
                                : 'border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                            }
              transition-all
            `}
                        onClick={() => onFilterChange(filter.value)}
                    >
                        {filter.label}
                    </Button>
                );
            })}
        </div>
    );
}

export function EventTypeFilters({
    activeType,
    onTypeChange,
}: {
    activeType: string;
    onTypeChange: (type: string) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {typeFilters.map((filter) => {
                const isActive = activeType === filter.value;

                return (
                    <Button
                        key={filter.value}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className={`
              ${isActive
                                ? 'bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500'
                                : 'border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                            }
              transition-all
            `}
                        onClick={() => onTypeChange(filter.value)}
                    >
                        {filter.label}
                    </Button>
                );
            })}
        </div>
    );
}
