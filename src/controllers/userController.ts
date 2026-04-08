import fs from "node:fs/promises";
import path from "node:path";

import type { Request, Response } from "express";
import sharp from "sharp";

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

export async function getAvatar(req: Request, res: Response) {
  const { id } = (req as RequestWithUser).user;

  const user = await prisma.user.findUnique({ where: { id } });

  if (user === null || user.avatarUrl === null) {
    return res.status(404).json({ error: "Avatar not found" });
  }

  res.redirect(user.avatarUrl);
}

export async function uploadAvatar(req: Request, res: Response) {
  const { id } = (req as RequestWithUser).user;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const user = await prisma.user.findUnique({ where: { id } });

  if (user === null) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.avatarUrl !== null) {
    const oldFilePath = path.resolve(user.avatarUrl.slice(1));
    await fs.unlink(oldFilePath).catch(() => {});
  }

  const uploadedPath = req.file.path;
  const filename = req.file.filename;
  const resizedFilename = `resized-${filename}`;
  const resizedPath = path.resolve("uploads", "avatars", resizedFilename);

  await sharp(uploadedPath).resize(200, 200, { fit: "cover" }).toFile(resizedPath);
  await fs.unlink(uploadedPath);

  const avatarUrl = `/uploads/avatars/${resizedFilename}`;

  await prisma.user.update({ where: { id }, data: { avatarUrl } });

  res.json({ message: "Аватарку успішно оновлено.", avatarUrl });
}

export async function deleteAvatar(req: Request, res: Response) {
  const { id } = (req as RequestWithUser).user;

  const user = await prisma.user.findUnique({ where: { id } });

  if (user === null) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.avatarUrl === null) {
    return res.status(404).json({ error: "Avatar not found" });
  }

  const filePath = path.resolve(user.avatarUrl.slice(1));
  await fs.unlink(filePath).catch(() => {});

  await prisma.user.update({ where: { id }, data: { avatarUrl: null } });

  res.json({ message: "Аватарку видалено." });
}
