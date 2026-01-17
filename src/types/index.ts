export type UserRole = "PUBLIC" | "OWNER" | "TENANT" | "ADMIN";
export type UserStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type UserType = "OWNER" | "TENANT";

export interface User {
    id: string;
    email: string;
    name: string;
    phoneNumber?: string;
    role: UserRole;
    status: UserStatus;
    buildingId?: string;
    flatId?: string;
    userType?: UserType;
    profileImageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Building {
    id: string;
    name: string;
    buildingCode: string;
    totalFloors?: number;
    description?: string;
    createdAt: Date;
}

export interface Flat {
    id: string;
    buildingId: string;
    flatNumber: string;
    floorNumber?: number;
    bhkType?: string;
    ownerId?: string;
    currentTenantId?: string;
    createdAt: Date;
}
