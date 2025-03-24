import { config } from "dotenv";
import type { Config } from "drizzle-kit";
config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const connectionString = process.env.DATABASE_URL;
const url = new URL(connectionString);

export default {
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: url.hostname,
    port: parseInt(url.port),
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1),
    ssl: false
  },
} satisfies Config;