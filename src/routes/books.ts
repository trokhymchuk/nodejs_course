import express from "express";

import * as BookController from "../controllers/bookController";
import { validate } from "../middleware/validate";
import { auth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { createBookSchema, updateBookSchema } from "../schemas/book.schema";

const router = express.Router();
const jsonParser = express.json();

router.get("/", BookController.getBooks);

router.get("/:id", BookController.getBookById);

router.post(
  "/",
  auth,
  requireRole("ADMIN"),
  jsonParser,
  validate(createBookSchema),
  BookController.createBook,
);

router.put(
  "/:id",
  auth,
  requireRole("ADMIN"),
  jsonParser,
  validate(updateBookSchema),
  BookController.updateBook,
);

router.delete("/:id", auth, requireRole("ADMIN"), BookController.deleteBook);

export default router;
