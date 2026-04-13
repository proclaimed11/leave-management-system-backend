import fs from "fs";
import path from "path";
import { Client } from "pg";
import { pool } from "./connection";
import { CONFIG } from "../utils/config";
import { seedDefaultAdmin } from "./seedDefaultAdmin";

type MigrationRow = {
  filename: string;
};

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

function quoteIdentifier(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function ensureDatabaseExists(): Promise<void> {
  const autoCreateDb = parseBool(process.env.AUTO_CREATE_DB, false);

  if (!autoCreateDb) {
    console.log("AUTO_CREATE_DB=false -> skipping database creation");
    return;
  }

  const adminClient = new Client({
    host: CONFIG.DB.HOST,
    port: CONFIG.DB.PORT,
    user: CONFIG.DB.USER,
    password: CONFIG.DB.PASSWORD,
    database: process.env.DB_ADMIN_NAME || "postgres",
    ssl: CONFIG.DB.SSL ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await adminClient.connect();

    const exists = await adminClient.query<{ exists: boolean }>(
      `SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = $1) AS exists`,
      [CONFIG.DB.NAME]
    );

    if (exists.rows[0]?.exists) {
      console.log(`Database '${CONFIG.DB.NAME}' already exists`);
      return;
    }

    const safeDbName = quoteIdentifier(CONFIG.DB.NAME);
    await adminClient.query(`CREATE DATABASE ${safeDbName}`);
    console.log(`Created database '${CONFIG.DB.NAME}'`);
  } finally {
    await adminClient.end();
  }
}

export async function runPendingMigrations(): Promise<void> {
  const migrationsDir = path.join(__dirname, "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  const alreadyApplied = await pool.query<MigrationRow>(
    `SELECT filename FROM schema_migrations`
  );
  const appliedSet = new Set(alreadyApplied.rows.map((r) => r.filename));

  for (const file of files) {
    if (appliedSet.has(file)) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`Running migration: ${file}`);

    await pool.query("BEGIN");
    try {
      await pool.query(sql);
      await pool.query(
        `INSERT INTO schema_migrations (filename) VALUES ($1)`,
        [file]
      );
      await pool.query("COMMIT");
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  }
}

export async function bootstrapDatabase(): Promise<void> {
  await ensureDatabaseExists();
  await runPendingMigrations();
  await seedDefaultAdmin();
}
