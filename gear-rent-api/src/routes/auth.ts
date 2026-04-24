import express from "express";
import {
  registerController,
  loginController,
  changePasswordController,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/authController";
import { auth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas/auth.schema";

const router = express.Router();
const jsonParser = express.json();

router.post("/register", jsonParser, validate(registerSchema), registerController);
router.post("/login", jsonParser, validate(loginSchema), loginController);
router.patch("/password", auth, jsonParser, validate(changePasswordSchema), changePasswordController);
router.post("/forgot-password", jsonParser, validate(forgotPasswordSchema), forgotPasswordController);
router.post("/reset-password", jsonParser, validate(resetPasswordSchema), resetPasswordController);

export default router;
