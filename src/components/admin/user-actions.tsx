"use client";

import { useState, useTransition } from "react";
import { approveUser, rejectUser } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

interface UserActionsProps {
    userId: string;
}

export function UserActions({ userId }: UserActionsProps) {
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState("");

    const handleApprove = () => {
        startTransition(async () => {
            const res = await approveUser(userId);
            if (res.success) {
                setMsg("Approved");
            } else {
                alert(res.error);
            }
        });
    };

    const handleReject = () => {
        if (!confirm("Are you sure you want to reject this user?")) return;

        startTransition(async () => {
            const res = await rejectUser(userId);
            if (res.success) {
                setMsg("Rejected");
            }
        });
    };

    if (msg) {
        return <span className="text-sm font-medium text-emerald-400">{msg}</span>;
    }

    return (
        <div className="flex gap-2">
            <Button
                size="sm"
                onClick={handleApprove}
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
            >
                Approve
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={handleReject}
                disabled={isPending}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 h-8"
            >
                Reject
            </Button>
        </div>
    );
}
