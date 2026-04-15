"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const common_express_1 = require("@libs/common-express");
const uploadPaths_1 = require("./config/uploadPaths");
const bootstrap_1 = require("./db/bootstrap");
const employee_1 = __importDefault(require("./routes/employee"));
const internal_1 = __importDefault(require("./routes/internal"));
const departments_1 = __importDefault(require("./routes/departments"));
const roleRoutes_1 = __importDefault(require("./routes/roleRoutes"));
const employeeImport_1 = __importDefault(require("./routes/employeeImport"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const locationRoutes_1 = __importDefault(require("./routes/locationRoutes"));
const maritalStatusRoutes_1 = __importDefault(require("./routes/maritalStatusRoutes"));
const genderRoutes_1 = __importDefault(require("./routes/genderRoutes"));
const companyRoutes_1 = __importDefault(require("./routes/companyRoutes"));
const employmentTypeRoutes_1 = __importDefault(require("./routes/employmentTypeRoutes"));
const countryRoutes_1 = __importDefault(require("./routes/countryRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
const identityClient_1 = require("./services/identityClient");
const app = (0, common_express_1.makeApp)();
(0, uploadPaths_1.ensureAvatarDir)();
// Auth-scoped API responses must never be browser-cached across users.
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});
app.use("/uploads", express_1.default.static(path_1.default.resolve(uploadPaths_1.UPLOAD_ROOT), {
    maxAge: process.env.NODE_ENV === "production" ? 7 * 24 * 60 * 60 * 1000 : 0,
}));
// Base routes
app.use("/employees", employee_1.default);
app.use("/internal/employees", internal_1.default);
app.use("/departments", departments_1.default);
app.use("/roles", roleRoutes_1.default);
app.use("/import", employeeImport_1.default);
app.use("/dashboard", dashboardRoutes_1.default);
app.use("/locations", locationRoutes_1.default);
app.use("/genders", genderRoutes_1.default);
app.use("/marital-statuses", maritalStatusRoutes_1.default);
app.use("/companies", companyRoutes_1.default);
app.use("/employment-types", employmentTypeRoutes_1.default);
app.use("/countries", countryRoutes_1.default);
app.use("/profile", profileRoutes_1.default);
// Global error handler
app.use(common_express_1.errorHandler);
const PORT = Number(process.env.PORT) || 3002;
async function start() {
    try {
        const requireIdentity = (process.env.REQUIRE_IDENTITY_ON_BOOT ?? "true").toLowerCase() === "true";
        if (requireIdentity) {
            await (0, identityClient_1.assertIdentityReady)();
            console.log("Identity dependency check passed");
        }
        await (0, bootstrap_1.bootstrapDatabase)();
        app.listen(PORT, () => {
            console.log(`Directory Service running on port ${PORT} 🌍`);
        });
    }
    catch (err) {
        console.error("Failed to bootstrap directory service:", err);
        process.exit(1);
    }
}
void start();
