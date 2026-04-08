import express from "express";

import * as AuthController from "../controllers/authController";
import { validate } from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "../schemas/auth.schema";

const router = express.Router();
const jsonParser = express.json();

router.post(
  "/register",
  jsonParser,
  validate(registerSchema),
  AuthController.register,
);

router.post(
  "/login",
  jsonParser,
  validate(loginSchema),
  AuthController.login,
);

router.post(
  "/refresh",
  jsonParser,
  validate(refreshTokenSchema),
  AuthController.refresh,
);

router.post(
  "/logout",
  jsonParser,
  validate(refreshTokenSchema),
  AuthController.logout,
);

router.post(
  "/request-password-reset",
  jsonParser,
  validate(requestPasswordResetSchema),
  AuthController.requestPasswordReset,
);

router.post(
  "/reset-password",
  jsonParser,
  validate(resetPasswordSchema),
  AuthController.resetPassword,
);

export default router;
