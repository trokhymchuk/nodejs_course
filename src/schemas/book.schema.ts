import * as z from "zod";

export const createBookSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  author: z
    .string()
    .min(1, "Author is required")
    .max(200, "Author must be less than 200 characters"),
  year: z.number().int("Year must be an integer"),
  isbn: z
    .string()
    .min(1, "ISBN is required"), // I have participated in a devlopment of SmartUKMA, validation ISBN is rather difficult, so no validation here
});

export const updateBookSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  author: z
    .string()
    .min(1, "Author is required")
    .max(200, "Author must be less than 200 characters"),
  year: z.number().int("Year must be an integer"),
  isbn: z
    .string()
    .min(1, "ISBN is required"),
});

export type CreateBookDto = z.infer<typeof createBookSchema>;
export type UpdateBookDto = z.infer<typeof updateBookSchema>;
