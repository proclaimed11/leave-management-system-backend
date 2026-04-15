"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDatabaseExists = ensureDatabaseExists;
exports.runPendingMigrations = runPendingMigrations;
exports.bootstrapDatabase = bootstrapDatabase;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
const connection_1 = require("./connection");
const runSeedDemoEmployees_1 = require("./runSeedDemoEmployees");
function parseBool(value, fallback) {
    if (value === undefined)
        return fallback;
    return value.toLowerCase() === "true";
}
function quoteIdentifier(value) {
    return `"${value.replace(/"/g, '""')}"`;
}
function getDbConfig() {
    return {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "directory_svc",
    };
}
async function ensureDatabaseExists() {
    const autoCreateDb = parseBool(process.env.AUTO_CREATE_DB, false);
    if (!autoCreateDb) {
        console.log("AUTO_CREATE_DB=false -> skipping database creation");
        return;
    }
    const cfg = getDbConfig();
    const adminClient = new pg_1.Client({
        host: cfg.host,
        port: cfg.port,
        user: cfg.user,
        password: cfg.password,
        database: process.env.DB_ADMIN_NAME || "postgres",
    });
    try {
        await adminClient.connect();
        const exists = await adminClient.query(`SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = $1) AS exists`, [cfg.database]);
        if (exists.rows[0]?.exists) {
            console.log(`Database '${cfg.database}' already exists`);
            return;
        }
        await adminClient.query(`CREATE DATABASE ${quoteIdentifier(cfg.database)}`);
        console.log(`Created database '${cfg.database}'`);
    }
    finally {
        await adminClient.end();
    }
}
async function runPendingMigrations() {
    const migrationsDir = path_1.default.join(__dirname, "migrations");
    const files = fs_1.default
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith(".sql"))
        .sort();
    await connection_1.pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
    const alreadyApplied = await connection_1.pool.query(`SELECT filename FROM schema_migrations`);
    const appliedSet = new Set(alreadyApplied.rows.map((r) => r.filename));
    for (const file of files) {
        if (appliedSet.has(file))
            continue;
        const sql = fs_1.default.readFileSync(path_1.default.join(migrationsDir, file), "utf8");
        console.log(`Running migration: ${file}`);
        await connection_1.pool.query("BEGIN");
        try {
            await connection_1.pool.query(sql);
            await connection_1.pool.query(`INSERT INTO schema_migrations (filename) VALUES ($1)`, [file]);
            await connection_1.pool.query("COMMIT");
        }
        catch (err) {
            await connection_1.pool.query("ROLLBACK");
            throw err;
        }
    }
}
async function bootstrapDatabase() {
    await ensureDatabaseExists();
    await runPendingMigrations();
    const autoSeedDemoUsers = parseBool(process.env.AUTO_SEED_DEMO_USERS, true);
    if (autoSeedDemoUsers) {
        await (0, runSeedDemoEmployees_1.seedDemoEmployees)();
    }
}
