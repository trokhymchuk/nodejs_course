import express from "express";

import bookRoutes from "./books";
import userRoutes from "./users";
import loanRoutes from "./loans";

const router = express.Router();

router.use("/books", bookRoutes);
router.use("/users", userRoutes);
router.use("/loans", loanRoutes);

export default router;
