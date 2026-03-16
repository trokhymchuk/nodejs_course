import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("admin1234", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@trokhymchuk.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@trokhymchuk.com",
      role: "ADMIN",
      passwordHash,
    },
  });

  console.log(`Admin seeded: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
