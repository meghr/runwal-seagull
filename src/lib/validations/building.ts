import { z } from "zod";

// Building validation schemas
export const CreateBuildingSchema = z.object({
    name: z.string()
        .min(2, "Building name must be at least 2 characters")
        .max(100, "Building name is too long"),
    buildingCode: z.string()
        .min(2, "Building code must be at least 2 characters")
        .max(10, "Building code must not exceed 10 characters")
        .regex(/^[A-Za-z0-9\-_]+$/, "Building code must be alphanumeric (dashes and underscores allowed)"),
    totalFloors: z.number()
        .int("Total floors must be a whole number")
        .positive("Total floors must be positive")
        .max(200, "Total floors seems unrealistic")
        .optional()
        .nullable(),
    description: z.string()
        .max(1000, "Description is too long")
        .optional()
        .nullable(),
    isActiveForRegistration: z.boolean().optional(),
});

export const UpdateBuildingSchema = CreateBuildingSchema.partial();

export type CreateBuildingInput = z.infer<typeof CreateBuildingSchema>;
export type UpdateBuildingInput = z.infer<typeof UpdateBuildingSchema>;
