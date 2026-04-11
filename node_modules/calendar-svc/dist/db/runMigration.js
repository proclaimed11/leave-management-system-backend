"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("./connection");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function runMigrations() {
    try {
        const migrationsPath = path_1.default.join(__dirname, "migrations");
        const files = fs_1.default.readdirSync(migrationsPath).sort();
        for (const file of files) {
            const sql = fs_1.default.readFileSync(path_1.default.join(migrationsPath, file)).toString();
            console.log("Running migration:", file);
            await connection_1.pool.query(sql);
        }
        console.log("Migrations completed successfully.");
        process.exit(0);
    }
    catch (err) {
        console.error("Migration failed", err);
        process.exit(1);
    }
}
runMigrations();
