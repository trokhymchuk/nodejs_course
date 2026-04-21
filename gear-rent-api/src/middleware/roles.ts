import type { Request, Response, NextFunction } from "express";
import type { RequestWithUser } from "./auth";

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as RequestWithUser).user;

    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }

    next();
  };
}
