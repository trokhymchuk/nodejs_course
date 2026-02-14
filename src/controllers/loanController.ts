import type { Request, Response } from "express";

import type { CreateLoanDto } from "../schemas/loan.schema";
import { loanService } from "../services";

type LoanParams = {
  id: string;
};

export function getLoans(req: Request, res: Response) {
  res.json({ data: loanService.getAll() });
}

export function createLoan(
  req: Request<{}, {}, CreateLoanDto>,
  res: Response,
) {
  const result = loanService.create(req.body);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(201).json({ data: result.data });
}

export function returnLoan(req: Request<LoanParams>, res: Response) {
  const result = loanService.returnLoan(req.params.id);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.json({ data: result.data });
}
