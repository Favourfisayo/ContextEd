import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../prisma/generated/client";


const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL})
const prisma = new PrismaClient({
  adapter
});

//For development
// const prisma = new PrismaClient({
//   accelerateUrl: process.env.DATABASE_URL!
// }).$extends(withAccelerate());

export default prisma;
export { Prisma };
