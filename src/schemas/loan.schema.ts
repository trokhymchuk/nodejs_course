import * as z from "zod";

export const createLoanSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  bookId: z.string().min(1, "Book ID is required"),
});

export type CreateLoanDto = z.infer<typeof createLoanSchema>;
