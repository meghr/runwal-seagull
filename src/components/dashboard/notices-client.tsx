"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NoticeFilters } from "@/components/dashboard/notice-filters";
import { NoticeSearch } from "@/components/dashboard/notice-search";
import { NoticeCard } from "@/components/dashboard/notice-card";
import { Pagination } from "@/components/dashboard/pagination";
import { Bell, Loader2 } from "lucide-react";
import { getAllNoticesForUser } from "@/lib/actions/notice";

export function NoticesClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [notices, setNotices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
    });

    const [filters, setFilters] = useState({
        noticeType: searchParams.get("type") || "ALL",
        search: searchParams.get("search") || "",
        page: Number(searchParams.get("page")) || 1,
    });

    // Fetch notices
    const fetchNotices = async () => {
        setLoading(true);
        const result = await getAllNoticesForUser({
            page: filters.page,
            limit: 20,
            noticeType: filters.noticeType,
            search: filters.search,
        });

        if (result.success && result.data) {
            setNotices(result.data.notices);
            setPagination(result.data.pagination);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNotices();
        // Update URL params
        const params = new URLSearchParams();
        if (filters.noticeType !== "ALL") params.set("type", filters.noticeType);
        if (filters.search) params.set("search", filters.search);
        if (filters.page !== 1) params.set("page", filters.page.toString());

        const newUrl = params.toString() ? `?${params.toString()}` : "/dashboard/notices";
        router.push(newUrl, { scroll: false });
    }, [filters]);

    const handleFilterChange = (noticeType: string) => {
        setFilters({ ...filters, noticeType, page: 1 });
    };

    const handleSearch = (search: string) => {
        setFilters({ ...filters, search, page: 1 });
    };

    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="space-y-4">
                <NoticeFilters
                    activeFilter={filters.noticeType}
                    onFilterChange={handleFilterChange}
                />
                <NoticeSearch
                    onSearch={handleSearch}
                    initialValue={filters.search}
                />
            </div>

            {/* Results Count */}
            {!loading && (
                <div className="text-sm text-slate-400">
                    {pagination.total} {pagination.total === 1 ? "notice" : "notices"} found
                    {filters.search && ` for "${filters.search}"`}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                </div>
            )}

            {/* Notices List */}
            {!loading && notices.length > 0 && (
                <div className="space-y-4">
                    {notices.map((notice) => (
                        <NoticeCard key={notice.id} notice={notice} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && notices.length === 0 && (
                <div className="text-center py-20">
                    <Bell className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        No notices found
                    </h3>
                    <p className="text-slate-400">
                        {filters.search
                            ? `No notices match your search "${filters.search}"`
                            : filters.noticeType !== "ALL"
                                ? `No ${filters.noticeType.toLowerCase()} notices available`
                                : "There are no notices available at this time"}
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
        </div>
    );
}
