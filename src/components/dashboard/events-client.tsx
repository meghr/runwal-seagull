"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EventFilters, EventTypeFilters } from "@/components/dashboard/event-filters";
import { EventCardForUser } from "@/components/dashboard/event-card-user";
import { EventRegistrationModal } from "@/components/dashboard/event-registration-modal";
import { Pagination } from "@/components/dashboard/pagination";
import { Input } from "@/components/ui/input";
import { CalendarDays, Loader2, Search } from "lucide-react";
import { getAllEventsForUser } from "@/lib/actions/event";

export function EventsClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
    });

    const [filters, setFilters] = useState({
        filter: (searchParams.get("filter") as "ALL" | "UPCOMING" | "PAST") || "UPCOMING",
        eventType: searchParams.get("type") || "ALL",
        search: searchParams.get("search") || "",
        page: Number(searchParams.get("page")) || 1,
    });

    // Registration modal state
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch events
    const fetchEvents = async () => {
        setLoading(true);
        const result = await getAllEventsForUser({
            page: filters.page,
            limit: 12,
            filter: filters.filter,
            eventType: filters.eventType,
            search: filters.search,
        });

        if (result.success && result.data) {
            setEvents(result.data.events);
            setPagination(result.data.pagination);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEvents();
        // Update URL params
        const params = new URLSearchParams();
        if (filters.filter !== "UPCOMING") params.set("filter", filters.filter);
        if (filters.eventType !== "ALL") params.set("type", filters.eventType);
        if (filters.search) params.set("search", filters.search);
        if (filters.page !== 1) params.set("page", filters.page.toString());

        const newUrl = params.toString() ? `?${params.toString()}` : "/dashboard/events";
        router.push(newUrl, { scroll: false });
    }, [filters]);

    const handleTimeFilterChange = (filter: string) => {
        setFilters({ ...filters, filter: filter as "ALL" | "UPCOMING" | "PAST", page: 1 });
    };

    const handleTypeFilterChange = (eventType: string) => {
        setFilters({ ...filters, eventType, page: 1 });
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const search = formData.get("search") as string;
        setFilters({ ...filters, search, page: 1 });
    };

    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleRegisterClick = (event: any) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleRegistrationSuccess = () => {
        fetchEvents(); // Refresh events list
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="space-y-4">
                <EventFilters
                    activeFilter={filters.filter}
                    onFilterChange={handleTimeFilterChange}
                />
                <EventTypeFilters
                    activeType={filters.eventType}
                    onTypeChange={handleTypeFilterChange}
                />
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    name="search"
                    type="text"
                    placeholder="Search events by title, venue..."
                    defaultValue={filters.search}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                />
            </form>

            {/* Results Count */}
            {!loading && (
                <div className="text-sm text-slate-400">
                    {pagination.total} {pagination.total === 1 ? "event" : "events"} found
                    {filters.search && ` for "${filters.search}"`}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                </div>
            )}

            {/* Events Grid */}
            {!loading && events.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <EventCardForUser
                            key={event.id}
                            event={event}
                            onRegisterClick={() => handleRegisterClick(event)}
                        />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && events.length === 0 && (
                <div className="text-center py-20">
                    <CalendarDays className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        No events found
                    </h3>
                    <p className="text-slate-400">
                        {filters.search
                            ? `No events match your search "${filters.search}"`
                            : filters.filter === "UPCOMING"
                                ? "No upcoming events at this time"
                                : filters.filter === "PAST"
                                    ? "No past events to show"
                                    : "There are no events available"}
                    </p>
                </div>
            )}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
                <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                />
            )}

            {/* Registration Modal */}
            {selectedEvent && (
                <EventRegistrationModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedEvent(null);
                    }}
                    event={selectedEvent}
                    onSuccess={handleRegistrationSuccess}
                />
            )}
        </div>
    );
}
