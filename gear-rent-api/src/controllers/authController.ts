import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import type { RegisterDTO, LoginDTO, ChangePasswordDTO, ForgotPasswordDTO, ResetPasswordDTO } from "../schemas/auth.schema";
import type { RequestWithUser } from "../middleware/auth";
import prisma from "../lib/prisma";
import CONFIG from "../config";
import { randomBytes } from "node:crypto";
import { sendPasswordChangedEmail, sendPasswordResetEmail } from "../services/email";

export async function registerController(
  req: Request<{}, {}, RegisterDTO>,
  res: Response,
) {
  const { name, email, password, phone, role } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser !== null) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name, email, password: hashedPassword, phone, role: role ?? "RENTEE" },
  });

  res.json({ message: "Registration completed" });
}

export async function loginController(
  req: Request<{}, {}, LoginDTO>,
  res: Response,
) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (user === null) {
    return res.status(401).json({ message: "Email or password is incorrect" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (isPasswordValid !== true) {
    return res.status(401).json({ message: "Email or password is incorrect" });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    CONFIG.jwtSecret,
    { expiresIn: CONFIG.jwtExpiresIn as any },
  );

  res.json({ data: { accessToken: token } });
}

export async function changePasswordController(
  req: Request<{}, {}, ChangePasswordDTO>,
  res: Response,
) {
  const { id } = (req as unknown as RequestWithUser).user;
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id } });
  if (user === null) {
    return res.status(404).json({ message: "User not found" });
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id }, data: { password: hashedPassword } });

  await sendPasswordChangedEmail(user.email, user.name);

  res.json({ message: "Password changed successfully" });
}

export async function forgotPasswordController(
  req: Request<{}, {}, ForgotPasswordDTO>,
  res: Response,
) {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond 200 to prevent email enumeration
  if (user === null) {
    return res.json({ message: "If that email exists, a reset code has been sent" });
  }

  const code = randomBytes(3).toString("hex").toUpperCase(); // 6-char hex code
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.user.update({
    where: { email },
    data: { resetToken: code, resetTokenExpiry: expiry },
  });

  await sendPasswordResetEmail(email, user.name, code);

  res.json({ message: "If that email exists, a reset code has been sent" });
}

export async function resetPasswordController(
  req: Request<{}, {}, ResetPasswordDTO>,
  res: Response,
) {
  const { email, code, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (user === null || user.resetToken === null || user.resetTokenExpiry === null) {
    return res.status(400).json({ message: "Invalid or expired reset code" });
  }

  if (user.resetToken !== code) {
    return res.status(400).json({ message: "Invalid or expired reset code" });
  }

  if (user.resetTokenExpiry < new Date()) {
    return res.status(400).json({ message: "Invalid or expired reset code" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
  });

  res.json({ message: "Password reset successfully" });
}
