import { pool } from "./connection";
import fs from "fs";
import path from "path";

export const runMigration = async (closePool = true) => {
  try {
    console.log("🔗 Connecting to DB...");
    console.log("Host:", process.env.DB_HOST);
    console.log("Database:", process.env.DB_NAME);
    console.log("SSL:", process.env.DB_SSL);
    console.log("Password:", process.env.DB_PASSWORD);
    const dir = path.join(__dirname, "migrations");
    const files = fs.readdirSync(dir).sort();

    for (const file of files) {
      const sql = fs.readFileSync(path.join(dir, file), "utf8");
      console.log(`Running migration: ${file}`);
      await pool.query(sql);
    }

    console.log("✅ All migrations completed");
  } catch (err) {
    console.error("Migration failed", err);
  } finally {
    if (closePool) {
      await pool.end();
    }
  }
};

if (require.main === module) {
  void runMigration();
}
