import type { Request, Response } from "express";

import type { CreateBookDto, UpdateBookDto } from "../schemas/book.schema";
import prisma from "../db/prisma";

type BookParams = {
  id: string;
};

export async function getBooks(req: Request, res: Response) {
  const books = await prisma.book.findMany();
  res.json({ data: books });
}

export async function getBookById(req: Request<BookParams>, res: Response) {
  const book = await prisma.book.findUnique({ where: { id: req.params.id } });

  if (book === null) {
    return res.status(404).json({ error: "Book not found" });
  }

  res.json({ data: book });
}

export async function createBook(
  req: Request<{}, {}, CreateBookDto>,
  res: Response,
) {
  const { title, author, year, isbn } = req.body;

  const existingBook = await prisma.book.findUnique({ where: { isbn } });
  if (existingBook !== null) {
    return res.status(400).json({ error: "Book with this ISBN already exists" });
  }

  const book = await prisma.book.create({
    data: { title, author, year, isbn, available: true },
  });

  res.status(201).json({ data: book });
}

export async function updateBook(
  req: Request<BookParams, {}, UpdateBookDto>,
  res: Response,
) {
  const { title, author, year, isbn } = req.body;

  const existingBook = await prisma.book.findUnique({
    where: { id: req.params.id },
  });

  if (existingBook === null) {
    return res.status(404).json({ error: "Book not found" });
  }

  const isbnConflict = await prisma.book.findFirst({
    where: { isbn, NOT: { id: req.params.id } },
  });
  if (isbnConflict !== null) {
    return res.status(400).json({ error: "Book with this ISBN already exists" });
  }

  const updated = await prisma.book.update({
    where: { id: req.params.id },
    data: { title, author, year, isbn },
  });

  res.json({ data: updated });
}

export async function deleteBook(req: Request<BookParams>, res: Response) {
  const book = await prisma.book.findUnique({ where: { id: req.params.id } });

  if (book === null) {
    return res.status(404).json({ error: "Book not found" });
  }

  await prisma.book.delete({ where: { id: req.params.id } });

  res.status(204).end();
}
