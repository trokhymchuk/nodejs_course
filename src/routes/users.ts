import express from "express";

import * as UserController from "../controllers/userController";

import { validate } from "../middleware/validate";
import { createUserSchema } from "../schemas/user.schema";

const router = express.Router();
const jsonParser = express.json();

router.get("/", UserController.getUsers);

router.get("/:id", UserController.getUserById);

router.post(
  "/",
  jsonParser,
  validate(createUserSchema),
  UserController.createUser,
);

export default router;
