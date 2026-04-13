"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
require("dotenv/config");
const pg_1 = require("pg");
/**
 * PostgreSQL `DATE` is a calendar day with no timezone. The default `pg` parser
 * converts it to a JS `Date` at UTC/local boundaries; `JSON.stringify` then
 * emits ISO strings where the first 10 characters can be **one day off** the
 * value stored in `employees` for clients in some timezones.
 *
 * Keep the wire value as `YYYY-MM-DD` so API JSON matches the table exactly.
 */
pg_1.types.setTypeParser(pg_1.types.builtins.DATE, (value) => value);
exports.pool = new pg_1.Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "nabokiLASCAP1998",
    database: process.env.DB_NAME || "directory_svc",
    max: 10,
    idleTimeoutMillis: 30000,
});
