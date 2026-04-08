import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { StringValue } from "ms";
import ms from "ms";

import type { Request, Response, NextFunction } from "express";

import type {
  RegisterDTO,
  LoginDTO,
  RefreshTokenDTO,
  RequestPasswordResetDTO,
  ResetPasswordDTO,
} from "../schemas/auth.schema";
import prisma from "../db/prisma";
import CONFIG from "../config";
import sendMail from "../utils/sendMail";

function generateTokens(user: { id: string; email: string; role: string }) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    CONFIG.jwtSecret,
    { expiresIn: CONFIG.jwtExpiresIn as StringValue },
  );

  const refreshToken = randomBytes(40).toString("hex");

  return { accessToken, refreshToken };
}

export async function register(req: Request<{}, {}, RegisterDTO>, res: Response) {
  const { name, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser !== null) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name, email, passwordHash },
  });

  res.status(201).json({ message: "Registration completed" });
}

export async function login(req: Request<{}, {}, LoginDTO>, res: Response) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user === null) {
    return res.status(401).json({ message: "Email or password is incorrect" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (isPasswordValid !== true) {
    return res.status(401).json({ message: "Email or password is incorrect" });
  }

  const { accessToken, refreshToken } = generateTokens(user);

  const expiresAt = new Date(Date.now() + ms(CONFIG.jwtRefreshExpiresIn as StringValue));

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
  });
}

export async function refresh(req: Request<{}, {}, RefreshTokenDTO>, res: Response) {
  const { refreshToken } = req.body;

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (stored === null) {
    return res.status(401).json({ message: "Refresh token is not valid" });
  }

  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    return res.status(401).json({ message: "Refresh token is expired" });
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(stored.user);

  const expiresAt = new Date(Date.now() + ms(CONFIG.jwtRefreshExpiresIn as StringValue));

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { token: newRefreshToken, expiresAt },
  });

  res.json({ accessToken, refreshToken: newRefreshToken });
}

export async function logout(req: Request<{}, {}, RefreshTokenDTO>, res: Response) {
  const { refreshToken } = req.body;

  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });

  res.json({ message: "Logged out successfully" });
}

export async function requestPasswordReset(
  req: Request<{}, {}, RequestPasswordResetDTO>,
  res: Response,
) {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user !== null) {
    const token = jwt.sign({ email: user.email }, CONFIG.jwtSecret, {
      expiresIn: "10m",
    });

    await sendMail({
      to: user.email,
      subject: "Library — Password Reset",
      text: `To reset your password, use this token: ${token}`,
      html: `<p>To reset your password, send a POST request to <code>/auth/reset-password</code> with this token:</p><pre>${token}</pre><p>The token expires in 10 minutes.</p>`,
    });
  }

  res.json({ message: "Якщо вказаний email зареєстрований, лист з інструкціями надіслано." });
}

export async function resetPassword(
  req: Request<{}, {}, ResetPasswordDTO>,
  res: Response,
  next: NextFunction,
) {
  const { token, password } = req.body;

  jwt.verify(token, CONFIG.jwtSecret, async (err, decoded) => {
    if (err) {
      if (err.name === "JsonWebTokenError") {
        return res.status(400).json({ message: "Token is not valid" });
      }

      if (err.name === "TokenExpiredError") {
        return res.status(400).json({ message: "Token is expired" });
      }

      return next(err);
    }

    const email = (decoded as { email: string }).email;
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    res.json({ message: "Пароль успішно змінено." }); // i don't want to send ukrainian :(((((
  });
}
