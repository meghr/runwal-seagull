import { z } from "zod";

// Flat validation schemas
export const CreateFlatSchema = z.object({
    buildingId: z.string()
        .uuid("Invalid building ID"),
    flatNumber: z.string()
        .min(1, "Flat number is required")
        .max(20, "Flat number is too long")
        .regex(/^[A-Za-z0-9\-\/]+$/, "Flat number can only contain letters, numbers, hyphens, and slashes"),
    floorNumber: z.number()
        .int("Floor number must be a whole number")
        .min(-5, "Floor number too low")
        .max(200, "Floor number seems unrealistic")
        .optional()
        .nullable(),
    bhkType: z.string()
        .max(10, "BHK type is too long")
        .regex(/^[0-9]+(BHK|RK)?$/i, "BHK type must be in format like '2BHK', '3BHK', '1RK'")
        .optional()
        .nullable(),
});

export const UpdateFlatSchema = CreateFlatSchema.omit({ buildingId: true }).partial();

// User assignment schema
export const AssignUserSchema = z.object({
    userId: z.string().uuid("Invalid user ID"),
    userType: z.enum(["OWNER", "TENANT"]),
});

export type CreateFlatInput = z.infer<typeof CreateFlatSchema>;
export type UpdateFlatInput = z.infer<typeof UpdateFlatSchema>;
export type AssignUserInput = z.infer<typeof AssignUserSchema>;
