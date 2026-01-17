"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NoticeSearchProps {
    onSearch: (query: string) => void;
    initialValue?: string;
}

export function NoticeSearch({ onSearch, initialValue = "" }: NoticeSearchProps) {
    const [searchQuery, setSearchQuery] = useState(initialValue);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    const handleClear = () => {
        setSearchQuery("");
        onSearch("");
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
                type="text"
                placeholder="Search notices by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-20 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
            {searchQuery && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="h-7 px-2 hover:bg-white/10"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        className="h-7 bg-sky-500 hover:bg-sky-600"
                    >
                        Search
                    </Button>
                </div>
            )}
            {!searchQuery && (
                <Button
                    type="submit"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 bg-sky-500 hover:bg-sky-600"
                >
                    Search
                </Button>
            )}
        </form>
    );
}
