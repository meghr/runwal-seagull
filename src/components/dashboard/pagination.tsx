"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const showEllipsis = totalPages > 7;

        if (!showEllipsis) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push("...");
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push("...");
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((page, index) => {
                if (page === "...") {
                    return (
                        <span key={`ellipsis-${index}`} className="px-2 text-slate-500">
                            ...
                        </span>
                    );
                }

                const pageNum = page as number;
                const isActive = pageNum === currentPage;

                return (
                    <Button
                        key={pageNum}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(pageNum)}
                        className={`
              ${isActive
                                ? 'bg-sky-500 hover:bg-sky-600 text-white border-sky-500'
                                : 'border-white/10 text-white hover:bg-white/10'
                            }
            `}
                    >
                        {pageNum}
                    </Button>
                );
            })}

            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
