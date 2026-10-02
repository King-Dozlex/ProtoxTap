import dotenv from "dotenv";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

dotenv.config({
  path: path.resolve(process.cwd(), "../.env"),
});

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});