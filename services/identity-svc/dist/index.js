"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
const bootstrap_1 = require("./db/bootstrap");
const PORT = Number(process.env.PORT) || 3001;
async function start() {
    try {
        await (0, bootstrap_1.bootstrapDatabase)();
        server_1.default.listen(PORT, () => {
            console.log(`Identity Service listening on port ${PORT}`);
        });
    }
    catch (err) {
        console.error("Failed to bootstrap identity service:", err);
        process.exit(1);
    }
}
void start();
