import express from "express";

import * as UserController from "../controllers/userController";
import { auth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { uploadAvatar } from "../middleware/upload.middleware";

const router = express.Router();

router.get("/me", auth, UserController.getMe);

router.get("/me/avatar", auth, UserController.getAvatar);

router.post("/me/avatar", auth, uploadAvatar, UserController.uploadAvatar);

router.delete("/me/avatar", auth, UserController.deleteAvatar);

router.get("/", auth, requireRole("ADMIN"), UserController.getUsers);

router.get("/:id", auth, requireRole("ADMIN"), UserController.getUserById);

export default router;
