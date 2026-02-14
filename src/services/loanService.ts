import crypto from "crypto";
import fs from "fs";
import path from "path";

import type { Loan } from "../types/loan";
import type { CreateLoanDto } from "../schemas/loan.schema";
import type { BookService } from "./bookService";
import type { UserService } from "./userService";

const loansSaveFilePath = path.resolve("data", "loans.json");

type ServiceResult<T> =
  | { data: T; error?: undefined }
  | { error: string; status: number; data?: undefined };

export class LoanService {
  private loans: Loan[] = [];

  constructor(
    private bookService: BookService,
    private userService: UserService,
  ) {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      const raw = fs.readFileSync(loansSaveFilePath, "utf-8");
      this.loans = (JSON.parse(raw) as Loan[]).map((loan) => ({
        ...loan,
        loanDate: new Date(loan.loanDate),
        returnDate: loan.returnDate ? new Date(loan.returnDate) : null,
      }));
    } catch {
      this.loans = [];
    }
  }

  private saveToDisk(): void {
    fs.mkdirSync(path.dirname(loansSaveFilePath), { recursive: true });
    fs.writeFileSync(loansSaveFilePath, JSON.stringify(this.loans, null, 2));
  }

  getAll(): Loan[] {
    return this.loans;
  }

  create(dto: CreateLoanDto): ServiceResult<Loan> {
    const { userId, bookId } = dto;

    const userResult = this.userService.getById(userId);
    if (!userResult.data) {
      return { error: "User not found", status: 400 };
    }

    const bookResult = this.bookService.getById(bookId);
    if (!bookResult.data) {
      return { error: "Book not found", status: 400 };
    }

    if (!bookResult.data.available) {
      return { error: "Book is not available", status: 400 };
    }

    const activeLoan = this.loans.find(
      (loan) => loan.bookId === bookId && loan.status === "ACTIVE",
    );
    if (activeLoan) {
      return { error: "Book already has an active loan", status: 400 };
    }

    const loan: Loan = {
      id: crypto.randomUUID(),
      userId,
      bookId,
      loanDate: new Date(),
      returnDate: null,
      status: "ACTIVE",
    };

    this.loans.push(loan);
    this.bookService.setAvailable(bookId, false);
    this.saveToDisk();

    return { data: loan };
  }

  returnLoan(id: string): ServiceResult<Loan> {
    const loan = this.loans.find((loan) => loan.id === id);

    if (typeof loan === "undefined") {
      return { error: "Loan not found", status: 400 };
    }

    if (loan.status === "RETURNED") {
      return { error: "Loan already returned", status: 400 };
    }

    loan.status = "RETURNED";
    loan.returnDate = new Date();

    this.bookService.setAvailable(loan.bookId, true);
    this.saveToDisk();

    return { data: loan };
  }
}
