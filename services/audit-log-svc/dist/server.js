"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const common_express_1 = require("@libs/common-express");
const audit_1 = __importDefault(require("./routes/audit"));
const bootstrap_1 = require("./db/bootstrap");
const app = (0, common_express_1.makeApp)();
app.use("/audit", audit_1.default);
const PORT = process.env.PORT || 3003;
async function start() {
    try {
        await (0, bootstrap_1.bootstrapDatabase)();
        app.listen(PORT, () => {
            console.log(`📜 Audit Log Service running on port ${PORT}`);
        });
    }
    catch (err) {
        console.error("Failed to bootstrap audit-log service:", err);
        process.exit(1);
    }
}
void start();
