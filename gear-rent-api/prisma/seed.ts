import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";
import { generateUniqueCode, generateQRCode } from "../src/utils/qrcode";

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.booking.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("password", 12);
  const admin = await prisma.user.create({
    data: {
      name: "Artem Trokhymchuk",
      email: "artem@trokhymchuk.com",
      password: adminPassword,
      role: "ADMIN",
      phone: "+380991234567",
    },
  });

  const renterPassword = await bcrypt.hash("password", 12);
  const renter = await prisma.user.create({
    data: {
      name: "Ivan Kovalenko",
      email: "ivan@renter.com",
      password: renterPassword,
      role: "RENTER",
      phone: "+380997654321",
    },
  });

  const renteePassword = await bcrypt.hash("password", 12);
  const rentee1 = await prisma.user.create({
    data: {
      name: "Olena Sydorenko",
      email: "olena@rentee.com",
      password: renteePassword,
      role: "RENTEE",
      phone: "+380993456789",
    },
  });

  const rentee2 = await prisma.user.create({
    data: {
      name: "Dmytro Petrenko",
      email: "dmytro@rentee.com",
      password: await bcrypt.hash("password", 12),
      role: "RENTEE",
      phone: "+380991122334",
    },
  });

  const equipmentData = [
    {
      name: "Atomic Redster X9 Skis",
      description: "High-performance race skis for advanced skiers. Length 170cm.",
      category: "SKIS" as const,
      pricePerDay: 25.0,
      ownerId: admin.id,
    },
    {
      name: "Burton Custom Snowboard",
      description: "All-mountain freestyle snowboard. Length 158cm, great for all conditions.",
      category: "SNOWBOARD" as const,
      pricePerDay: 30.0,
      ownerId: admin.id,
    },
    {
      name: "Salomon X Access 80 Ski Boots",
      description: "Comfortable all-mountain ski boots. Size EU 42.",
      category: "BOOTS" as const,
      pricePerDay: 15.0,
      ownerId: admin.id,
    },
    {
      name: "Leki Carbon Ski Poles",
      description: "Lightweight carbon fibre poles. Adjustable 105-135cm.",
      category: "POLES" as const,
      pricePerDay: 5.0,
      ownerId: admin.id,
    },
    {
      name: "Smith Vantage MIPS Helmet",
      description: "MIPS-equipped ski helmet for maximum protection. Size M.",
      category: "HELMET" as const,
      pricePerDay: 8.0,
      ownerId: renter.id,
    },
    {
      name: "Oakley Flight Deck Goggles",
      description: "Wide-view goggles with Prizm Snow lens, fits most helmets.",
      category: "GOGGLES" as const,
      pricePerDay: 10.0,
      ownerId: renter.id,
    },
    {
      name: "The North Face Ski Jacket",
      description: "Waterproof insulated ski jacket. Size L, red colour.",
      category: "CLOTHING" as const,
      pricePerDay: 20.0,
      ownerId: renter.id,
    },
    {
      name: "Rossignol Experience 88 Skis",
      description: "Versatile all-mountain skis suitable for intermediate skiers. Length 162cm.",
      category: "SKIS" as const,
      pricePerDay: 20.0,
      ownerId: admin.id,
    },
  ];

  const equipment = await Promise.all(
    equipmentData.map(async (data) => {
      const uniqueCode = generateUniqueCode();
      const qrCode = await generateQRCode(uniqueCode);
      return prisma.equipment.create({ data: { ...data, uniqueCode, qrCode } });
    }),
  );

  const today = new Date();
  const d = (offset: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    return date;
  };

  await prisma.booking.createMany({
    data: [
      {
        equipmentId: equipment[0].id,
        renteeId: rentee1.id,
        startDate: d(-5),
        endDate: d(-2),
        totalPrice: equipment[0].pricePerDay * 3,
        status: "COMPLETED",
        notes: "Returned in good condition",
      },
      {
        equipmentId: equipment[1].id,
        renteeId: rentee1.id,
        startDate: d(1),
        endDate: d(4),
        totalPrice: equipment[1].pricePerDay * 3,
        status: "CONFIRMED",
      },
      {
        equipmentId: equipment[2].id,
        renteeId: rentee2.id,
        startDate: d(0),
        endDate: d(3),
        totalPrice: equipment[2].pricePerDay * 3,
        status: "ACTIVE",
      },
      {
        equipmentId: equipment[4].id,
        renteeId: rentee2.id,
        startDate: d(7),
        endDate: d(10),
        totalPrice: equipment[4].pricePerDay * 3,
        status: "PENDING",
        notes: "Please include helmet bag",
      },
      {
        equipmentId: equipment[6].id,
        renteeId: rentee1.id,
        startDate: d(-10),
        endDate: d(-7),
        totalPrice: equipment[6].pricePerDay * 3,
        status: "COMPLETED",
      },
    ],
  });

  console.log("Seeded:");
  console.log(`  Users: admin, 1 renter, 2 rentees`);
  console.log(`  Equipment: ${equipment.length} items`);
  console.log(`  Bookings: 5`);
  console.log(`\n  Admin login: artem@trokhymchuk.com / password`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
