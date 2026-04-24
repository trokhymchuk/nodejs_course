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

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  email: z.email(),
  code: z.string().length(6, "Code must be 6 characters"),
  newPassword: z
    .string()
    .min(8, "Password should be between 8 to 32 characters")
    .max(32, "Password should be between 8 to 32 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password should be between 8 to 32 characters")
    .max(32, "Password should be between 8 to 32 characters"),
});

export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
