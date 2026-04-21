import path from "node:path";
import fs from "node:fs/promises";
import type { Request, Response } from "express";
import type { RequestWithUser } from "../middleware/auth";
import type { CreateEquipmentDTO, UpdateEquipmentDTO, GetEquipmentQuery } from "../schemas/equipment.schema";
import { generateUniqueCode, generateQRCode } from "../utils/qrcode";
import prisma from "../lib/prisma";

type EquipmentParams = { id: string };

export async function getEquipment(
  req: Request<{}, {}, {}, GetEquipmentQuery>,
  res: Response,
) {
  const page = parseInt(req.query.page ?? "1", 10);
  const limit = parseInt(req.query.limit ?? "20", 10);
  const skip = (page - 1) * limit;

  const where: Record<string, any> = {};
  if (req.query.category !== undefined) {
    where.category = req.query.category;
  }
  if (req.query.available !== undefined) {
    where.isAvailable = req.query.available === "true";
  }

  const [total, equipment] = await Promise.all([
    prisma.equipment.count({ where }),
    prisma.equipment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { owner: { select: { id: true, name: true, phone: true } } },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  res.json({
    data: equipment,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
}

export async function getEquipmentById(
  req: Request<EquipmentParams>,
  res: Response,
) {
  const id = parseInt(req.params.id, 10);
  const equipment = await prisma.equipment.findUnique({
    where: { id },
    include: { owner: { select: { id: true, name: true, phone: true } } },
  });

  if (equipment === null) {
    return res.status(404).json({ message: "Equipment not found" });
  }

  res.json({ data: equipment });
}

export async function getMyEquipment(req: Request, res: Response) {
  const ownerId = (req as unknown as RequestWithUser).user.id;
  const page = parseInt((req.query.page as string) ?? "1", 10);
  const limit = parseInt((req.query.limit as string) ?? "20", 10);
  const skip = (page - 1) * limit;

  const [total, equipment] = await Promise.all([
    prisma.equipment.count({ where: { ownerId } }),
    prisma.equipment.findMany({
      where: { ownerId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  res.json({
    data: equipment,
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  });
}

export async function createEquipment(
  req: Request<{}, {}, CreateEquipmentDTO>,
  res: Response,
) {
  const ownerId = (req as unknown as RequestWithUser).user.id;
  const { name, description, category, pricePerDay } = req.body;

  const uniqueCode = generateUniqueCode();
  const qrCode = await generateQRCode(uniqueCode);

  const equipment = await prisma.equipment.create({
    data: { name, description, category, pricePerDay, uniqueCode, qrCode, ownerId },
  });

  res.status(201).json({ data: equipment });
}

export async function updateEquipment(
  req: Request<EquipmentParams, {}, UpdateEquipmentDTO>,
  res: Response,
) {
  const id = parseInt(req.params.id, 10);
  const user = (req as unknown as RequestWithUser).user;

  const equipment = await prisma.equipment.findUnique({ where: { id } });
  if (equipment === null) {
    return res.status(404).json({ message: "Equipment not found" });
  }

  if (user.role !== "ADMIN" && equipment.ownerId !== user.id) {
    return res.status(403).json({ message: "Forbidden: you do not own this equipment" });
  }

  const updated = await prisma.equipment.update({
    where: { id },
    data: req.body,
  });

  res.json({ data: updated });
}

export async function deleteEquipment(
  req: Request<EquipmentParams>,
  res: Response,
) {
  const id = parseInt(req.params.id, 10);
  const user = (req as unknown as RequestWithUser).user;

  const equipment = await prisma.equipment.findUnique({ where: { id } });
  if (equipment === null) {
    return res.status(404).json({ message: "Equipment not found" });
  }

  if (user.role !== "ADMIN" && equipment.ownerId !== user.id) {
    return res.status(403).json({ message: "Forbidden: you do not own this equipment" });
  }

  if (equipment.photoUrl !== null && equipment.photoUrl !== undefined) {
    const photoPath = path.join(__dirname, "..", equipment.photoUrl.replace(/^\/uploads\//, "uploads/"));
    await fs.unlink(photoPath).catch(() => {});
  }

  await prisma.equipment.delete({ where: { id } });
  res.status(204).end();
}

export async function uploadEquipmentPhoto(
  req: Request<EquipmentParams>,
  res: Response,
) {
  const id = parseInt(req.params.id, 10);
  const user = (req as unknown as RequestWithUser).user;

  const equipment = await prisma.equipment.findUnique({ where: { id } });
  if (equipment === null) {
    return res.status(404).json({ message: "Equipment not found" });
  }

  if (user.role !== "ADMIN" && equipment.ownerId !== user.id) {
    return res.status(403).json({ message: "Forbidden: you do not own this equipment" });
  }

  if (req.file === undefined) {
    return res.status(400).json({ message: "No photo provided" });
  }

  if (equipment.photoUrl !== null && equipment.photoUrl !== undefined) {
    const oldPath = path.join(__dirname, "..", equipment.photoUrl.replace(/^\/uploads\//, "uploads/"));
    await fs.unlink(oldPath).catch(() => {});
  }

  const photoUrl = `/uploads/${req.file.filename}`;
  const updated = await prisma.equipment.update({
    where: { id },
    data: { photoUrl },
  });

  res.json({ data: updated });
}
