import type { Request, Response } from "express";

import type { CreateLoanDto } from "../schemas/loan.schema";
import prisma from "../db/prisma";
import type { RequestWithUser } from "../middleware/auth.middleware";

type LoanParams = {
  id: string;
};

export async function getLoans(req: Request, res: Response) {
  const { id, role } = (req as RequestWithUser).user;

  const loans = await prisma.loan.findMany({
    where: role === "ADMIN" ? {} : { userId: id },
  });

  res.json({ data: loans });
}

export async function createLoan(
  req: Request<{}, {}, CreateLoanDto>,
  res: Response,
) {
  const { bookId } = req.body;
  const userId = (req as RequestWithUser).user.id;

  const book = await prisma.book.findUnique({ where: { id: bookId } });

  if (book === null) {
    return res.status(400).json({ error: "Book not found" });
  }

  if (!book.available) {
    return res.status(400).json({ error: "Book is not available" });
  }

  const [loan] = await prisma.$transaction([
    prisma.loan.create({
      data: {
        userId,
        bookId,
        status: "ACTIVE",
      },
    }),
    prisma.book.update({
      where: { id: bookId },
      data: { available: false },
    }),
  ]);

  res.status(201).json({ data: loan });
}

export async function returnLoan(req: Request<LoanParams>, res: Response) {
  const loan = await prisma.loan.findUnique({ where: { id: req.params.id } });

  if (loan === null) {
    return res.status(404).json({ error: "Loan not found" });
  }

  if (loan.status === "RETURNED") {
    return res.status(400).json({ error: "Loan already returned" });
  }

  const [updatedLoan] = await prisma.$transaction([
    prisma.loan.update({
      where: { id: req.params.id },
      data: { status: "RETURNED", returnDate: new Date() },
    }),
    prisma.book.update({
      where: { id: loan.bookId },
      data: { available: true },
    }),
  ]);

  res.json({ data: updatedLoan });
}
