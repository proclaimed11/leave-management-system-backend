"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bootstrap_1 = require("./bootstrap");
async function runMigration() {
    try {
        await (0, bootstrap_1.bootstrapDatabase)();
        console.log("✅ Database bootstrap and migrations completed");
        process.exit(0);
    }
    catch (err) {
        console.error("Migration failed", err);
        process.exit(1);
    }
}
runMigration();
