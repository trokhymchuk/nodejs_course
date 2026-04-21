import QRCode from "qrcode";
import { randomBytes } from "node:crypto";

export async function generateQRCode(text: string): Promise<string> {
  return QRCode.toDataURL(text);
}

export function generateUniqueCode(): string {
  return `GEAR-${randomBytes(4).toString("hex").toUpperCase()}`;
}
