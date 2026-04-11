import { pool } from "./connection";
import { bootstrapDatabase } from "./bootstrap";

async function runMigration() {
  try {
    await bootstrapDatabase();
    console.log("✅ Database bootstrap and migrations completed");
  } catch (err) {
    console.error("Migration failed", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigration();
