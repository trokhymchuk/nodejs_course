import type { Request, Response } from "express";
import type { RequestWithUser } from "../middleware/auth";
import type { CreateBookingDTO, UpdateBookingStatusDTO } from "../schemas/booking.schema";
import prisma from "../lib/prisma";

type BookingParams = { id: string };

export async function getBookings(req: Request, res: Response) {
  const user = (req as unknown as RequestWithUser).user;
  const page = parseInt((req.query.page as string) ?? "1", 10);
  const limit = parseInt((req.query.limit as string) ?? "20", 10);
  const skip = (page - 1) * limit;

  let where: Record<string, any> = {};

  if (user.role === "RENTEE") {
    where = { renteeId: user.id };
  } else if (user.role === "RENTER") {
    where = { equipment: { ownerId: user.id } };
  }

  const [total, bookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        equipment: { select: { id: true, name: true, uniqueCode: true, photoUrl: true, pricePerDay: true } },
        rentee: { select: { id: true, name: true, email: true, phone: true } },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  res.json({
    data: bookings,
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  });
}

export async function getBookingById(
  req: Request<BookingParams>,
  res: Response,
) {
  const id = parseInt(req.params.id, 10);
  const user = (req as unknown as RequestWithUser).user;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      equipment: { include: { owner: { select: { id: true, name: true, phone: true } } } },
      rentee: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  if (booking === null) {
    return res.status(404).json({ message: "Booking not found" });
  }

  const isRentee = user.role === "RENTEE" && booking.renteeId !== user.id;
  const isRenter = user.role === "RENTER" && booking.equipment.ownerId !== user.id;

  if (isRentee || isRenter) {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.json({ data: booking });
}

export async function createBooking(
  req: Request<{}, {}, CreateBookingDTO>,
  res: Response,
) {
  const renteeId = (req as unknown as RequestWithUser).user.id;
  const { equipmentId, startDate, endDate, notes } = req.body;

  const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
  if (equipment === null) {
    return res.status(404).json({ message: "Equipment not found" });
  }

  if (!equipment.isAvailable) {
    return res.status(409).json({ message: "Equipment is not available" });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      equipmentId,
      status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
      AND: [
        { startDate: { lte: end } },
        { endDate: { gte: start } },
      ],
    },
  });

  if (conflictingBooking !== null) {
    return res.status(409).json({ message: "Equipment is already booked for these dates" });
  }

  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const totalPrice = days * equipment.pricePerDay;

  const booking = await prisma.booking.create({
    data: {
      equipmentId,
      renteeId,
      startDate: start,
      endDate: end,
      totalPrice,
      notes,
    },
    include: {
      equipment: { select: { id: true, name: true, uniqueCode: true } },
    },
  });

  res.status(201).json({ data: booking });
}

export async function updateBookingStatus(
  req: Request<BookingParams, {}, UpdateBookingStatusDTO>,
  res: Response,
) {
  const id = parseInt(req.params.id, 10);
  const user = (req as unknown as RequestWithUser).user;
  const { status } = req.body;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { equipment: true },
  });

  if (booking === null) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (user.role === "RENTER" && booking.equipment.ownerId !== user.id) {
    return res.status(403).json({ message: "Forbidden: this booking is not for your equipment" });
  }

  if (user.role === "RENTEE") {
    if (booking.renteeId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (status !== "CANCELLED") {
      return res.status(403).json({ message: "Rentee can only cancel bookings" });
    }
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status },
  });

  res.json({ data: updated });
}

export async function cancelBooking(
  req: Request<BookingParams>,
  res: Response,
) {
  const id = parseInt(req.params.id, 10);
  const user = (req as unknown as RequestWithUser).user;

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (booking === null) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (user.role !== "ADMIN" && booking.renteeId !== user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
    return res.status(409).json({ message: `Cannot cancel a booking with status: ${booking.status}` });
  }

  await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  res.status(204).end();
}
