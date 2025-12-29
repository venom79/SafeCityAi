import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

dotenv.config(); // <-- THIS LINE IS CRITICAL

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
