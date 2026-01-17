"use client";

import { useState, useEffect, useTransition } from "react";
import { assignUserToFlat, unassignUserFromFlat, getUnassignedUsers } from "@/lib/actions/flat";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserAssignmentModalProps {
    flatId: string;
    onClose: () => void;
}

export function UserAssignmentModal({ flatId, onClose }: UserAssignmentModalProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState({ type: "", text: "" });
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [userType, setUserType] = useState<"OWNER" | "TENANT">("OWNER");

    useEffect(() => {
        async function loadUsers() {
            const result = await getUnassignedUsers();
            if (result.success) {
                setUsers(result.data || []);
            }
        }
        loadUsers();
    }, []);

    const handleAssign = () => {
        if (!selectedUserId) {
            setMsg({ type: "error", text: "Please select a user" });
            return;
        }

        setMsg({ type: "", text: "" });
        startTransition(async () => {
            const result = await assignUserToFlat(flatId, { userId: selectedUserId, userType });
            if (result.success) {
                setMsg({ type: "success", text: result.message || "User assigned successfully" });
                router.refresh();
                setTimeout(() => {
                    onClose();
                    window.location.reload();
                }, 1000);
            } else {
                setMsg({ type: "error", text: result.error || "Failed to assign user" });
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-slate-400 hover:text-white"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6">Assign User to Flat</h2>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-slate-300">User Type</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                type="button"
                                variant={userType === "OWNER" ? "default" : "outline"}
                                onClick={() => setUserType("OWNER")}
                                className={userType === "OWNER" ? "bg-sky-500 hover:bg-sky-600" : "border-white/10 text-white hover:bg-white/5"}
                            >
                                Owner
                            </Button>
                            <Button
                                type="button"
                                variant={userType === "TENANT" ? "default" : "outline"}
                                onClick={() => setUserType("TENANT")}
                                className={userType === "TENANT" ? "bg-sky-500 hover:bg-sky-600" : "border-white/10 text-white hover:bg-white/5"}
                            >
                                Tenant
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-300">Select User</Label>
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="w-full rounded-md border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                        >
                            <option value="">Choose a user...</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                        {users.length === 0 && (
                            <p className="text-xs text-slate-500">No unassigned users available</p>
                        )}
                    </div>

                    {msg.text && (
                        <div className={`p-4 rounded-md text-sm ${msg.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                            {msg.text}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isPending}
                            className="flex-1 border-white/10 text-white hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssign}
                            disabled={isPending || !selectedUserId}
                            className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
                        >
                            {isPending ? "Assigning..." : "Assign User"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
