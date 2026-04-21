import type { Request, Response } from "express";
import prisma from "../lib/prisma";

type UserParams = { id: string };

export async function getUsers(req: Request, res: Response) {
  const page = parseInt((req.query.page as string) ?? "1", 10);
  const limit = parseInt((req.query.limit as string) ?? "20", 10);
  const skip = (page - 1) * limit;

  const [total, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true, updatedAt: true },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  res.json({
    data: users,
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  });
}

export async function getUserById(req: Request<UserParams>, res: Response) {
  const id = parseInt(req.params.id, 10);
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true, updatedAt: true },
  });

  if (user === null) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ data: user });
}

export async function updateUserRole(
  req: Request<UserParams, {}, { role: string }>,
  res: Response,
) {
  const id = parseInt(req.params.id, 10);
  const { role } = req.body;

  const allowedRoles = ["ADMIN", "RENTER", "RENTEE"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (user === null) {
    return res.status(404).json({ message: "User not found" });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role: role as any },
    select: { id: true, name: true, email: true, role: true },
  });

  res.json({ data: updated });
}

export async function deleteUser(req: Request<UserParams>, res: Response) {
  const id = parseInt(req.params.id, 10);

  const user = await prisma.user.findUnique({ where: { id } });
  if (user === null) {
    return res.status(404).json({ message: "User not found" });
  }

  await prisma.user.delete({ where: { id } });
  res.status(204).end();
}
