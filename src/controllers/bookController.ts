import type { Request, Response } from "express";

import type { CreateBookDto, UpdateBookDto } from "../schemas/book.schema";
import { bookService } from "../services";

type BookParams = {
  id: string;
};

export function getBooks(req: Request, res: Response) {
  res.json({ data: bookService.getAll() });
}

export function getBookById(req: Request<BookParams>, res: Response) {
  const result = bookService.getById(req.params.id);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.json({ data: result.data });
}

export function createBook(
  req: Request<{}, {}, CreateBookDto>,
  res: Response,
) {
  const result = bookService.create(req.body);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(201).json({ data: result.data });
}

export function updateBook(
  req: Request<BookParams, {}, UpdateBookDto>,
  res: Response,
) {
  const result = bookService.update(req.params.id, req.body);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.json({ data: result.data });
}

export function deleteBook(req: Request<BookParams>, res: Response) {
  const result = bookService.delete(req.params.id);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(204).end();
}
