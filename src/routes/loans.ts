import express from "express";

import * as LoanController from "../controllers/loanController";

import { validate } from "../middleware/validate";
import { createLoanSchema } from "../schemas/loan.schema";

const router = express.Router();
const jsonParser = express.json();

router.get("/", LoanController.getLoans);

router.post(
  "/",
  jsonParser,
  validate(createLoanSchema),
  LoanController.createLoan,
);

router.post("/:id/return", LoanController.returnLoan);

export default router;
