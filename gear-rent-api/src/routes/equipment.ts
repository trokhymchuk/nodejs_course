import express from "express";
import * as EquipmentController from "../controllers/equipmentController";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { validate } from "../middleware/validate";
import { upload, resizePhoto } from "../middleware/upload";
import { createEquipmentSchema, updateEquipmentSchema } from "../schemas/equipment.schema";

const router = express.Router();
const jsonParser = express.json();

router.get("/", EquipmentController.getEquipment);
router.get("/my", auth, requireRole("RENTER", "ADMIN"), EquipmentController.getMyEquipment);
router.get("/:id", EquipmentController.getEquipmentById);

router.post(
  "/",
  auth,
  requireRole("RENTER", "ADMIN"),
  jsonParser,
  validate(createEquipmentSchema),
  EquipmentController.createEquipment,
);

router.patch(
  "/:id",
  auth,
  requireRole("RENTER", "ADMIN"),
  jsonParser,
  validate(updateEquipmentSchema),
  EquipmentController.updateEquipment,
);

router.delete("/:id", auth, requireRole("RENTER", "ADMIN"), EquipmentController.deleteEquipment);

router.post(
  "/:id/photo",
  auth,
  requireRole("RENTER", "ADMIN"),
  upload.single("photo"),
  resizePhoto,
  EquipmentController.uploadEquipmentPhoto,
);

export default router;
