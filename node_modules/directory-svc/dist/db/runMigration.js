"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("./connection");
const bootstrap_1 = require("./bootstrap");
async function runMigration() {
    try {
        await (0, bootstrap_1.bootstrapDatabase)();
        console.log("✅ Database bootstrap and migrations completed");
    }
    catch (err) {
        console.error("Migration failed", err);
        process.exitCode = 1;
    }
    finally {
        await connection_1.pool.end();
    }
}
runMigration();
