import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const destination = path.resolve(__dirname, "uploads");
    cb(null, destination);
  },
  filename: (_req, file, cb) => {
    const extname = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extname);
    const uuid = randomUUID();
    const filename = `${basename}.${uuid}${extname}`;
    cb(null, filename);
  },
});

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

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
