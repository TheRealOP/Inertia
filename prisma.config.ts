import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

config();
// Ensure the CLI picks up the Neon URL from local dev envs.
config({ path: ".env.local", override: true });

export default defineConfig({
  // Prisma CLI uses this file for connection details in v7+.
  schema: "prisma/schema.prisma",
  datasource: {
    // Read DATABASE_URL here instead of schema.prisma.
    url: env("DATABASE_URL"),
  },
});
