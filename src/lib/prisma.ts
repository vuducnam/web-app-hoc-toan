// Prisma client singleton — import this everywhere, NEVER import from @/generated/prisma directly.
// Dev HMR guard: reuses the same PrismaClient across hot-module reloads to avoid
// "too many connections" errors in Next.js dev mode.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const g = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = g.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  g.prisma = prisma;
}
