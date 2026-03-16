import express from "express";

import authRoutes from "./auth.routes";
import bookRoutes from "./books";
import userRoutes from "./users";
import loanRoutes from "./loans";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/books", bookRoutes);
router.use("/users", userRoutes);
router.use("/loans", loanRoutes);

export default router;
