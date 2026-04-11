"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.assertDb = assertDb;
const pg_1 = require("pg");
const config_1 = require("../utils/config");
const ssl = config_1.CONFIG.DB.SSL
    ? { rejectUnauthorized: false }
    : undefined;
exports.pool = new pg_1.Pool({
    host: config_1.CONFIG.DB.HOST,
    port: config_1.CONFIG.DB.PORT,
    user: config_1.CONFIG.DB.USER,
    password: config_1.CONFIG.DB.PASSWORD,
    database: config_1.CONFIG.DB.NAME,
    ssl,
    max: 15, // connection pool size
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
});
// optional: simple health check
async function assertDb() {
    await exports.pool.query("SELECT 1");
}
