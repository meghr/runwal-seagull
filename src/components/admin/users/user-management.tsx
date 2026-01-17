"use client";

import { useState } from "react";
import { UserList } from "./user-list";
import { UserDetailModal } from "./user-detail-modal";

interface UserData {
    id: string;
    name: string;
    email: string;
    phoneNumber: string | null;
    role: string;
    status: string;
    userType: string | null;
    profileImageUrl: string | null;
    createdAt: Date;
    approvedAt: Date | null;
    building: { id: string; name: string; buildingCode: string } | null;
    flat: { id: string; flatNumber: string; floorNumber: number | null } | null;
    _count: {
        vehicles: number;
        eventRegistrations: number;
        complaints: number;
    };
}

interface Building {
    id: string;
    name: string;
    buildingCode: string;
}

interface UserManagementProps {
    users: UserData[];
    buildings: Building[];
    initialFilters?: {
        search?: string;
        role?: string;
        status?: string;
        buildingId?: string;
    };
}

export function UserManagement({ users, buildings, initialFilters }: UserManagementProps) {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    return (
        <>
            <UserList
                users={users as any}
                buildings={buildings}
                initialFilters={initialFilters}
                onViewUser={(userId) => setSelectedUserId(userId)}
            />

            <UserDetailModal
                userId={selectedUserId}
                onClose={() => setSelectedUserId(null)}
            />
        </>
    );
}
