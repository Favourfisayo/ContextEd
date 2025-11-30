import { PrismaClient, Prisma } from "../prisma/generated/client";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL as string
});

export default prisma;
export { Prisma };
