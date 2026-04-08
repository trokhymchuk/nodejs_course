import multer from "multer";
import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Maximum size is 5 MB" });
    }
    return res.status(400).json({ error: err.message });
  }

  if (err.message === "Only JPEG and PNG images are allowed") {
    return res.status(400).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
}
