import type { Request, Response, NextFunction } from "express";

import type { RequestWithUser } from "./auth.middleware";

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as RequestWithUser).user;

    if (user.role !== role) {
      return res.status(403).json({ message: "Action is not allowed" });
    }

    next();
  };
}
