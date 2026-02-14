import type { Request, Response } from "express";

import type { CreateUserDto } from "../schemas/user.schema";
import { userService } from "../services";

type UserParams = {
  id: string;
};

export function getUsers(req: Request, res: Response) {
  res.json({ data: userService.getAll() });
}

export function getUserById(req: Request<UserParams>, res: Response) {
  const result = userService.getById(req.params.id);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.json({ data: result.data });
}

export function createUser(
  req: Request<{}, {}, CreateUserDto>,
  res: Response,
) {
  const result = userService.create(req.body);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(201).json({ data: result.data });
}
