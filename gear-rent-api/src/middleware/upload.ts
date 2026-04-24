import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import sharp from "sharp";
import type { Request, Response, NextFunction } from "express";

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export async function resizePhoto(req: Request, _res: Response, next: NextFunction) {
  if (req.file === undefined) return next();

  const filename = `${randomUUID()}.webp`;
  const outputPath = path.resolve(__dirname, "..", "uploads", filename);

  await sharp(req.file.buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(outputPath);

  req.file.filename = filename;
  req.file.path = outputPath;

  next();
}
