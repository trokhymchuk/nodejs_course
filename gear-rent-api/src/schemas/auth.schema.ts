import * as z from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z.email(),
  password: z
    .string()
    .min(8, "Password should be between 8 to 32 characters")
    .max(32, "Password should be between 8 to 32 characters"),
  phone: z.string().optional(),
  role: z.enum(["RENTER", "RENTEE"]).optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, "Password should be between 8 to 32 characters")
    .max(32, "Password should be between 8 to 32 characters"),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
