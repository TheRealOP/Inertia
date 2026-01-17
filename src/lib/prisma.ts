import { loadEnvConfig } from "@next/env";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

// Align server runtime env loading with Next's .env resolution.
loadEnvConfig(process.cwd());

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL");
}

// Prisma 7 requires an adapter (or Accelerate URL) to connect.
const adapter = new PrismaNeon({ connectionString });

export const prisma = globalThis.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  // Avoid exhausting connections during hot reloads in dev.
  globalThis.prisma = prisma;
}
