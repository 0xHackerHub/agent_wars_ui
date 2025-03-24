import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { config } from 'dotenv';
config();

const runMigrations = async () => {
const connection = postgres(process.env.DATABASE_URL!);
  const db = drizzle(connection);

  console.log("Running migrations...");
  // await migrate(db, { migrationsFolder: "/app/apps/api/migrations" });
  await migrate(db, { migrationsFolder: "./migrations" });
  console.log("Migrations completed");
  await connection.end();
};

runMigrations().catch(console.error);