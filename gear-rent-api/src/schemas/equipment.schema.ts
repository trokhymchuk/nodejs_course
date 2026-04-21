import * as z from "zod";

const categories = ["SKIS", "SNOWBOARD", "BOOTS", "POLES", "HELMET", "GOGGLES", "CLOTHING", "OTHER"] as const;

export const createEquipmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().min(1, "Description is required"),
  category: z.enum(categories).default("OTHER"),
  pricePerDay: z.number().positive("Price must be a positive number"),
});

export const updateEquipmentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  category: z.enum(categories).optional(),
  pricePerDay: z.number().positive().optional(),
  isAvailable: z.boolean().optional(),
});

export const getEquipmentQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  category: z.enum(categories).optional(),
  available: z.enum(["true", "false"]).optional(),
});

export type CreateEquipmentDTO = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentDTO = z.infer<typeof updateEquipmentSchema>;
export type GetEquipmentQuery = z.infer<typeof getEquipmentQuerySchema>;
