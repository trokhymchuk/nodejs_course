import * as z from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be less than 200 characters"),
  email: z
    .string()
    .email("Invalid email format"),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
