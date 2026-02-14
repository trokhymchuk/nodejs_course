import crypto from "crypto";
import fs from "fs";
import path from "path";

import type { Book } from "../types/book";
import type { CreateBookDto, UpdateBookDto } from "../schemas/book.schema";

const booksSaveFilePath = path.resolve("data", "books.json");

type ServiceResult<T> =
  | { data: T; error?: undefined }
  | { error: string; status: number; data?: undefined };

export class BookService {
  private books: Book[] = [];

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      const raw = fs.readFileSync(booksSaveFilePath, "utf-8");
      this.books = JSON.parse(raw);
    } catch {
      this.books = [];
    }
  }

  private saveToDisk(): void {
    fs.mkdirSync(path.dirname(booksSaveFilePath), { recursive: true });
    fs.writeFileSync(booksSaveFilePath, JSON.stringify(this.books, null, 2));
  }

  getAll(): Book[] {
    return this.books;
  }

  getById(id: string): ServiceResult<Book> {
    const book = this.books.find((book) => book.id === id);

    if (typeof book === "undefined") {
      return { error: "Book not found", status: 400 };
    }

    return { data: book };
  }

  create(dto: CreateBookDto): ServiceResult<Book> {
    const { title, author, year, isbn } = dto;

    const existingBook = this.books.find((book) => book.isbn === isbn);
    if (existingBook) {
      return { error: "Book with this ISBN already exists", status: 400 };
    }

    const book: Book = {
      id: crypto.randomUUID(),
      title,
      author,
      year,
      isbn,
      available: true,
    };

    this.books.push(book);
    this.saveToDisk();

    return { data: book };
  }

  update(id: string, dto: UpdateBookDto): ServiceResult<Book> {
    const bookIndex = this.books.findIndex((book) => book.id === id);

    if (bookIndex === -1) {
      return { error: "Book not found", status: 400 };
    }

    const { title, author, year, isbn } = dto;

    const isbnConflict = this.books.find(
      (book) => book.isbn === isbn && book.id !== id,
    );
    if (isbnConflict) {
      return { error: "Book with this ISBN already exists", status: 400 };
    }

    const updatedBook: Book = {
      ...this.books[bookIndex],
      title,
      author,
      year,
      isbn,
    };
    this.books[bookIndex] = updatedBook;
    this.saveToDisk();

    return { data: updatedBook };
  }

  delete(id: string): ServiceResult<null> {
    const bookIndex = this.books.findIndex((book) => book.id === id);

    if (bookIndex === -1) {
      return { error: "Book not found", status: 400 };
    }

    this.books.splice(bookIndex, 1);
    this.saveToDisk();

    return { data: null };
  }

  setAvailable(id: string, available: boolean): void {
    const book = this.books.find((book) => book.id === id);
    if (book) {
      book.available = available;
      this.saveToDisk();
    }
  }
}
