import crypto from "crypto";
import fs from "fs";
import path from "path";

import type { User } from "../types/user";
import type { CreateUserDto } from "../schemas/user.schema";

const usersSaveFilePath = path.resolve("data", "users.json");

type ServiceResult<T> =
  | { data: T; error?: undefined }
  | { error: string; status: number; data?: undefined };

export class UserService {
  private users: User[] = [];

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      const raw = fs.readFileSync(usersSaveFilePath, "utf-8");
      this.users = JSON.parse(raw);
    } catch {
      this.users = [];
    }
  }

  private saveToDisk(): void {
    fs.mkdirSync(path.dirname(usersSaveFilePath), { recursive: true });
    fs.writeFileSync(usersSaveFilePath, JSON.stringify(this.users, null, 2));
  }

  getAll(): User[] {
    return this.users;
  }

  getById(id: string): ServiceResult<User> {
    const user = this.users.find((user) => user.id === id);

    if (typeof user === "undefined") {
      return { error: "User not found", status: 400 };
    }

    return { data: user };
  }

  create(dto: CreateUserDto): ServiceResult<User> {
    const { name, email } = dto;

    const user: User = {
      id: crypto.randomUUID(),
      name,
      email,
    };

    this.users.push(user);
    this.saveToDisk();

    return { data: user };
  }
}
