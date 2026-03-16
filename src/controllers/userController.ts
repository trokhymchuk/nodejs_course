import type { Request, Response } from "express";

import prisma from "../db/prisma";
import type { RequestWithUser } from "../middleware/auth.middleware";

type UserParams = {
  id: string;
};

function omitPasswordHash<T extends { passwordHash: string }>(
  user: T,
): Omit<T, "passwordHash"> {
  const { passwordHash, ...rest } = user;
  return rest;
}

export async function getUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany();
  res.json({ data: users.map(omitPasswordHash) });
}

export async function getUserById(req: Request<UserParams>, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });

  if (user === null) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ data: omitPasswordHash(user) });
}

export async function getMe(req: Request, res: Response) {
  const { id } = (req as RequestWithUser).user;

  const user = await prisma.user.findUnique({ where: { id } });

  if (user === null) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ data: omitPasswordHash(user) });
}
