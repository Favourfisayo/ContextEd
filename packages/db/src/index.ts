import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

let prisma


const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL})
if(process.env.NODE_ENV === "production") {
    prisma = new PrismaClient({
    adapter
    })
} else {
  prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!
  }).$extends(withAccelerate());
}


export default prisma;
export { Prisma };
