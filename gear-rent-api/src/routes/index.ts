import express from "express";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";

import authRoutes from "./auth";
import equipmentRoutes from "./equipment";
import bookingRoutes from "./bookings";
import userRoutes from "./users";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/equipment", equipmentRoutes);
router.use("/bookings", bookingRoutes);
router.use("/users", auth, requireRole("ADMIN"), userRoutes);

export default router;
