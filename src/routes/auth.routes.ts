import express from "express";

import * as AuthController from "../controllers/authController";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema, refreshTokenSchema } from "../schemas/auth.schema";

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

export default router;
