import express from "express";
import * as BookingController from "../controllers/bookingController";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { validate } from "../middleware/validate";
import { createBookingSchema, updateBookingStatusSchema } from "../schemas/booking.schema";

const router = express.Router();
const jsonParser = express.json();

router.get("/", auth, BookingController.getBookings);
router.get("/:id", auth, BookingController.getBookingById);

router.post(
  "/",
  auth,
  requireRole("RENTEE"),
  jsonParser,
  validate(createBookingSchema),
  BookingController.createBooking,
);

router.patch(
  "/:id/status",
  auth,
  requireRole("RENTER", "ADMIN", "RENTEE"),
  jsonParser,
  validate(updateBookingStatusSchema),
  BookingController.updateBookingStatus,
);

router.delete("/:id", auth, requireRole("RENTEE", "ADMIN"), BookingController.cancelBooking);

export default router;
