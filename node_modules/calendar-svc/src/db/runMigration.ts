import { pool } from "./connection";
import fs from "fs";
import path from "path";

async function runMigrations() {
  try {
    const migrationsPath = path.join(__dirname, "migrations");
    const files = fs.readdirSync(migrationsPath).sort();

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsPath, file)).toString();
      console.log("Running migration:", file);
      await pool.query(sql);
    }

    console.log("Migrations completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed", err);
    process.exit(1);
  }
}

runMigrations();
