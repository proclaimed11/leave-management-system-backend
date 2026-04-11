import { pool } from "./connection";
import { bootstrapDatabase } from "./bootstrap";

async function runMigration() {
  try {
    await bootstrapDatabase();
    console.log("✅ Database bootstrap and migrations completed");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed", err);
    process.exit(1);
  }
}

runMigration();
