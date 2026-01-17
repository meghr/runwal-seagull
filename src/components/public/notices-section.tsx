"use client";

import { useState } from "react";
import { NoticeCard } from "./notice-card";
import { NoticeModal } from "./notice-modal";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface NoticesSectionProps {
    notices: any[];
}

export function NoticesSection({ notices }: NoticesSectionProps) {
    const [selectedNotice, setSelectedNotice] = useState<any>(null);

    if (notices.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-400">No notices at the moment. Check back soon!</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notices.slice(0, 6).map((notice) => (
                    <NoticeCard
                        key={notice.id}
                        notice={notice}
                        onClick={(id) => {
                            const fullNotice = notices.find(n => n.id === id);
                            setSelectedNotice(fullNotice);
                        }}
                    />
                ))}
            </div>

            {notices.length > 6 && (
                <div className="text-center mt-8">
                    <Link href="/login">
                        <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                            View All Notices
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            )}

            <NoticeModal
                notice={selectedNotice}
                onClose={() => setSelectedNotice(null)}
            />
        </>
    );
}
