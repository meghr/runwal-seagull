import { z } from "zod";

export const ProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phoneNumber: z.string()
        .min(10, "Phone number must be at least 10 characters")
        .max(15, "Phone number is too long")
        .optional()
        .or(z.literal("")),
    profileImageUrl: z.string().optional(),
    isProfilePublic: z.boolean().optional(),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;
