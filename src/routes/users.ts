import express from "express";

import * as UserController from "../controllers/userController";
import { auth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = express.Router();

router.get("/me", auth, UserController.getMe);

router.get("/", auth, requireRole("ADMIN"), UserController.getUsers);

router.get("/:id", auth, requireRole("ADMIN"), UserController.getUserById);

export default router;
