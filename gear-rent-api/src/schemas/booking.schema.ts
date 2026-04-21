import * as z from "zod";

export const createBookingSchema = z.object({
  equipmentId: z.number().int().positive(),
  startDate: z.string().datetime({ message: "startDate must be a valid ISO date" }),
  endDate: z.string().datetime({ message: "endDate must be a valid ISO date" }),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: "endDate must be after startDate", path: ["endDate"] },
);

export const updateBookingStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"]),
});

export type CreateBookingDTO = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusDTO = z.infer<typeof updateBookingStatusSchema>;
