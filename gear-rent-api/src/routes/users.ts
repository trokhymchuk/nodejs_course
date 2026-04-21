import express from "express";
import * as UserController from "../controllers/userController";
import { validate } from "../middleware/validate";
import * as z from "zod";

const router = express.Router();
const jsonParser = express.json();

const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "RENTER", "RENTEE"]),
});

router.get("/", UserController.getUsers);
router.get("/:id", UserController.getUserById);
router.patch("/:id/role", jsonParser, validate(updateRoleSchema), UserController.updateUserRole);
router.delete("/:id", UserController.deleteUser);

export default router;
