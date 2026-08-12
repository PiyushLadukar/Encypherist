/**
 * Applies every .sql file in supabase/migrations, in filename order, against
 * SUPABASE_DB_URL (the Postgres connection string from Supabase Project
 * Settings -> Database -> Connection string -> Session pooler).
 *
 * Usage: npm run db:migrate
 */
import "dotenv/config";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { Client } from "pg";

async function main() {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    console.error(
      "SUPABASE_DB_URL is not set. Add it to .env.local (see .env.local.example)."
    );
    process.exit(1);
  }

  const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migration files found.");
    return;
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    for (const file of files) {
      const sql = readFileSync(path.join(migrationsDir, file), "utf-8");
      console.log(`Applying ${file}...`);
      await client.query("begin");
      try {
        await client.query(sql);
        await client.query("commit");
        console.log(`  done.`);
      } catch (err) {
        await client.query("rollback");
        throw err;
      }
    }
    console.log("All migrations applied.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
